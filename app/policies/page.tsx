"use client";
import Header from "@/components/shared-components/Header";
import { BadgeCheck, Calendar, CreditCard, FileText } from "lucide-react";

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
    canRenew: true,
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
    canRenew: false,
  },
];

const statusColors: Record<string, string> = {
  "Active": "bg-green-600",
  "Expiring Soon": "bg-yellow-400 text-gray-800",
  "Expired": "bg-red-500",
};

export default function PoliciesPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0b0b] flex flex-col">
      <Header />

      <div className="w-full max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-[#d9fc09]">My Insurance Policies</h1>
        <div className="flex flex-col gap-7">
          {policies.map((p) => (
            <div key={p.id}
              className="flex flex-col md:flex-row items-start md:items-center bg-[#161616] rounded-xl p-6 shadow-lg border border-[#1d1c1d] gap-6"
            >
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                <div className="flex items-center gap-4 min-w-[100px]">
                  <BadgeCheck className="text-[#d9fc09]" size={30} />
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1 min-w-[175px]">
                  <div className="text-lg text-white font-bold">{p.type} Policy</div>
                  <div className="text-sm text-gray-400">{p.vehicle}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar size={15} />
                    <span>{p.startDate} → {p.endDate}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-center min-w-[120px]">
                  <div className="flex items-center gap-2 text-base text-white font-semibold">
                    <CreditCard size={18} className="text-[#d9fc09]" />
                    {p.premium}
                  </div>
                  <div className="text-xs text-gray-500">Premium</div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 ml-2">
                <a
                  href={p.doc}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#232323] text-white text-sm font-medium hover:bg-[#292929] transition"
                >
                  <FileText size={18} />
                  View Policy
                </a>
                {p.canRenew && (
                  <button
                    className="px-5 py-2 rounded-full bg-[#d9fc09] text-[#161616] font-semibold hover:bg-[#fffd38] transition"
                    onClick={() => alert(`Renewing policy ${p.id}`)}
                  >
                    Renew
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
