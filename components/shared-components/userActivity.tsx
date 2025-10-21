"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type ActivityRow = {
  id: number | string;
  type: "claim" | "policy";
  date: string;
  action: string;
  status: string;
  details: string;
};

type ClaimInput = {
  id: number | string;
  dateFiled?: string;
  date?: string;
  status: string;
  description?: string;
  type?: string;
};

type PolicyInput = {
  id: number | string;
  issueDate?: string;
  renewalDate?: string;
  createdAt?: string;
  active: boolean;
  name?: string;
  planType?: string;
};

const combineData = (claims: ClaimInput[] = [], policies: PolicyInput[] = []): ActivityRow[] => {
  const claimRows = claims.map((c, idx) => ({
    id: `claim-${c.id ?? idx}`,
    type: "claim" as const,
    date: c.dateFiled || c.date || "",
    action: "Claim Filed",
    status: c.status,
    details: c.description || c.type || "",
  }));

  const policyRows = policies.map((p, idx) => ({
    id: `policy-${p.id ?? idx}`,
    type: "policy" as const,
    date: p.renewalDate || p.issueDate || p.createdAt || "",
    action: "Policy Active",
    status: p.active ? "Active" : "Expired",
    details: p.name || p.planType || "",
  }));

  return [...claimRows, ...policyRows]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((row, idx) => ({ ...row, id: idx + 1 }));
};

const columns: ColumnDef<ActivityRow>[] = [
  {
    header: "Date",
    accessorKey: "date",
    cell: (row) => <span className="font-mono text-white">{row.getValue<string>()}</span>,
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: (row) =>
      row.getValue<string>() === "claim" ? (
        <Badge variant="outline" className="bg-[#0d232c] border-blue-600 text-blue-400">Claim</Badge>
      ) : (
        <Badge variant="outline" className="bg-[#2c230d] border-green-600 text-green-400">Policy</Badge>
      ),
  },
  {
    header: "Action",
    accessorKey: "action",
    cell: (row) => <span className="text-white">{row.getValue<string>()}</span>,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => {
      const v = row.getValue<string>();
      if (v === "Completed" || v === "Paid" || v === "Active") {
        return <Badge variant="default" className="bg-green-600 text-white">{v}</Badge>;
      }
      if (v === "Processing" || v === "Pending") {
        return <Badge variant="outline" className="border-yellow-400 text-yellow-300">{v}</Badge>;
      }
      if (v === "Rejected" || v === "Expired" || v === "Cancelled") {
        return <Badge variant="outline" className="border-red-400 text-red-300">{v}</Badge>;
      }
      return <Badge variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">{v}</Badge>;
    },
  },
  {
    header: "Details",
    accessorKey: "details",
    cell: (row) => <span className="text-gray-200">{row.getValue<string>()}</span>,
  },
];

export default function UserActivityTable({
  claims = [],
  policies = [],
}: {
  claims?: ClaimInput[];
  policies?: PolicyInput[];
}) {
  const [rows] = React.useState<ActivityRow[]>(combineData(claims, policies));
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: rows,
    columns,
    pageCount: Math.ceil(rows.length / pagination.pageSize),
    state: { pagination },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    manualPagination: false,
  });

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-[#161616] rounded-xl border border-[#232323] shadow-lg">
      <div className="overflow-x-auto rounded-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-300 bg-[#232323] font-medium">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-gray-400">
                  No recent activity.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-5 pb-4 pt-2">
        <span className="text-sm text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            className="rounded-full"
          >
            <IconChevronLeft className="w-4 h-4" />
            <span className="sr-only">First</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="rounded-full"
          >
            <IconChevronLeft className="w-4 h-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="rounded-full"
          >
            <IconChevronRight className="w-4 h-4" />
            <span className="sr-only">Next</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            className="rounded-full"
          >
            <IconChevronRight className="w-4 h-4" />
            <span className="sr-only">Last</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
