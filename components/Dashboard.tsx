"use client";
import { useState, useEffect } from "react";
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
import { usePlans } from "@/hooks/plans";

// const plans = [
//   {
//     id: "comprehensive",
//     name: "Comprehensive",
//     price: "KES 10,000 / year",
//     description: "Full boda boda protection: theft, fire, accident, third-party liability, rider injury cover.",
//     features: [
//       "Third-party coverage",
//       "Accidents, fire, theft",
//       "Quick claim processing",
//       "Personal accident cover",
//     ],
//     best: true,
//   },
//   {
//     id: "thirdparty",
//     name: "Third Party Only",
//     price: "KES 3,500 / year",
//     description: "Meets legal requirements, covers only third-party damages and injuries.",
//     features: [
//       "Third-party liability",
//       "Legal compliance",
//       "Easy renewal",
//     ],
//     best: false,
//   },
//   {
//     id: "personal",
//     name: "Personal Accident",
//     price: "KES 1,200 / year",
//     description: "Covers the rider for accidental medical costs and disability.",
//     features: [
//       "Rider medical cover",
//       "Disability payout",
//       "Add-on to other plans",
//     ],
//     best: false,
//   },
// ];

function MotorcycleInsuranceSummaryCards({ nextPayment = "2026-01-14" }: { nextPayment?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Card className="bg-[#161616] border border-[#232323] hover:border-[#2a2a2a] transition-colors @container/card">
        <CardHeader>
          <CardDescription>Covered Motorcycles</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-white mt-2">
            283
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="w-3.5 h-3.5" />
              +6%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium text-white items-center">
            New bikes covered this month
            <IconTrendingUp className="size-4 text-green-400" />
          </div>
          <div className="text-gray-400 text-xs">
            Next Payment: <span className="text-[#d9fc09] font-semibold">{nextPayment}</span>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-[#161616] border border-[#232323] hover:border-[#2a2a2a] transition-colors @container/card">
        <CardHeader>
          <CardDescription>Active Policies</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-white mt-2">
            231
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown className="w-3.5 h-3.5" />
              -2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium text-white items-center">
            Month-on-month retention
            <IconTrendingDown className="size-4 text-red-400" />
          </div>
          <div className="text-gray-400 text-xs">Continuous coverage improvement</div>
        </CardFooter>
      </Card>

      <Card className="bg-[#161616] border border-[#232323] hover:border-[#2a2a2a] transition-colors @container/card">
        <CardHeader>
          <CardDescription>Claims Filed (Year)</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-white mt-2">
            47
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="w-3.5 h-3.5" />
              +15%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium text-white items-center">
            Yearly claims are up
            <IconTrendingUp className="size-4 text-green-400" />
          </div>
          <div className="text-gray-400 text-xs">Most common: accident cover</div>
        </CardFooter>
      </Card>

      <Card className="bg-[#161616] border border-[#232323] hover:border-[#2a2a2a] transition-colors @container/card">
        <CardHeader>
          <CardDescription>On-time Renewals</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-white mt-2">
            92%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="w-3.5 h-3.5" />
              +3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium text-white items-center">
            Great renewal rate
            <IconTrendingUp className="size-4 text-green-400" />
          </div>
          <div className="text-gray-400 text-xs">Most riders renew on time</div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Dashboard() {

  const [plans, isLoading, error] = usePlans();

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
      <main className="flex-1 flex flex-col items-center py-12 w-full">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <MotorcycleInsuranceSummaryCards nextPayment={summary.nextPayment} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center justify-start lg:justify-end gap-2 mb-4">
                <BarChart2 size={24} className="text-[#d9fc09]" />
                <span className="text-lg text-white font-bold">Activity Overview</span>
              </div>
              <div className="bg-[#161616] rounded-xl shadow-lg border border-[#232323] hover:border-[#2a2a2a] transition-colors">
                <div className="flex flex-col items-start lg:items-end justify-center text-left lg:text-right p-8 space-y-6">
                  <div className="space-y-3 w-full">
                    <div className="text-sm text-gray-400">
                      Last claim filed
                      <div className="text-[#d9fc09] font-semibold mt-1">{summary.lastClaim}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Current plan
                      <div className="text-[#d9fc09] font-semibold mt-1">{summary.currentPlan}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Policies
                      <div className="text-white font-medium mt-1">
                        {summary.activePolicies} active, {summary.totalPolicies - summary.activePolicies} expired
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Claims
                      <div className="text-white font-medium mt-1">
                        {summary.paidClaims} paid, {summary.processingClaims} processing, {summary.rejectedClaims} rejected
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#d9fc09] text-[#161616] font-semibold text-sm shadow-lg">
                    <CheckCircle2 size={18} className="mr-2" />
                    You are fully covered!
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              </div>
              <UserActivityTable claims={mockClaims} policies={mockPolicies} />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Available Insurance Plans</h2>
            <p className="text-gray-400">Choose the perfect coverage for your boda boda</p>
          </div>

          {isLoading && <div className="text-white">Loading plans...</div>}
          {error && <div className="text-red-500">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(plans as Array<any> ?? [])?.map((plan: any) => (
              <div
                key={plan._id || plan.id || plan.name}
                className={`relative bg-[#161616] rounded-2xl p-8 flex flex-col shadow-xl border transition-all hover:shadow-2xl hover:-translate-y-1 ${plan.type === "comprehensive"
                    ? "border-[#d9fc09] ring-2 ring-[#d9fc09] ring-opacity-50"
                    : "border-[#232323] hover:border-[#2a2a2a]"
                  }`}
              >
                {plan.type === "comprehensive" && (
                  <span className="absolute -top-3 right-8 text-xs px-4 py-1.5 rounded-full bg-[#d9fc09] text-[#161616] font-bold shadow-lg">
                    Most Popular
                  </span>
                )}

                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-[#d9fc09]/10 mr-3">
                    <ShieldCheck size={28} className="text-[#d9fc09]" />
                  </div>
                  <div className="text-xl text-white font-bold">{plan.name}</div>
                </div>

                <div className="text-3xl text-white font-bold mb-2">
                  {typeof plan.premium === "number"
                    ? `KES ${plan.premium.toLocaleString()} / year`
                    : ""}
                </div>
                <div className="text-gray-400 text-sm mb-6 leading-relaxed">{plan.description}</div>

                <ul className="mb-8 flex-1 space-y-3">
                  {(plan.inclusions || []).map((f: any, i: any) => (
                    <li className="flex items-start gap-3 text-gray-200 text-sm" key={i}>
                      <BadgePercent size={18} className="text-[#d9fc09] mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <button
                    className={`w-full px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg ${plan.type === "comprehensive"
                        ? "bg-[#d9fc09] text-[#161616] hover:bg-[#e5ff1a]"
                        : "bg-[#232323] text-white hover:bg-[#2a2a2a]"
                      }`}
                    onClick={() => alert(`Selected plan: ${plan.name}`)}
                  >
                    Choose Plan
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1a1a1a] text-[#d9fc09] hover:bg-[#202020] border border-[#232323] hover:border-[#2a2a2a] transition-all text-sm font-medium"
                    onClick={() => alert(`More info: ${plan.name}`)}
                  >
                    <Info size={16} /> More Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}