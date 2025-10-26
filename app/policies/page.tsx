"use client";
import { useEffect, useState } from "react";
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
  X,
  Phone,
  Wallet
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
import Header from "@/components/shared-components/Header";
// API Configuration
const API_BASE_URL = "http://localhost:8000/api/v1";

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
  premiumPaid: string | number;
  status: string;
  orderEscrowId?: string;
  chainTx?: string;
  policyId?: string;
  createdAt: string;
  orderEscrowStatus?: string;
}

interface FormData {
  bodaRegNo: string;
  plan: string;
  startDate: string;
  phoneNumber: string;
  mobileNetwork: string;
}

interface InitResult {
  message: string;
  policyNumber: string;
  transactionId: string;
  policyId: string;
  status: string;
  instructions: string;
}

interface CompleteResult {
  message: string;
  policy: {
    _id: string;
    policyNumber: string;
    bodaRegNo: string;
    plan: string;
    status: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
    premiumPaid: number;
    coverageAmount: number;
    rider: string;
    createdAt: string;
  };
  blockchain: {
    policyId: string;
    transactionHash: string;
    blockNumber: number;
    approvalTx?: string;
    chain: string;
    paymasterPaid: boolean;
  };
  payment: {
    transactionId: string;
    status: string;
    amountKES: number;
    amountUSDC: number;
    provider: string;
  };
}

function getStatusColor(status?: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "expiring soon": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    expired: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return status ? colors[status.toLowerCase()] || "" : "";
}

function getStatusIcon(status?: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return <CheckCircle2 size={14} />;
    case "paused":
      return <Clock size={14} />;
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
    const fullText = text.startsWith('0x') ? text : `0x${text}`;
    navigator.clipboard.writeText(fullText)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error("Failed to copy:", err));
  }
}

function openExplorer(hash?: string) {
  if (hash) {
    const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
    window.open(`https://basescan.org/tx/${cleanHash}`, "_blank");
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
    phoneNumber: "",
    mobileNetwork: "Safaricom"
  });
  const [initResult, setInitResult] = useState<InitResult | null>(null);
  const [completeResult, setCompleteResult] = useState<CompleteResult | null>(null);
  const [polling, setPolling] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");

  const token = localStorage.getItem('jwt') || "";
  const userStr = localStorage.getItem('user') || '{}';
  const user = JSON.parse(userStr);
  const rider = user?.walletAddress || "";

  // Fetch user policies
  useEffect(() => {
    if (!token) {
      setPaymentError("No JWT token found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchPolicies();
  }, [token]);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/insurance/policies/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error('Failed to fetch policies');

      const data = await res.json();
      setPolicies((data.policies || []) as Policy[]);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching policies:", err);
      setLoading(false);
      setPaymentError("Failed to fetch policies. Please try again.");
    }
  };

  // Fetch available plans
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE_URL}/insurance/plans`, {
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

  // Poll payment status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (polling && initResult?.transactionId) {
      console.log(`Starting to poll for transaction: ${initResult.transactionId}`);

      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/insurance/policies/payment-status/${initResult.transactionId}`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ currencyCode: "KES" })
            }
          );

          const data = await res.json();
          console.log("Payment Status:", data);

          // Normalize all possible response structures
          const status =
            data?.status?.toUpperCase() ||                // backend flattened status field
            data?.details?.status?.toUpperCase() ||       // if nested under 'details' (like recent payload)
            data?.data?.status?.toUpperCase() ||          // legacy Pretium response
            data?.data?.transaction_status?.toUpperCase() ||
            "UNKNOWN";

          console.log("🧾 Current Payment Status:", status, data);
          setPaymentStatus(status);

          // ✅ Handle Completed / Success
          if (["COMPLETE", "COMPLETED", "SUCCESS"].includes(status)) {
            console.log("✅ Payment confirmed! Completing policy...");
            clearInterval(interval);
            clearTimeout(timeout);
            setPolling(false);
            await handleCompletePolicy();
          }

          // ❌ Handle Failed / Rejected
          else if (["FAILED", "REJECTED"].includes(status)) {
            console.warn(`❌ Payment failed or rejected (${status})`);
            clearInterval(interval);
            clearTimeout(timeout);
            setPolling(false);
            setPaymentError(`Payment ${status}. Please try again.`);
          }

          // ⏳ Handle Pending / Other
          else if (["PENDING", "PROCESSING", "AWAITING"].includes(status)) {
            console.log(`⏳ Payment still pending: (${status})...`);
          } else {
            console.log(`⚠️ Unknown status response: ${status}`);
          }

        } catch (err) {
          console.error("Payment check failed:", err);
        }
      }, 5000); // Poll every 5 seconds

      timeout = setTimeout(() => {
        clearInterval(interval);
        setPolling(false);
        setPaymentError("Payment confirmation timed out. Manually try again if payment succeeded.");
      }, 300000); // Stop after 5 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
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
    if (!form.bodaRegNo || !form.startDate || !form.phoneNumber) {
      setPaymentError("Please fill in all required fields");
      return;
    }
    if (!rider) {
      setPaymentError("Wallet address not found. Please ensure you're logged in.");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(form.phoneNumber.replace(/\s+/g, ''))) {
      setPaymentError("Invalid phone number. Use format: 0712345678 or 254712345678");
      return;
    }

    setPaymentError(null);
    setInputOpen(false);
    setSummaryOpen(true);
  };

  const handleInitiatePolicy = async () => {
    setInitResult(null);
    setCompleteResult(null);
    setPaymentError(null);
    setPaymentStatus("");

    const selectedPlan = plans.find(plan => plan._id === form.plan);
    if (!selectedPlan) {
      setPaymentError("Please select a valid plan");
      return;
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + selectedPlan.coverageDurationMonths);

    // Clean phone number - remove spaces, handle different formats
    let cleanPhone = form.phoneNumber.trim().replace(/\s+/g, '');

    // The backend expects format starting with 07 or 254
    if (cleanPhone.startsWith('+254')) {
      cleanPhone = '0' + cleanPhone.slice(4);
    } else if (cleanPhone.startsWith('254')) {
      cleanPhone = '0' + cleanPhone.slice(3);
    } else if (/^7\d{8}$/.test(cleanPhone)) {
      cleanPhone = '0' + cleanPhone;
    }

    const payload = {
      bodaRegNo: form.bodaRegNo,
      plan: form.plan,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      premiumPaid: selectedPlan.premium,
      coverageAmount: selectedPlan.coverageAmount,
      insuredBikeDetails: {
        registrationNumber: form.bodaRegNo,
        // Add other bike details if available
      },
      rider: rider,
      phone_number: cleanPhone,
      mobile_network: form.mobileNetwork,
      amount_kes: selectedPlan.premium
    };

    console.log("Initiate Policy Payload:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch(`${API_BASE_URL}/insurance/policies/initiate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      const result: InitResult = await res.json();
      console.log("Initiate Policy Response:", JSON.stringify(result, null, 2));

      setInitResult(result);

      if (result.status === "pending_payment") {
        setSummaryOpen(false);
        setPolling(true);
        setPaymentStatus("waiting for confirmation...");
      }
    } catch (err: any) {
      console.error("Error initiating policy:", err);
      setPaymentError(err.message || "Failed to initiate policy. Please try again.");
      setSummaryOpen(false);
    }
  };

  const handleCompletePolicy = async () => {
    if (!initResult?.policyId || !initResult?.transactionId) {
      setPaymentError("Missing policy or transaction ID. Please try initiating again.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/insurance/policies/complete`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          policyId: initResult.policyId,
          transactionId: initResult.transactionId,
          chain: "BASE" // or get from config
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      const result: CompleteResult = await res.json();
      console.log("Complete Policy Response:", JSON.stringify(result, null, 2));

      setCompleteResult(result);
      setInitResult(null);
      setPaymentStatus("");

      // Refresh policies list
      await fetchPolicies();
    } catch (err: any) {
      console.error("Error completing policy:", err);
      setPaymentError(err.message || "Failed to complete policy. Please try again or contact support.");
    }
  };

  const filteredPolicies = policies.filter(policy =>
    (policy.policyNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.plan?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.bodaRegNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy._id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = policies.filter(p => p.status.toLowerCase() === "active").length;
  const pausedCount = policies.filter(p => p.status.toLowerCase() === "paused").length;
  const expiredCount = policies.filter(p => p.status.toLowerCase() === "expired").length;

  const selectedPlan = plans.find(plan => plan._id === form.plan);

  return (
    <div className="min-h-screen w-full bg-[#0a0b0b] p-8">
      <Header />
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Insurance Policies</h1>
              <p className="text-gray-400 text-sm">
                Manage your active and expired insurance policies
              </p>
            </div>
            <Dialog open={inputOpen} onOpenChange={setInputOpen}>
              <Button
                onClick={() => setInputOpen(true)}
                className="bg-[#d9fc09] cursor-pointer text-[#161616] hover:bg-[#e5ff1a] font-semibold"
              >
                <BadgeCheck size={18} className="mr-2" />
                New Policy
              </Button>
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
                        placeholder="e.g., KBZ 123A"
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
                              {plan.name} - KES {plan.premium}
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
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-[#232323] border-[#2a2a2a] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-gray-400 capitalize">Mobile Network</label>
                      <Select
                        onValueChange={(value) => setForm(prev => ({ ...prev, mobileNetwork: value }))}
                        value={form.mobileNetwork}
                      >
                        <SelectTrigger className="bg-[#232323] border-[#2a2a2a] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#232323] border-[#2a2a2a]">
                          <SelectItem value="Safaricom" className="text-white hover:bg-[#2a2a2a]">
                            Safaricom (M-PESA)
                          </SelectItem>
                          <SelectItem value="Airtel" className="text-white hover:bg-[#2a2a2a]">
                            Airtel Money
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-gray-400 capitalize flex items-center gap-2">
                        <Phone size={16} />
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleFormChange}
                        placeholder="0712345678 or 254712345678"
                        required
                        className="bg-[#232323] border-[#2a2a2a] text-white"
                      />
                      <p className="text-xs text-gray-500">Format: 0712345678 or 254712345678</p>
                    </div>
                    {rider && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-gray-400 capitalize flex items-center gap-2">
                          <Wallet size={16} />
                          Wallet Address (Beneficiary)
                        </label>
                        <Input
                          type="text"
                          value={rider}
                          disabled
                          className="bg-[#232323] border-[#2a2a2a] text-gray-400 font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="bg-[#d9fc09] cursor-pointer text-[#161616] hover:bg-[#e5ff1a] font-semibold w-full">
                    Review Policy
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Summary Dialog */}
            <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
              <DialogContent className="bg-[#161616] border border-[#232323] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">Policy Summary</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Review the policy details before confirming payment.
                  </DialogDescription>
                </DialogHeader>
                {selectedPlan && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#232323] rounded-lg">
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Plan</p>
                        <p className="text-white font-semibold">{selectedPlan.name}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Boda Registration No</p>
                        <p className="text-white">{form.bodaRegNo}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Start Date</p>
                        <p className="text-white">{new Date(form.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">End Date</p>
                        <p className="text-white">
                          {new Date(new Date(form.startDate).setMonth(new Date(form.startDate).getMonth() + selectedPlan.coverageDurationMonths)).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Premium</p>
                        <p className="text-white font-bold text-lg">KES {selectedPlan.premium.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Coverage Amount</p>
                        <p className="text-white font-semibold">KES {selectedPlan.coverageAmount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Payment Number</p>
                        <p className="text-white">{form.phoneNumber}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Network</p>
                        <p className="text-white">{form.mobileNetwork}</p>
                      </div>
                    </div>
                    <Alert className="bg-blue-500/10 border-blue-500/20">
                      <AlertTitle className="text-blue-400">Payment Instructions</AlertTitle>
                      <AlertDescription className="text-gray-300">
                        After clicking "Confirm", you'll receive a payment prompt on your phone.
                        Enter your M-PESA/Airtel PIN to complete the transaction.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
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
                    Confirm and Pay
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[#161616] border border-[#232323] rounded-xl p-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#232323] border-[#2a2a2a] text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
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

        {/* Status Cards */}
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
                <p className="text-gray-400 text-sm mb-1">Pending</p>
                <p className="text-2xl font-bold text-white">{pausedCount}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="text-yellow-400" size={24} />
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

        {/* Payment Status Alerts */}
        {polling && (
          <Alert className="bg-[#161616] border-[#232323] mb-6">
            <RefreshCw className="h-4 w-4 animate-spin text-[#d9fc09]" />
            <AlertTitle className="text-white">Waiting for Payment Confirmation</AlertTitle>
            <AlertDescription className="text-gray-300">
              <div className="space-y-2 mt-2">
                <p>Please complete the payment on your phone. We're checking for confirmation...</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="font-mono text-[#d9fc09]">{initResult?.transactionId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white">{paymentStatus}</span>
                </div>
              </div>
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

        {initResult && !polling && !completeResult && (
          <Alert className="bg-[#161616] border-[#232323] mb-6">
            <Clock className="h-4 w-4 text-yellow-400" />
            <AlertTitle className="text-white">Payment Initiated</AlertTitle>
            <AlertDescription className="text-gray-300">
              <div className="space-y-3 mt-2">
                <p>Payment has been initiated. If you completed the payment, click below to finalize your policy.</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Policy Number:</span>
                    <span className="font-mono text-[#d9fc09]">{initResult.policyNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="font-mono text-[#d9fc09]">{initResult.transactionId}</span>
                  </div>
                </div>
                <Button
                  className="bg-[#d9fc09] text-[#161616] font-semibold mt-3"
                  onClick={handleCompletePolicy}
                >
                  Complete Policy Creation
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {completeResult && (
          <Alert className="bg-green-900/20 border-green-500/30 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-white">Policy Created Successfully!</AlertTitle>
            <AlertDescription className="text-gray-300">
              <div className="space-y-3 mt-2">
                <p>Your insurance policy has been successfully created and activated on the blockchain.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Policy Number:</span>
                      <span className="font-mono text-[#d9fc09]">{completeResult.policy.policyNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Vehicle:</span>
                      <span className="text-white">{completeResult.policy.bodaRegNo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Coverage:</span>
                      <span className="text-white">KES {completeResult.policy.coverageAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Blockchain Policy ID:</span>
                      <span className="font-mono text-[#d9fc09] text-xs">{completeResult.blockchain.policyId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Payment:</span>
                      <span className="text-white">KES {completeResult.payment.amountKES} (≈ ${completeResult.payment.amountUSDC} USDC)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    className="border-green-500/30 hover:bg-green-500/10 text-white"
                    onClick={() => openExplorer(completeResult.blockchain.transactionHash)}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View on Blockchain
                  </Button>
                  <Button
                    className="bg-[#d9fc09] text-[#161616] font-semibold"
                    onClick={() => {
                      setCompleteResult(null);
                      setInitResult(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Policies Table/List View */}
        {viewMode === "table" ? (
          <div className="bg-[#161616] border border-[#232323] rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-[#1a1a1a]">
                <TableRow className="border-b border-[#232323] hover:bg-transparent">
                  <TableHead className="text-gray-400 font-semibold">Policy Number</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Plan</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Vehicle</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Coverage Period</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Premium</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Blockchain</TableHead>
                  <TableHead className="text-right text-gray-400 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                      Loading policies...
                    </TableCell>
                  </TableRow>
                ) : filteredPolicies.length > 0 ? (
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
                      <TableCell className="text-gray-300">{policy.plan?.name || "Unknown"}</TableCell>
                      <TableCell className="text-gray-300">{policy.bodaRegNo || "N/A"}</TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar size={12} className="text-gray-500" />
                            {new Date(policy.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {new Date(policy.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        KES {typeof policy.premiumPaid === 'number'
                          ? policy.premiumPaid.toLocaleString()
                          : policy.premiumPaid}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(policy.status)} border font-medium flex items-center gap-1 w-fit`}>
                          {getStatusIcon(policy.status)}
                          {policy.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.policyId ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => openExplorer(policy.chainTx)}
                                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#d9fc09] transition group"
                                >
                                  <ShieldCheck size={14} className="text-green-400" />
                                  <span className="font-mono">#{policy.policyId}</span>
                                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#232323] border-[#2a2a2a] text-white">
                                <p className="text-xs">View on blockchain</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-xs text-gray-500">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-[#232323]">
                              <MoreVertical size={18} className="text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#232323] border-[#2a2a2a]">
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(policy.chainTx)}
                              className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                              disabled={!policy.chainTx}
                            >
                              <Copy size={16} className="mr-2" />
                              Copy TX Hash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openExplorer(policy.chainTx)}
                              className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                              disabled={!policy.chainTx}
                            >
                              <ExternalLink size={16} className="mr-2" />
                              View on Explorer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      No policies found. Create your first policy to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="bg-[#161616] border border-[#232323] rounded-xl p-12 text-center">
                <RefreshCw className="animate-spin mx-auto mb-2 text-[#d9fc09]" size={32} />
                <p className="text-gray-500">Loading policies...</p>
              </div>
            ) : filteredPolicies.length > 0 ? (
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
                              <span className="text-sm font-medium">{policy.plan?.name || "Unknown Plan"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              Vehicle: {policy.bodaRegNo || "N/A"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar size={14} />
                              {new Date(policy.startDate).toLocaleDateString()} → {new Date(policy.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500">Premium Paid</span>
                        <span className="text-xl font-bold text-white flex items-center gap-2">
                          <CreditCard size={18} className="text-[#d9fc09]" />
                          KES {typeof policy.premiumPaid === 'number'
                            ? policy.premiumPaid.toLocaleString()
                            : policy.premiumPaid}
                        </span>
                      </div>
                    </div>
                    {policy.policyId && (
                      <div className="bg-[#232323] rounded-lg p-4 border border-[#2a2a2a]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#d9fc09]/10 rounded-lg">
                              <ShieldCheck className="text-[#d9fc09]" size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Blockchain Policy ID</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-white">#{policy.policyId}</span>
                                <button
                                  onClick={() => copyToClipboard(policy.chainTx)}
                                  className="text-gray-500 hover:text-[#d9fc09] transition"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => openExplorer(policy.chainTx)}
                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg text-sm text-gray-300 hover:text-[#d9fc09] transition group"
                          >
                            <span>View on Explorer</span>
                            <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                        {policy.chainTx && (
                          <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                            <div className="text-xs text-gray-500">
                              <span className="text-gray-600">TX:</span>
                              <span className="ml-1 font-mono">{policy.chainTx.slice(0, 20)}...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#232323] hover:bg-[#232323] hover:text-[#d9fc09] flex-1"
                      >
                        <Eye size={16} className="mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#232323] hover:bg-[#232323] hover:text-[#d9fc09] flex-1"
                        disabled={!policy.policyId}
                      >
                        <Download size={16} className="mr-2" />
                        Download Certificate
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#161616] border border-[#232323] rounded-xl p-12 text-center">
                <BadgeCheck className="mx-auto mb-4 text-gray-600" size={48} />
                <p className="text-gray-500 mb-2">No policies found</p>
                <p className="text-gray-600 text-sm">Create your first policy to get started!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}