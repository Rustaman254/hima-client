"use client";
import { useState } from "react";
import Header from "@/components/shared-components/Header";
import { 
  BadgeHelp, 
  Calendar, 
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
  FileCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

const claims = [
  {
    id: "C-101",
    date: "2024-07-12",
    policy: "Comprehensive",
    vehicle: "KMC 123A",
    amount: "KES 8,000",
    status: "Paid",
    doc: "/claims/101.pdf",
    transactionHash: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
    verificationId: "VRF-8472",
    blockNumber: "18234567",
    timestamp: "2024-07-15 14:23:45",
  },
  {
    id: "C-124",
    date: "2025-03-18",
    policy: "Third Party",
    vehicle: "KDC 656B",
    amount: "KES 1,500",
    status: "Processing",
    doc: "/claims/124.pdf",
    transactionHash: "0x9a3b51f8c2d4e6a8b7c9d1e2f3a4b5c6d7e8f9a0",
    verificationId: "VRF-9231",
    blockNumber: null,
    timestamp: "2025-03-18 09:12:33",
  },
  {
    id: "C-140",
    date: "2025-07-01",
    policy: "Comprehensive",
    vehicle: "KAA 777C",
    amount: "KES 6,000",
    status: "Rejected",
    doc: "/claims/140.pdf",
    transactionHash: "0x1f2e3d4c5b6a7980fedbca9876543210abcdef12",
    verificationId: "VRF-9445",
    blockNumber: "18456789",
    timestamp: "2025-07-03 16:45:12",
  },
  {
    id: "C-089",
    date: "2024-02-28",
    policy: "Personal Accident",
    vehicle: "KBZ 445D",
    amount: "KES 3,200",
    status: "Paid",
    doc: "/claims/089.pdf",
    transactionHash: "0xa1b2c3d4e5f6071829384756abcdef1234567890",
    verificationId: "VRF-7823",
    blockNumber: "17891234",
    timestamp: "2024-03-02 11:30:22",
  },
  {
    id: "C-156",
    date: "2025-08-15",
    policy: "Comprehensive",
    vehicle: "KCC 888E",
    amount: "KES 12,500",
    status: "Processing",
    doc: "/claims/156.pdf",
    transactionHash: "0xdef123456789abcdef0123456789abcdef012345",
    verificationId: "VRF-9567",
    blockNumber: null,
    timestamp: "2025-08-15 08:05:18",
  },
];

const getStatusColor = (status: string) => {
  const colors = {
    "Paid": "bg-green-500/10 text-green-400 border-green-500/20",
    "Processing": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "Rejected": "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return colors[status as keyof typeof colors] || "";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Paid":
      return <CheckCircle2 size={14} />;
    case "Processing":
      return <Clock size={14} />;
    default:
      return null;
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // You can add toast notification here
};

const openExplorer = (hash: string) => {
  // Replace with your actual blockchain explorer URL
  // For example: https://etherscan.io/tx/ or https://polygonscan.com/tx/
  window.open(`https://explorer.celo.org/mainnet/tx/${hash}`, '_blank');
};

export default function ClaimsPage() {
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClaims = claims.filter(claim => 
    claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.policy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.verificationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#0a0b0b] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Claims</h1>
              <p className="text-gray-400 text-sm">
                Track and manage your insurance claims with secure verification
              </p>
            </div>
            <Button className="bg-[#d9fc09] text-[#161616] hover:bg-[#e5ff1a] font-semibold">
              <BadgeHelp size={18} />
              New Claim
            </Button>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[#161616] border border-[#232323] rounded-xl p-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input
                type="text"
                placeholder="Search by ID, policy, vehicle, or verification ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#232323] border-[#2a2a2a] text-white placeholder:text-gray-500 focus-visible:ring-[#d9fc09]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#232323] hover:bg-[#232323]"
              >
                <Filter size={16} />
                Filter
              </Button>

              <div className="flex items-center bg-[#232323] rounded-lg p-1 border border-[#2a2a2a]">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-[#d9fc09] text-[#161616]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "list"
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

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#161616] border border-[#232323] rounded-xl p-5 hover:border-[#2a2a2a] transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Claims</p>
                <p className="text-2xl font-bold text-white">{claims.length}</p>
              </div>
              <div className="p-3 bg-[#d9fc09]/10 rounded-lg">
                <FileText className="text-[#d9fc09]" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#232323] rounded-xl p-5 hover:border-[#2a2a2a] transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Verified Claims</p>
                <p className="text-2xl font-bold text-white">
                  {claims.filter(c => c.status === "Paid").length}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <ShieldCheck className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#232323] rounded-xl p-5 hover:border-[#2a2a2a] transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Under Review</p>
                <p className="text-2xl font-bold text-white">
                  {claims.filter(c => c.status === "Processing").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="text-yellow-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === "table" ? (
          <div className="bg-[#161616] border border-[#232323] rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-[#1a1a1a]">
                <TableRow className="border-b border-[#232323] hover:bg-transparent">
                  <TableHead className="text-gray-400 font-semibold">Claim ID</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Policy Type</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Vehicle</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Date Filed</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Amount</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-400 font-semibold">Verification</TableHead>
                  <TableHead className="text-right text-gray-400 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => (
                    <TableRow 
                      key={claim.id} 
                      className="border-b border-[#232323] hover:bg-[#1a1a1a] transition"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <BadgeHelp className="text-[#d9fc09]" size={18} />
                          {claim.id}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{claim.policy}</TableCell>
                      <TableCell className="text-gray-300 font-mono text-sm">{claim.vehicle}</TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-500" />
                          {claim.date}
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-semibold">{claim.amount}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(claim.status)} border font-medium flex items-center gap-1 w-fit`}>
                          {getStatusIcon(claim.status)}
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => openExplorer(claim.transactionHash)}
                                className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#d9fc09] transition group"
                              >
                                <FileCheck size={14} className="text-gray-500 group-hover:text-[#d9fc09]" />
                                <span className="font-mono">{claim.verificationId}</span>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#232323] border-[#2a2a2a] text-white">
                              <p className="text-xs">View verification details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="hover:bg-[#232323]"
                            >
                              <MoreVertical size={18} className="text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#232323] border-[#2a2a2a]">
                            <DropdownMenuItem className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer">
                              <Eye size={16} className="mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer">
                              <Download size={16} className="mr-2" />
                              Download Document
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openExplorer(claim.transactionHash)}
                              className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                            >
                              <ExternalLink size={16} className="mr-2" />
                              View Verification
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => copyToClipboard(claim.transactionHash)}
                              className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                            >
                              <Copy size={16} className="mr-2" />
                              Copy Verification ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer">
                              Appeal Claim
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      No claims found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredClaims.length > 0 ? (
              filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-[#161616] border border-[#232323] rounded-xl p-6 hover:border-[#2a2a2a] transition-all group"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#d9fc09]/10 rounded-xl group-hover:bg-[#d9fc09]/20 transition">
                          <BadgeHelp className="text-[#d9fc09]" size={28} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{claim.id}</h3>
                            <Badge className={`${getStatusColor(claim.status)} border flex items-center gap-1`}>
                              {getStatusIcon(claim.status)}
                              {claim.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-sm font-medium">{claim.policy}</span>
                              <span className="text-gray-600">•</span>
                              <span className="text-sm font-mono">{claim.vehicle}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar size={14} />
                              Filed on {claim.date}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 mb-1">Claim Amount</span>
                        <span className="text-xl font-bold text-white">{claim.amount}</span>
                      </div>
                    </div>

                    {/* Verification Section */}
                    <div className="bg-[#232323] rounded-lg p-4 border border-[#2a2a2a]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#d9fc09]/10 rounded-lg">
                            <ShieldCheck className="text-[#d9fc09]" size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Verification ID</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-white">{claim.verificationId}</span>
                              <button
                                onClick={() => copyToClipboard(claim.transactionHash)}
                                className="text-gray-500 hover:text-[#d9fc09] transition"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => openExplorer(claim.transactionHash)}
                          className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg text-sm text-gray-300 hover:text-[#d9fc09] transition group"
                        >
                          <span>View Details</span>
                          <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                      
                      {claim.blockNumber && (
                        <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-center gap-6 text-xs text-gray-500">
                          <div>
                            <span className="text-gray-600">Record #</span>
                            <span className="ml-1 font-mono">{claim.blockNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Timestamp:</span>
                            <span className="ml-1">{claim.timestamp}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#232323] hover:bg-[#232323] hover:text-[#d9fc09] flex-1"
                      >
                        <Eye size={16} />
                        View Claim
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
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-[#232323]"
                          >
                            <MoreVertical size={18} className="text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#232323] border-[#2a2a2a]">
                          <DropdownMenuItem 
                            onClick={() => copyToClipboard(claim.transactionHash)}
                            className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                          >
                            <Copy size={16} className="mr-2" />
                            Copy Verification ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                          <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer">
                            Appeal Claim
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#161616] border border-[#232323] rounded-xl p-12 text-center">
                <p className="text-gray-500">No claims found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}