"use client";
import { useEffect, useState } from "react";
import Header from "@/components/shared-components/Header";
import {
  BadgeCheck,
  Calendar,
  CreditCard,
  FileText,
  List,
  LayoutGrid,
  Download,
  Eye,
  MoreVertical,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// TypeScript interfaces
interface Plan {
  _id: string;
  name: string;
  premium: number;
  coverageAmount: number;
  coverageDurationMonths: number;
}

interface Policy {
  _id: string;
  policyNumber: string;
  plan?: Plan;
  bodaRegNo: string;
  startDate: string;
  endDate: string;
  premiumPaid: string | number; // Allow string or number to handle backend response
  status: string;
  orderEscrowId?: string;
  chainTx?: string;
  createdAt: string;
}

interface FormData {
  bodaRegNo: string;
  plan: string;
  startDate: string;
}

interface InitResult {
  status: string;
  policyId?: string;
  orderId?: string;
}

interface CompleteResult {
  policy?: {
    policyNumber: string;
  };
  blockchain?: {
    transactionHash: string;
  };
}

interface PolicySummary {
  planName: string;
  bodaRegNo: string;
  startDate: string;
  endDate: string;
  premiumPaid: number;
  coverageAmount: number;
  rider: string;
  phone_number: string;
  currency: string;
}

function getStatusColor(status?: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    "expiring soon": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    expired: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return status ? colors[status.toLowerCase()] || "" : "";
}

function getStatusIcon(status?: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return <CheckCircle2 size={14} />;
    case "expiring soon":
      return <AlertTriangle size={14} />;
    case "expired":
      return <X size={14} />;
    default:
      return null;
  }
}

function copyToClipboard(text?: string) {
  if (text) {
    navigator.clipboard.writeText(`0x${text}`).catch(err => console.error("Failed to copy to clipboard:", err));
  }
}

function openExplorer(hash?: string) {
  if (hash) {
    window.open(`https://base-sepolia.blockscout.com/tx/0x${hash}`, "_blank");
  }
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [inputOpen, setInputOpen] = useState<boolean>(false);
  const [summaryOpen, setSummaryOpen] = useState<boolean>(false);
  const [form, setForm] = useState<FormData>({
    bodaRegNo: "",
    plan: "",
    startDate: "",
  });
  const [initResult, setInitResult] = useState<InitResult | null>(null);
  const [completeResult, setCompleteResult] = useState<CompleteResult | null>(null);
  const [polling, setPolling] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const token = localStorage.getItem('jwt') || "";
  const phone_number = localStorage.getItem('user_phone') || "";
  const rider = JSON.parse(localStorage.getItem('user') || '{}')?.walletAddress || "";
  const formattedPhoneNumber = phone_number; // Use phone_number as-is, no "+" prefix

  useEffect(() => {
    if (!token) {
      setPaymentError("No JWT token found. Please log in again.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/api/v1/insurance/policies/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        setPolicies((data.policies || []) as Policy[]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching policies:", err);
        setLoading(false);
        setPaymentError("Failed to fetch policies. Please try again.");
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8000/api/v1/insurance/plans", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setPlans((data.plans || []) as Plan[]))
      .catch(err => console.error("Error fetching plans:", err));
  }, [token]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;
    if (polling && initResult?.orderId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/v1/insurance/policies/payment-status/${initResult.orderId}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          const data = await res.json();
          console.log("Payment Status Response:", JSON.stringify(data, null, 2));
          if (data.data?.status === "success" && ["completed", "submitted", "settled"].includes(data.data.data?.status)) {
            await handleCompletePolicy();
            clearInterval(interval);
            clearTimeout(timeout);
            setPolling(false);
          }
        } catch (err) {
          console.error("Payment check failed:", err);
        }
      }, 2000); // Polling every 2 seconds

      timeout = setTimeout(() => {
        clearInterval(interval);
        setPolling(false);
        setPaymentError("Payment confirmation timed out. Please check manually or try again.");
      }, 600000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [polling, initResult, token]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleReviewPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlan = plans.find(plan => plan._id === form.plan);
    if (!selectedPlan) {
      setPaymentError("Please select a valid plan");
      return;
    }
    if (!form.bodaRegNo || !form.startDate || !rider || !formattedPhoneNumber) {
      setPaymentError("Please fill in all required fields and ensure wallet address and phone number are set");
      return;
    }
    setInputOpen(false);
    setSummaryOpen(true);
  };

  const handleInitiatePolicy = async () => {
    setInitResult(null);
    setCompleteResult(null);
    setPaymentError(null);

    const selectedPlan = plans.find(plan => plan._id === form.plan);
    if (!selectedPlan) {
      setPaymentError("Please select a valid plan");
      return;
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + selectedPlan.coverageDurationMonths);

    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    const payload = {
      user: "68f70071e2f20ab129145383",
      bodaRegNo: form.bodaRegNo,
      plan: form.plan,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      premiumPaid: Number(selectedPlan.premium), // Number, as per payload
      coverageAmount: Number(selectedPlan.coverageAmount), // Number, as per payload
      rider: "0x93fa9484c018B2AFaA7a1924aAC566e907110cb1",
      token: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      premium: (selectedPlan.premium * 1000000).toString(), // String, as per payload
      user_address: "0x80569F788Ca7564429feB8Aabdd4Ff73e0aC98E0",
      amount_fiat: Number(selectedPlan.premium), // Number, as per payload
      phone_number: formattedPhoneNumber, // No "+" prefix
      currency: "KES"
    };

    console.log("Initiate Policy Payload:", JSON.stringify(payload, null, 2));

    if (!token) {
      setPaymentError("No JWT token found. Please log in again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/v1/insurance/policies/initiate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Initiate Policy Error Response:", errorText);
        throw new Error(`HTTP error! Status: ${res.status}, Message: ${errorText || 'Unknown error'}`);
      }

      const result: InitResult = await res.json();
      console.log("Initiate Policy Response:", JSON.stringify(result, null, 2));
      setInitResult(result);
      if (result.status === "pending_payment") {
        setSummaryOpen(false);
        setPolling(true);
      }
    } catch (err: any) {
      console.error("Error initiating policy:", err);
      setPaymentError(`Failed to initiate policy: ${err.message}. Please try again or contact support.`);
      setSummaryOpen(false);
    }
  };

  const handleCompletePolicy = async () => {
    if (!initResult?.policyId || !initResult?.orderId) {
      setPaymentError("Missing policy or order ID. Please try initiating again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/v1/insurance/policies/complete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          policyId: initResult.policyId,
          orderId: initResult.orderId
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Complete Policy Error Response:", errorText);
        throw new Error(`HTTP error! Status: ${res.status}, Message: ${errorText || 'Unknown error'}`);
      }

      const result: CompleteResult = await res.json();
      setCompleteResult(result);
      fetch("http://localhost:8000/api/v1/insurance/policies/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(data => {
          setPolicies((data.policies || []) as Policy[]);
        })
        .catch(err => console.error("Error refreshing policies:", err));
    } catch (err: any) {
      console.error("Error completing policy:", err);
      setPaymentError(`Failed to complete policy: ${err.message}. Please try again or contact support.`);
    }
  };

  const filteredPolicies = policies.filter(policy =>
    (policy.policyNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.plan?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.bodaRegNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy._id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = policies.filter(p => p.status.toLowerCase() === "active").length;
  const expiringCount = policies.filter(p => p.status.toLowerCase() === "expiring soon").length;
  const expiredCount = policies.filter(p => p.status.toLowerCase() === "expired").length;

  const getPolicySummary = (): PolicySummary | null => {
    const selectedPlan = plans.find(plan => plan._id === form.plan);
    if (!selectedPlan) return null;
    const startDate = new Date(form.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + selectedPlan.coverageDurationMonths);

    return {
      planName: selectedPlan.name,
      bodaRegNo: form.bodaRegNo,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      premiumPaid: Number(selectedPlan.premium), // Number, as per payload
      coverageAmount: Number(selectedPlan.coverageAmount), // Number, as per payload
      rider,
      phone_number: formattedPhoneNumber, // No "+" prefix
      currency: "KES"
    };
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0b0b] flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Insurance Policies</h1>
              <p className="text-gray-400 text-sm">
                Manage your active and expired insurance policies
              </p>
            </div>
            <Dialog open={inputOpen} onOpenChange={setInputOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#d9fc09] text-[#161616] hover:bg-[#e5ff1a] font-semibold">
                  <BadgeCheck size={18} />
                  New Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#161616] border border-[#232323] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">Initiate New Policy</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Fill in the details to create a new insurance policy for your vehicle.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReviewPolicy} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-gray-400 capitalize">Boda Reg No</label>
                      <Input
                        type="text"
                        name="bodaRegNo"
                        value={form.bodaRegNo}
                        onChange={handleFormChange}
                        required
                        className="bg-[#232323] border-[#2a2a2a] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-gray-400 capitalize">Plan</label>
                      <Select
                        onValueChange={(value) => setForm(prev => ({ ...prev, plan: value }))}
                        value={form.plan}
                      >
                        <SelectTrigger className="bg-[#232323] border-[#2a2a2a] text-white">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#232323] border-[#2a2a2a]">
                          {plans.map(plan => (
                            <SelectItem key={plan._id} value={plan._id} className="text-white hover:bg-[#2a2a2a]">
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-gray-400 capitalize">Start Date</label>
                      <Input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleFormChange}
                        required
                        className="bg-[#232323] border-[#2a2a2a] text-white"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-[#d9fc09] text-[#161616] hover:bg-[#e5ff1a] font-semibold w-full">
                    Review Policy
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
              <DialogContent className="bg-[#161616] border border-[#232323] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">Policy Summary</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Review the policy details before confirming.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {getPolicySummary() && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Plan</p>
                        <p className="text-white">{getPolicySummary()?.planName}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Boda Registration No</p>
                        <p className="text-white">{getPolicySummary()?.bodaRegNo}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Start Date</p>
                        <p className="text-white">{getPolicySummary()?.startDate}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">End Date</p>
                        <p className="text-white">{getPolicySummary()?.endDate}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Premium Paid</p>
                        <p className="text-white">{getPolicySummary()?.premiumPaid} KES</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Coverage Amount</p>
                        <p className="text-white">{getPolicySummary()?.coverageAmount} KES</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Rider Address</p>
                        <p className="text-white font-mono text-sm truncate">{getPolicySummary()?.rider}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Phone Number</p>
                        <p className="text-white">{getPolicySummary()?.phone_number}</p>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    variant="outline"
                    className="border-[#232323] hover:bg-[#232323] hover:text-[#d9fc09]"
                    onClick={() => {
                      setSummaryOpen(false);
                      setInputOpen(true);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    className="bg-[#d9fc09] text-[#161616] hover:bg-[#e5ff1a] font-semibold"
                    onClick={handleInitiatePolicy}
                  >
                    Confirm and Initiate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[#161616] border border-[#232323] rounded-xl p-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input
                type="text"
                placeholder="Search by ID, type, vehicle, or policy hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#232323] border-[#2a2a2a] text-white placeholder:text-gray-500 focus-visible:ring-[#d9fc09]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-[#232323] hover:bg-[#232323]">
                <Filter size={16} />
                Filter
              </Button>
              <div className="flex items-center bg-[#232323] rounded-lg p-1 border border-[#2a2a2a]">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === "table"
                    ? "bg-[#d9fc09] text-[#161616]"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === "list"
                    ? "bg-[#d9fc09] text-[#161616]"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#161616] border border-[#232323] rounded-xl p-5 hover:border-[#2a2a2a] transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Policies</p>
                <p className="text-2xl font-bold text-white">{activeCount}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-[#161616] border border-[#232323] rounded-xl p-5 hover:border-[#2a2a2a] transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Expiring Soon</p>
                <p className="text-2xl font-bold text-white">{expiringCount}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="text-yellow-400" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-[#161616] border border-[#232323] rounded-xl p-5 hover:border-[#2a2a2a] transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Expired</p>
                <p className="text-2xl font-bold text-white">{expiredCount}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <X className="text-red-400" size={24} />
              </div>
            </div>
          </div>
        </div>
        {polling && (
          <Alert className="bg-[#161616] border-[#232323] mb-6">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertTitle className="text-white">Waiting for Payment</AlertTitle>
            <AlertDescription className="text-gray-300">
              Please complete the payment on your phone. We're checking for confirmation... Order ID: {initResult?.orderId || "N/A"}
            </AlertDescription>
          </Alert>
        )}
        {paymentError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}
        {initResult?.orderId && !polling && !completeResult && (
          <div className="bg-[#161616] border border-[#232323] p-6 rounded-xl max-w-xl mx-auto mb-6">
            <p className="text-white font-bold mb-3">Payment Required</p>
            <div className="text-gray-300 text-sm mb-2">
              Please complete payment. Order ID: <span className="font-mono text-[#d9fc09]">{initResult.orderId}</span>
            </div>
            <Button className="bg-[#d9fc09] text-[#161616] font-semibold mt-3" onClick={handleCompletePolicy}>
              Complete Policy
            </Button>
          </div>
        )}
        {completeResult?.policy && (
          <div className="bg-green-900 border border-green-500 p-6 rounded-xl max-w-xl mx-auto mb-6">
            <p className="text-white font-bold mb-3">Policy Created Successfully</p>
            <div className="text-gray-300 text-sm mb-2">
              Policy Number: <span className="font-mono text-[#d9fc09]">{completeResult.policy.policyNumber}</span>
            </div>
            <div className="text-gray-300 text-sm mb-2">
              Transaction Hash: <span className="font-mono text-[#d9fc09]">{completeResult.blockchain?.transactionHash || "N/A"}</span>
            </div>
            <Button className="bg-[#d9fc09] text-[#161616] font-semibold mt-3" onClick={() => setCompleteResult(null)}>
              Close
            </Button>
          </div>
        )}
        {viewMode === "table" ? (
          <div className="bg-[#161616] border border-[#232323] rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-[#1a1a1a]">
                <TableRow className="border-b border-[#232323] hover:bg-transparent">
                  <TableHead className="text-gray-400 font-semibold">Policy ID</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Type</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Vehicle</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Coverage Period</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Premium</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Policy Record</TableHead>
                  <TableHead className="text-right text-gray-400 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.length > 0 ? (
                    filteredPolicies.map((policy) => (
                      <TableRow
                        key={policy._id}
                        className="border-b border-[#232323] hover:bg-[#1a1a1a] transition"
                      >
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="text-[#d9fc09]" size={18} />
                            {policy.policyNumber || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{policy.plan?.name || "Unknown Plan"}</TableCell>
                        <TableCell className="text-gray-300">{policy.bodaRegNo || "N/A"}</TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar size={12} className="text-gray-500" />
                              {policy.startDate ? new Date(policy.startDate).toLocaleDateString() : "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              to {policy.endDate ? new Date(policy.endDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-semibold">KES {policy.premiumPaid || "0"}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(policy.status)} border font-medium flex items-center gap-1 w-fit`}>
                            {getStatusIcon(policy.status)}
                            {policy.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => openExplorer(policy.orderEscrowId)}
                                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#d9fc09] transition group"
                                  disabled={!policy.orderEscrowId}
                                >
                                  <FileCheck size={14} className="text-gray-500 group-hover:text-[#d9fc09]" />
                                  <span className="font-mono">{policy.orderEscrowId?.slice(0, 10) || "N/A"}...</span>
                                  {policy.orderEscrowId && <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition" />}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#232323] border-[#2a2a2a] text-white">
                                <p className="text-xs">View policy record</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-[#232323]">
                                  <MoreVertical size={18} className="text-gray-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#232323] border-[#2a2a2a]">
                                <DropdownMenuItem
                                  onClick={() => copyToClipboard(policy.orderEscrowId)}
                                  className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                                  disabled={!policy.orderEscrowId}
                                >
                                  <Copy size={16} className="mr-2" />
                                  Copy Policy Hash
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openExplorer(policy.orderEscrowId)}
                                  className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                                  disabled={!policy.orderEscrowId}
                                >
                                  <ExternalLink size={16} className="mr-2" />
                                  View Record
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        No policies found matching your search.
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="bg-[#161616] border border-[#232323] rounded-xl p-12 text-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => (
                  <div
                    key={policy._id}
                    className="bg-[#161616] border border-[#232323] rounded-xl p-6 hover:border-[#2a2a2a] transition-all group"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#d9fc09]/10 rounded-xl group-hover:bg-[#d9fc09]/20 transition">
                            <BadgeCheck className="text-[#d9fc09]" size={28} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-white">{policy.policyNumber || "N/A"}</h3>
                              <Badge className={`${getStatusColor(policy.status)} border flex items-center gap-1`}>
                                {getStatusIcon(policy.status)}
                                {policy.status || "Unknown"}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="text-sm font-medium">{policy.plan?.name || "Unknown Plan"} Policy</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                {policy.bodaRegNo || "N/A"}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar size={14} />
                                {policy.startDate ? new Date(policy.startDate).toLocaleDateString() : "N/A"} → {policy.endDate ? new Date(policy.endDate).toLocaleDateString() : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-500">Annual Premium</span>
                          <span className="text-xl font-bold text-white flex items-center gap-2">
                            <CreditCard size={18} className="text-[#d9fc09]" />
                            KES {policy.premiumPaid || "0"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#232323] rounded-lg p-4 border border-[#2a2a2a]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#d9fc09]/10 rounded-lg">
                              <ShieldCheck className="text-[#d9fc09]" size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Policy Record</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-white">{policy.chainTx?.slice(0, 10) || "N/A"}...</span>
                                <button
                                  onClick={() => copyToClipboard(policy.orderEscrowId)}
                                  className="text-gray-500 hover:text-[#d9fc09] transition"
                                  disabled={!policy.orderEscrowId}
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => openExplorer(policy.chainTx)}
                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg text-sm text-gray-300 hover:text-[#d9fc09] transition group"
                            disabled={!policy.chainTx}
                          >
                            <span>View Record</span>
                            {policy.chainTx && <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />}
                          </button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-center gap-6 text-xs text-gray-500">
                          <div>
                            <span className="text-gray-600">Timestamp:</span>
                            <span className="ml-1">{policy.createdAt ? new Date(policy.createdAt).toLocaleString() : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#232323] hover:bg-[#232323] hover:text-[#d9fc09] flex-1"
                        >
                          <Eye size={16} />
                          View Policy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#232323] hover:bg-[#232323] hover:text-[#d9fc09] flex-1"
                        >
                          <Download size={16} />
                          Download
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-[#232323]">
                              <MoreVertical size={18} className="text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#232323] border-[#2a2a2a]">
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(policy.orderEscrowId)}
                              className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                              disabled={!policy.orderEscrowId}
                            >
                              <Copy size={16} className="mr-2" />
                              Copy Policy Hash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                            >
                              <FileText size={16} className="mr-2" />
                              Request Certificate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#161616] border border-[#232323] rounded-xl p-12 text-center">
                  <p className="text-gray-500">No policies found matching your search.</p>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}