"use client";
import Header from "@/components/shared-components/Header";
import { BadgeHelp, Calendar, FileText } from "lucide-react";

const claims = [
  {
    id: "C-101",
    date: "2024-07-12",
    policy: "Comprehensive",
    vehicle: "KMC 123A",
    amount: "KES 8,000",
    status: "Paid",
    doc: "/claims/101.pdf",
  },
  {
    id: "C-124",
    date: "2025-03-18",
    policy: "Third Party",
    vehicle: "KDC 656B",
    amount: "KES 1,500",
    status: "Processing",
    doc: "/claims/124.pdf",
  },
  {
    id: "C-140",
    date: "2025-07-01",
    policy: "Comprehensive",
    vehicle: "KAA 777C",
    amount: "KES 6,000",
    status: "Rejected",
    doc: "/claims/140.pdf",
  },
];

const claimColors: Record<string, string> = {
  "Paid": "bg-green-600",
  "Processing": "bg-yellow-400 text-gray-800",
  "Rejected": "bg-red-500",
};

export default function ClaimsPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0b0b] flex flex-col">
      <Header />

      <div className="w-full max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-[#d9fc09]">My Claims</h1>
        <div className="flex flex-col gap-7">
          {claims.map((c) => (
            <div key={c.id}
              className="flex flex-col md:flex-row items-start md:items-center bg-[#161616] rounded-xl p-6 shadow-lg border border-[#1d1c1d] gap-6"
            >
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                <div className="flex items-center gap-4 min-w-[100px]">
                  <BadgeHelp className="text-[#d9fc09]" size={30} />
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${claimColors[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1 min-w-[175px]">
                  <div className="text-lg text-white font-bold">{c.policy} Claim</div>
                  <div className="text-sm text-gray-400">{c.vehicle}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar size={15} />
                    <span>{c.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-center min-w-[120px]">
                  <div className="flex items-center gap-2 text-base text-white font-semibold">
                    {c.amount}
                  </div>
                  <div className="text-xs text-gray-500">Amount</div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 ml-2">
                <a
                  href={c.doc}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#232323] text-white text-sm font-medium hover:bg-[#292929] transition"
                >
                  <FileText size={18} />
                  View Claim
                </a>
                {/* You can add actions like "Appeal" here if needed */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
