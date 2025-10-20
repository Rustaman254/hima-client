"use client";
import Header from "@/components/shared-components/Header";
import { ShieldCheck, BadgePercent, Info } from "lucide-react";

const plans = [
  {
    id: "comprehensive",
    name: "Comprehensive",
    price: "KES 10,000 / year",
    description: "Full boda boda protection: theft, fire, accident, third-party liability, rider injury cover.",
    features: [
      "Third-party coverage",
      "Accidents, fire, theft",
      "Quick claim processing",
      "Personal accident cover"
    ],
    best: true,
  },
  {
    id: "thirdparty",
    name: "Third Party Only",
    price: "KES 3,500 / year",
    description: "Meets legal requirements, covers only third-party damages and injuries.",
    features: [
      "Third-party liability",
      "Legal compliance",
      "Easy renewal"
    ],
    best: false,
  },
  {
    id: "personal",
    name: "Personal Accident",
    price: "KES 1,200 / year",
    description: "Covers the rider for accidental medical costs and disability.",
    features: [
      "Rider medical cover",
      "Disability payout",
      "Add-on to other plans"
    ],
    best: false,
  },
];

export default function PlansPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0b0b] flex flex-col">
      <Header />
      <div className="max-w-6xl w-full mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-[#d9fc09]">Available Insurance Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-[#161616] rounded-2xl p-7 flex flex-col shadow-lg border border-[#232323] transition ${plan.best ? "border-[#d9fc09] ring-2 ring-[#d9fc09]" : ""}`}>
              <div className="flex items-center mb-2">
                <ShieldCheck size={27} className="text-[#d9fc09] mr-3" />
                <div className="text-xl text-white font-bold">{plan.name}</div>
              </div>
              <div className="text-2xl text-white font-bold mb-1">{plan.price}</div>
              <div className="text-gray-300 mb-4">{plan.description}</div>
              <ul className="mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li className="flex items-center gap-2 text-gray-200 text-sm mb-2" key={i}>
                    <BadgePercent size={16} className="text-[#d9fc09]" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`px-5 py-2 rounded-full text-sm font-semibold mb-2 transition ${plan.best ? "bg-[#d9fc09] text-[#161616] hover:bg-[#fffd38]" : "bg-[#232323] text-white hover:bg-[#292929]"}`}
                onClick={() => alert(`Selected plan: ${plan.name}`)}
              >
                Choose Plan
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d1c1d] text-[#d9fc09] hover:bg-[#222]"
                onClick={() => alert(`More info: ${plan.name}`)}
              >
                <Info size={16} /> More Info
              </button>
              {plan.best && (
                <span className="absolute right-6 top-4 text-xs px-2 py-1 rounded-full bg-[#d9fc09] text-[#161616] font-bold">Most Popular</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
