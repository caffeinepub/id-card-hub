import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "status-pending border",
  },
  inProduction: {
    label: "In Production",
    className: "status-inProduction border",
  },
  ready: {
    label: "Ready",
    className: "status-ready border",
  },
  delivered: {
    label: "Delivered",
    className: "status-delivered border",
  },
  cancelled: {
    label: "Cancelled",
    className: "status-cancelled border",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "inProduction", label: "In Production" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];
