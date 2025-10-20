"use client";
import Header from "@/components/shared-components/Header";
import { Calendar, CreditCard, BadgeDollarSign } from "lucide-react";

const premiums = [
  {
    period: "2025-01",
    policy: "P-0001",
    type: "Comprehensive",
    amount: "KES 10,000",
    paidOn: "2025-01-10",
    status: "Paid",
  },
  {
    period: "2024-10",
    policy: "P-0002",
    type: "Third Party",
    amount: "KES 3,500",
    paidOn: "2024-10-03",
    status: "Paid",
  },
  {
    period: "2023-08",
    policy: "P-0003",
    type: "Comprehensive",
    amount: "KES 9,000",
    paidOn: "2023-08-21",
    status: "Overdue",
  },
];

const paymentColors: Record<string, string> = {
  "Paid": "bg-green-600",
  "Overdue": "bg-red-500",
};

export default function PremiumsPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0b0b] flex flex-col">
      <Header />

      <div className="w-full max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-[#d9fc09]">My Premium Payments</h1>
        <div className="flex flex-col gap-7">
          {premiums.map((p, i) => (
            <div key={i}
              className="flex flex-col md:flex-row items-start md:items-center bg-[#161616] rounded-xl p-6 shadow-lg border border-[#1d1c1d] gap-6"
            >
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                <div className="flex items-center gap-4 min-w-[100px]">
                  <BadgeDollarSign className="text-[#d9fc09]" size={30} />
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentColors[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1 min-w-[175px]">
                  <div className="text-lg text-white font-bold">{p.type}</div>
                  <div className="text-sm text-gray-400">Policy {p.policy}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar size={15} />
                    <span>{p.period}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-center min-w-[120px]">
                  <div className="flex items-center gap-2 text-base text-white font-semibold">
                    <CreditCard size={18} className="text-[#d9fc09]" />
                    {p.amount}
                  </div>
                  <div className="text-xs text-gray-500">Amount</div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 ml-2">
                <span className="text-xs text-gray-300">
                  Paid {p.status === "Paid" ? `on ${p.paidOn}` : " - Please pay"}
                </span>
                {/* Add payment or download receipt buttons here */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
