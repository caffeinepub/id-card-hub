import { cn } from "@/lib/utils";
import { OrderStatus } from "../backend";

interface ClientOrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    [OrderStatus.submitted]: {
      label: "Submitted",
      className: "status-submitted border",
    },
    [OrderStatus.inReview]: {
      label: "In Review",
      className: "status-inReview border",
    },
    [OrderStatus.designing]: {
      label: "Designing",
      className: "status-designing border",
    },
    [OrderStatus.printing]: {
      label: "Printing",
      className: "status-printing border",
    },
    [OrderStatus.dispatched]: {
      label: "Dispatched",
      className: "status-dispatched border",
    },
    [OrderStatus.delivered]: {
      label: "Delivered",
      className: "status-client-delivered border",
    },
  };

export function ClientOrderStatusBadge({
  status,
  className,
}: ClientOrderStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: String(status),
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

export const CLIENT_ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.submitted, label: "Submitted" },
  { value: OrderStatus.inReview, label: "In Review" },
  { value: OrderStatus.designing, label: "Designing" },
  { value: OrderStatus.printing, label: "Printing" },
  { value: OrderStatus.dispatched, label: "Dispatched" },
  { value: OrderStatus.delivered, label: "Delivered" },
];
