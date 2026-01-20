"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Subscription } from "@/services/subscriptions";
import { User, Package, CheckCircle2, XCircle, Clock, Ban } from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return <CheckCircle2 className="w-4 h-4" />;
    case "CANCELED":
      return <Ban className="w-4 h-4" />;
    case "EXPIRED":
      return <XCircle className="w-4 h-4" />;
    case "PENDING":
      return <Clock className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-700 dark:border-green-700";
    case "CANCELED":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-700 dark:border-red-700";
    case "EXPIRED":
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-600 dark:border-gray-600";
    case "PENDING":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-700 dark:border-yellow-700";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-600 dark:border-gray-600";
  }
};

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const subscriptionColumns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "user.name",
    header: "User",
    enableSorting: true,
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#56CCA9]/10 border-2 border-[#18191F] dark:border-gray-300 flex items-center justify-center">
            <User className="w-5 h-5 text-[#56CCA9]" />
          </div>
          <div>
            <p className="font-medium text-[#18191F] dark:text-white">
              {user.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "plan.name",
    header: "Plan",
    enableSorting: true,
    cell: ({ row }) => {
      const plan = row.original.plan;
      return (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#56CCA9]" />
          <span className="font-medium text-[#18191F] dark:text-white">
            {plan.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "planPrice.amount",
    header: "Price",
    enableSorting: true,
    cell: ({ row }) => {
      const price = row.original.planPrice;
      return (
        <div className="flex flex-col">
          <span className="font-bold text-[#18191F] dark:text-white">
            {formatPrice(price.amount, price.currency)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {price.interval === "MONTHLY" ? "per month" : "per year"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
            status
          )}`}
        >
          {getStatusIcon(status)}
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "currentPeriodStart",
    header: "Period",
    enableSorting: true,
    cell: ({ row }) => {
      const subscription = row.original;
      return (
        <div className="text-sm">
          <p className="text-gray-600 dark:text-gray-300">
            {formatDate(subscription.currentPeriodStart)}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            to {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "startedAt",
    header: "Started",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatDate(row.original.startedAt)}
        </span>
      );
    },
  },
];
