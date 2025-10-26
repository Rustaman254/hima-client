"use client";

import { useEffect, useState } from "react";
import Header from "@/components/shared-components/Header";
import {
  BadgeHelp,
  Copy,
  Eye,
  MoreVertical,
  Search,
  X,
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

interface Claim {
  _id: string;
  claimNumber: string;
  bodaRegNo: string;
  incidentDate: string;
  amountClaimed: number;
  status: string;
}

interface Policy {
  _id: string;
  policyNumber: string;
  bodaRegNo: string;
  status: string;
}

const baseUrl =
  process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://hima-g018.onrender.com/";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [policyId, setPolicyId] = useState("");
  const [claimType, setClaimType] = useState("accident");
  const [incidentDate, setIncidentDate] = useState("");
  const [amountClaimed, setAmountClaimed] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // Safe guard for SSR: Retrieve token only in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("jwt");
      setToken(savedToken);
    }
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const [claimRes, policyRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/insurance/claims`, { headers: getAuthHeaders() }),
          fetch(`${baseUrl}/api/v1/insurance/policies`, { headers: getAuthHeaders() }),
        ]);

        const claimData = await claimRes.json();
        const policyData = await policyRes.json();

        setClaims(claimData.claims || []);
        setPolicies(policyData.policies || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        policyId,
        claimType,
        incidentDate,
        amountClaimed: Number(amountClaimed),
        description,
        location,
      };

      const res = await fetch(`${baseUrl}/api/v1/insurance/claims/new-claim`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setClaims((prev) => [...prev, data.claim]);
        setShowModal(false);
        setPolicyId("");
        setClaimType("accident");
        setIncidentDate("");
        setAmountClaimed("");
        setDescription("");
        setLocation("");
      } else {
        alert(data.message || "Failed to submit claim");
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-green-500/10 text-green-400 border-green-500/20",
      submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      under_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return map[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const filteredClaims = claims.filter(
    (c) =>
      c.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bodaRegNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0b0b] text-white">
      <Header />
      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Claims</h1>
          <Button
            className="bg-[#d9fc09] text-black font-semibold cursor-pointer hover:bg-[#e4ff3a]"
            onClick={() => setShowModal(true)}
          >
            <BadgeHelp size={16} /> New Claim
          </Button>
        </div>

        <div className="flex gap-3 items-center bg-[#161616] border border-[#232323] p-4 rounded-xl mb-6">
          <Search className="text-gray-500" size={18} />
          <Input
            placeholder="Search by claim number or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#232323] border-[#2a2a2a] text-white flex-1"
          />
        </div>

        {loading ? (
          <p className="text-gray-400 text-center mt-10">Loading claims...</p>
        ) : filteredClaims.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No claims found.</p>
        ) : (
          <Table className="bg-[#161616] border border-[#232323] rounded-xl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Claim #</TableHead>
                <TableHead className="text-gray-400">Vehicle</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((c) => (
                <TableRow key={c._id} className="hover:bg-[#1a1a1a]">
                  <TableCell>{c.claimNumber}</TableCell>
                  <TableCell className="text-gray-300">{c.bodaRegNo}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(c.incidentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{c.amountClaimed} KES</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(c.status)} border`}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="cursor-pointer">
                          <MoreVertical className="text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#232323] border-[#2a2a2a]">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye size={14} className="mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(c.claimNumber)
                          }
                          className="cursor-pointer"
                        >
                          <Copy size={14} className="mr-2" /> Copy ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Create New Claim</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-4">
              {/* Policy */}
              <div>
                <label className="text-sm text-gray-400">Select Policy</label>
                <select
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  required
                  className="bg-[#232323] border-[#2a2a2a] text-white w-full p-2 rounded-md"
                >
                  <option value="">Choose an active policy</option>
                  {policies.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.policyNumber} ({p.bodaRegNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Claim Fields */}
              <div>
                <label className="text-sm text-gray-400">Claim Type</label>
                <Input
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value)}
                  required
                  className="bg-[#232323] border-[#2a2a2a] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Incident Date</label>
                <Input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  required
                  className="bg-[#232323] border-[#2a2a2a] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Amount (KES)</label>
                <Input
                  type="number"
                  value={amountClaimed}
                  onChange={(e) => setAmountClaimed(e.target.value)}
                  required
                  className="bg-[#232323] border-[#2a2a2a] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the incident"
                  className="bg-[#232323] border-[#2a2a2a] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Incident location"
                  className="bg-[#232323] border-[#2a2a2a] text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer border border-gray-600 bg-transparent hover:bg-[#232323]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="cursor-pointer bg-[#d9fc09] text-black font-semibold hover:bg-[#e4ff3a]"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
