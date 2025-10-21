"use client";
import { useState } from "react";
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

const policies = [
  {
    id: "P-0001",
    type: "Comprehensive",
    vehicle: "Boda Boda KMC 123A",
    startDate: "2025-01-15",
    endDate: "2026-01-14",
    status: "Active",
    premium: "KES 10,000",
    doc: "/policies/0001.pdf",
    canRenew: false,
    transactionHash: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
    policyHash: "POL-8472",
    blockNumber: "18234567",
    issuedTimestamp: "2025-01-15 10:30:22",
    daysRemaining: 85,
  },
  {
    id: "P-0002",
    type: "Third Party",
    vehicle: "Boda Boda KDC 656B",
    startDate: "2024-10-01",
    endDate: "2025-09-30",
    status: "Expiring Soon",
    premium: "KES 3,500",
    doc: "/policies/0002.pdf",
    canRenew: true,
    transactionHash: "0x9a3b51f8c2d4e6a8b7c9d1e2f3a4b5c6d7e8f9a0",
    policyHash: "POL-9231",
    blockNumber: "17891234",
    issuedTimestamp: "2024-10-01 14:15:33",
    daysRemaining: 12,
  },
  {
    id: "P-0003",
    type: "Comprehensive",
    vehicle: "Boda Boda KAA 777C",
    startDate: "2023-08-20",
    endDate: "2024-08-19",
    status: "Expired",
    premium: "KES 9,000",
    doc: "/policies/0003.pdf",
    canRenew: true,
    transactionHash: "0x1f2e3d4c5b6a7980fedbca9876543210abcdef12",
    policyHash: "POL-7823",
    blockNumber: "16234567",
    issuedTimestamp: "2023-08-20 09:45:12",
    daysRemaining: -100,
  },
  {
    id: "P-0004",
    type: "Personal Accident",
    vehicle: "Boda Boda KBZ 445D",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    status: "Active",
    premium: "KES 1,200",
    doc: "/policies/0004.pdf",
    canRenew: false,
    transactionHash: "0xa1b2c3d4e5f6071829384756abcdef1234567890",
    policyHash: "POL-9445",
    blockNumber: "18456789",
    issuedTimestamp: "2025-03-01 11:20:45",
    daysRemaining: 130,
  },
];

const getStatusColor = (status: string) => {
  const colors = {
    "Active": "bg-green-500/10 text-green-400 border-green-500/20",
    "Expiring Soon": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "Expired": "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return colors[status as keyof typeof colors] || "";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active":
      return <CheckCircle2 size={14} />;
    case "Expiring Soon":
      return <AlertTriangle size={14} />;
    case "Expired":
      return <X size={14} />;
    default:
      return null;
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

const openExplorer = (hash: string) => {
  window.open(`https://explorer.celo.org/mainnet/tx/${hash}`, '_blank');
};

export default function PoliciesPage() {
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPolicies = policies.filter(policy => 
    policy.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.policyHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = policies.filter(p => p.status === "Active").length;
  const expiringCount = policies.filter(p => p.status === "Expiring Soon").length;
  const expiredCount = policies.filter(p => p.status === "Expired").length;

  return (
    <div className="min-h-screen w-full bg-[#0a0b0b] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Insurance Policies</h1>
              <p className="text-gray-400 text-sm">
                Manage your active and expired insurance policies
              </p>
            </div>
            <Button className="bg-[#d9fc09] text-[#161616] hover:bg-[#e5ff1a] font-semibold">
              <BadgeCheck size={18} />
              New Policy
            </Button>
          </div>

          {/* Controls Bar */}
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

        {/* Content Area */}
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
                {filteredPolicies.length > 0 ? (
                  filteredPolicies.map((policy) => (
                    <TableRow 
                      key={policy.id} 
                      className="border-b border-[#232323] hover:bg-[#1a1a1a] transition"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="text-[#d9fc09]" size={18} />
                          {policy.id}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{policy.type}</TableCell>
                      <TableCell className="text-gray-300">{policy.vehicle}</TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar size={12} className="text-gray-500" />
                            {policy.startDate}
                          </div>
                          <div className="text-xs text-gray-500">to {policy.endDate}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-semibold">{policy.premium}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(policy.status)} border font-medium flex items-center gap-1 w-fit`}>
                          {getStatusIcon(policy.status)}
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => openExplorer(policy.transactionHash)}
                                className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#d9fc09] transition group"
                              >
                                <FileCheck size={14} className="text-gray-500 group-hover:text-[#d9fc09]" />
                                <span className="font-mono">{policy.policyHash}</span>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition" />
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
                          {policy.canRenew && (
                            <Button
                              size="sm"
                              className="bg-[#d9fc09] text-[#161616] hover:bg-[#e5ff1a] font-medium"
                              onClick={() => alert(`Renewing policy ${policy.id}`)}
                            >
                              <RefreshCw size={14} />
                              Renew
                            </Button>
                          )}
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
                                onClick={() => openExplorer(policy.transactionHash)}
                                className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                              >
                                <ExternalLink size={16} className="mr-2" />
                                View Record
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => copyToClipboard(policy.transactionHash)}
                                className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                              >
                                <Copy size={16} className="mr-2" />
                                Copy Policy Hash
                              </DropdownMenuItem>
                              {policy.canRenew && (
                                <>
                                  <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                                  <DropdownMenuItem className="text-[#d9fc09] hover:bg-[#d9fc09]/10 cursor-pointer">
                                    <RefreshCw size={16} className="mr-2" />
                                    Renew Policy
                                  </DropdownMenuItem>
                                </>
                              )}
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
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="bg-[#161616] border border-[#232323] rounded-xl p-6 hover:border-[#2a2a2a] transition-all group"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#d9fc09]/10 rounded-xl group-hover:bg-[#d9fc09]/20 transition">
                          <BadgeCheck className="text-[#d9fc09]" size={28} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{policy.id}</h3>
                            <Badge className={`${getStatusColor(policy.status)} border flex items-center gap-1`}>
                              {getStatusIcon(policy.status)}
                              {policy.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-sm font-medium">{policy.type} Policy</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              {policy.vehicle}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar size={14} />
                              {policy.startDate} → {policy.endDate}
                              {policy.daysRemaining > 0 && (
                                <span className="text-xs">
                                  ({policy.daysRemaining} days remaining)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500">Annual Premium</span>
                        <span className="text-xl font-bold text-white flex items-center gap-2">
                          <CreditCard size={18} className="text-[#d9fc09]" />
                          {policy.premium}
                        </span>
                      </div>
                    </div>

                    {/* Policy Record Section */}
                    <div className="bg-[#232323] rounded-lg p-4 border border-[#2a2a2a]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#d9fc09]/10 rounded-lg">
                            <ShieldCheck className="text-[#d9fc09]" size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Policy Record</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-white">{policy.policyHash}</span>
                              <button
                                onClick={() => copyToClipboard(policy.transactionHash)}
                                className="text-gray-500 hover:text-[#d9fc09] transition"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => openExplorer(policy.transactionHash)}
                          className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg text-sm text-gray-300 hover:text-[#d9fc09] transition group"
                        >
                          <span>View Record</span>
                          <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-center gap-6 text-xs text-gray-500">
                        <div>
                          <span className="text-gray-600">Issued Block:</span>
                          <span className="ml-1 font-mono">{policy.blockNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Timestamp:</span>
                          <span className="ml-1">{policy.issuedTimestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
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

                      {policy.canRenew && (
                        <Button
                          size="sm"
                          className="bg-[#d9fc09] text-[#161616] hover:bg-[#e5ff1a] font-semibold flex-1"
                          onClick={() => alert(`Renewing policy ${policy.id}`)}
                        >
                          <RefreshCw size={16} />
                          Renew Now
                        </Button>
                      )}

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
                            onClick={() => copyToClipboard(policy.transactionHash)}
                            className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer"
                          >
                            <Copy size={16} className="mr-2" />
                            Copy Policy Hash
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white cursor-pointer">
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}