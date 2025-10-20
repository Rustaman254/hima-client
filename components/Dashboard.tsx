"use client";
import Header from "./shared-components/Header";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import {
  ShieldCheck,
  FileText,
  BadgeHelp,
  BarChart2,
  CheckCircle2,
  BadgePercent,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserActivityTable from "@/components/shared-components/userActivity";

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
      "Personal accident cover",
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
      "Easy renewal",
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
      "Add-on to other plans",
    ],
    best: false,
  },
];

function MotorcycleInsuranceSummaryCards({ nextPayment = "2026-01-14" }: { nextPayment?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 px-4 mb-10">
      <Card className="bg-[#161616] border border-[#232323] @container/card">
        <CardHeader>
          <CardDescription>Covered Motorcycles</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-white">
            283
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +6%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-white">
            New bikes covered this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-gray-400">
            Next Payment: <span className="text-[#d9fc09] font-semibold">{nextPayment}</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-[#161616] border border-[#232323] @container/card">
        <CardHeader>
          <CardDescription>Active Policies</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-white">
            231
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-white">
            Month-on-month policy retention <IconTrendingDown className="size-4" />
          </div>
          <div className="text-gray-400">Continuous coverage improvement</div>
        </CardFooter>
      </Card>
      <Card className="bg-[#161616] border border-[#232323] @container/card">
        <CardHeader>
          <CardDescription>Claims Filed (Year)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-white">
            47
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +15%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-white">
            Yearly claims are up <IconTrendingUp className="size-4" />
          </div>
          <div className="text-gray-400">Most common: accident cover</div>
        </CardFooter>
      </Card>
      <Card className="bg-[#161616] border border-[#232323] @container/card">
        <CardHeader>
          <CardDescription>On-time Renewals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-white">
            92%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-white">
            Great renewal rate <IconTrendingUp className="size-4" />
          </div>
          <div className="text-gray-400">Most riders renew on time</div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const summary = {
    totalPolicies: 3,
    activePolicies: 2,
    totalClaims: 5,
    lastClaim: "2025-09-30",
    nextRenewal: "2026-01-14",
    currentPlan: "Comprehensive",
    paidClaims: 1,
    processingClaims: 3,
    rejectedClaims: 1,
    nextPayment: "2026-01-14",
  };

  const mockClaims = [
    { id: 1, dateFiled: "2025-09-30", status: "Processing", description: "Accident Coverage" },
    { id: 2, dateFiled: "2025-06-15", status: "Paid", description: "Minor Damage Payout" },
    { id: 3, dateFiled: "2025-03-11", status: "Rejected", description: "Stolen Bike (No Evidence)" },
  ];
  const mockPolicies = [
    { id: 1, issueDate: "2025-01-14", active: true, name: "Comprehensive", renewalDate: "2026-01-14" },
    { id: 2, issueDate: "2024-01-14", active: false, name: "Third Party Only", renewalDate: "2025-01-14" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0b] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center py-10 w-full px-4">
        <div className="max-w-6xl w-full">
          <MotorcycleInsuranceSummaryCards nextPayment={summary.nextPayment} />

          <div className="flex flex-col md:flex-row gap-2 mb-12">
            <div className="w-full md:w-1/4">
              <div className="flex items-center justify-center md:justify-end h-12 mb-3">
                <BarChart2 size={28} className="text-[#d9fc09] mr-2" />
                <span className="text-lg text-white font-bold">Activity Overview</span>
              </div>
              <div className="h-full bg-[#232323] rounded-xl shadow-lg border border-[#292929] flex items-center justify-center">
                <div className="flex flex-col items-end justify-center w-full h-full text-right py-10 px-6">
                  <ul className="text-gray-300 text-sm mb-3 space-y-1">
                    <li>Last claim filed <span className="text-[#d9fc09]">{summary.lastClaim}</span></li>
                    <li>
                      Current insurance plan:{" "}
                      <span className="text-[#d9fc09] font-medium">
                        {summary.currentPlan}
                      </span>
                    </li>
                    <li>
                      {summary.activePolicies} active,{" "}
                      {summary.totalPolicies - summary.activePolicies} expired
                    </li>
                    <li>
                      {summary.paidClaims} claim paid, {summary.processingClaims} processing,{" "}
                      {summary.rejectedClaims} rejected
                    </li>
                  </ul>
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#d9fc09] text-[#161616] font-semibold mt-3">
                    <CheckCircle2 size={18} className="mr-2" />
                    You are fully covered!
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center justify-between h-12 px-2 mb-3">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              </div>
              <div className="h-full flex-1">
                <UserActivityTable claims={mockClaims} policies={mockPolicies} />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold my-8 text-[#d9fc09]">Available Insurance Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`relative bg-[#161616] rounded-2xl p-7 flex flex-col shadow-lg border border-[#232323] transition ${
                  plan.best
                    ? "border-[#d9fc09] ring-2 ring-[#d9fc09]"
                    : ""
                }`}
              >
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
                  className={`px-5 py-2 rounded-full text-sm font-semibold mb-2 transition ${
                    plan.best
                      ? "bg-[#d9fc09] text-[#161616] hover:bg-[#fffd38]"
                      : "bg-[#232323] text-white hover:bg-[#292929]"
                  }`}
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
                  <span className="absolute right-6 top-4 text-xs px-2 py-1 rounded-full bg-[#d9fc09] text-[#161616] font-bold">
                    Most Popular
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
