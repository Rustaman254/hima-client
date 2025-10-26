"use client";

import { useEffect, useState } from "react";
import Header from "@/components/shared-components/Header";
import { ShieldCheck, BadgeHelp, TrendingUp, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";

interface Policy {
  _id: string;
  policyNumber: string;
  bodaRegNo: string;
  plan?: { name?: string };
  status: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  coverageAmount: number;
  premiumPaid: number;
}

interface Claim {
  _id: string;
  claimNumber: string;
  bodaRegNo: string;
  incidentDate: string;
  amountClaimed: number;
  status: string;
  chainTx?: string;
}

export default function Dashboard() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [policyRes, claimRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/insurance/policies/me`, { headers: getAuthHeaders() }),
          fetch(`${baseUrl}/api/v1/insurance/claims`, { headers: getAuthHeaders() }),
        ]);

        const policyData = await policyRes.json();
        const claimData = await claimRes.json();
        setPolicies(policyData.policies || []);
        setClaims(claimData.claims || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthlyData = aggregateMonthlyData(policies, claims);
  const claimStatusStats = aggregateClaimStatus(claims);
  const totalPremium = policies.reduce((a, b) => a + (b.premiumPaid || 0), 0);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0b] text-white">
      <Header />
      <main className="py-12 px-6 max-w-7xl mx-auto space-y-10">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Policies"
            value={policies.length}
            icon={<ShieldCheck />}
            change="+4%"
            trend="up"
          />
          <SummaryCard
            title="Active Policies"
            value={policies.filter((p) => p.isActive).length}
            icon={<TrendingUp />}
            change="+8%"
            trend="up"
          />
          <SummaryCard
            title="Total Claims"
            value={claims.length}
            icon={<BadgeHelp />}
            change="+12%"
            trend="up"
          />
          <SummaryCard
            title="Total Premium"
            value={`${totalPremium.toLocaleString()} KES`}
            icon={<TrendingDown />}
            change="+6%"
            trend="down"
          />
        </div>

        {/* 3 Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Claims by Status">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={claimStatusStats}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {claimStatusStats.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={`hsl(var(--chart-${(idx % 5) + 1}))`}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Policy Growth (Line)">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid stroke="hsl(var(--muted))" vertical={false} />
                  <XAxis dataKey="month" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Line
                    type="monotone"
                    dataKey="policies"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="claims"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Premium Distribution">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid stroke="hsl(var(--muted))" vertical={false} />
                  <XAxis dataKey="month" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Bar
                    dataKey="policies"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <DataTable title="My Policies" dataType="policy" data={policies} />
          <DataTable title="My Claims" dataType="claim" data={claims} />
        </div>

        {/* Monthly Activity and Side Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <div className="lg:col-span-3">
            <Card className="bg-[#161616] border border-[#232323]">
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>Policies and Claims</CardDescription>
              </CardHeader>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid stroke="hsl(var(--muted))" vertical={false} />
                    <XAxis dataKey="month" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" />
                    <Bar
                      dataKey="policies"
                      fill="hsl(var(--chart-1))"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="claims"
                      fill="hsl(var(--chart-2))"
                      radius={[5, 5, 0, 0]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          </div>

          <ChartCard title="Policies by Vehicle">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={vehicleData(policies)}>
                  <CartesianGrid stroke="hsl(var(--muted))" vertical={false} />
                  <XAxis dataKey="bodaRegNo" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-3))"
                    radius={[5, 5, 0, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        </div>
      </main>
    </div>
  );
}

/* ---------- Helper Components ---------- */

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: string;
  trend?: "up" | "down";
}

function SummaryCard({ title, value, icon, change, trend }: SummaryCardProps) {
  const trendColor =
    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400";

  return (
    <Card className="bg-[#161616] border border-[#232323] hover:border-[#2a2a2a]">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-bold text-white mt-2">{value}</CardTitle>
        <div className={`flex items-center gap-2 text-sm ${trendColor}`}>
          {icon} <span className="text-[#d9fc09]">{change}</span>
        </div>
      </CardHeader>
    </Card>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="bg-[#161616] border border-[#232323] h-[400px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="p-4 h-[300px]">{children}</div>
    </Card>
  );
}

type DataType = "policy" | "claim";

interface DataTableProps {
  title: string;
  dataType: DataType;
  data: Policy[] | Claim[];
}

function DataTable({ title, dataType, data }: DataTableProps) {
  return (
    <div className="bg-[#161616] rounded-xl border border-[#232323] p-5">
      <h2 className="text-lg font-bold mb-4 text-white">{title}</h2>
      <Table className="border border-[#232323] rounded-xl">
        <TableHeader>
          <TableRow>
            {dataType === "policy" ? (
              <>
                <TableHead className="text-gray-400">Policy #</TableHead>
                <TableHead className="text-gray-400">Vehicle</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Coverage</TableHead>
                <TableHead className="text-gray-400">Premium</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
              </>
            ) : (
              <>
                <TableHead className="text-gray-400">Claim #</TableHead>
                <TableHead className="text-gray-400">Vehicle</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d._id}>
              {dataType === "policy" ? (
                <>
                  <TableCell>{(d as Policy).policyNumber}</TableCell>
                  <TableCell>{(d as Policy).bodaRegNo}</TableCell>
                  <TableCell>{(d as Policy).plan?.name}</TableCell>
                  <TableCell>{(d as Policy).coverageAmount?.toLocaleString()} KES</TableCell>
                  <TableCell>{(d as Policy).premiumPaid?.toLocaleString()} KES</TableCell>
                  <TableCell>{(d as Policy).status}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>{(d as Claim).claimNumber}</TableCell>
                  <TableCell>{(d as Claim).bodaRegNo}</TableCell>
                  <TableCell>{new Date((d as Claim).incidentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{(d as Claim).amountClaimed?.toLocaleString()} KES</TableCell>
                  <TableCell>{(d as Claim).status}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------- Data Helpers ---------- */
function aggregateMonthlyData(policies: Policy[], claims: Claim[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    month,
    policies: policies.filter((p) => new Date(p.startDate).getMonth() === i).length,
    claims: claims.filter((c) => new Date(c.incidentDate).getMonth() === i).length,
  }));
}

function aggregateClaimStatus(claims: Claim[]) {
  const counts: Record<string, number> = {};
  claims.forEach((c) => (counts[c.status] = (counts[c.status] || 0) + 1));
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function vehicleData(policies: Policy[]) {
  const vehicleMap: Record<string, number> = {};
  policies.forEach((p) => (vehicleMap[p.bodaRegNo] = (vehicleMap[p.bodaRegNo] || 0) + 1));
  return Object.entries(vehicleMap).map(([bodaRegNo, count]) => ({ bodaRegNo, count }));
}
