import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { OrderStatus } from "../backend";

const STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: OrderStatus.submitted, label: "Submitted" },
  { status: OrderStatus.inReview, label: "In Review" },
  { status: OrderStatus.designing, label: "Designing" },
  { status: OrderStatus.printing, label: "Printing" },
  { status: OrderStatus.dispatched, label: "Dispatched" },
  { status: OrderStatus.delivered, label: "Delivered" },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  [OrderStatus.submitted]: 0,
  [OrderStatus.inReview]: 1,
  [OrderStatus.designing]: 2,
  [OrderStatus.printing]: 3,
  [OrderStatus.dispatched]: 4,
  [OrderStatus.delivered]: 5,
};

interface OrderProgressBarProps {
  status: OrderStatus;
  compact?: boolean;
}

export function OrderProgressBar({
  status,
  compact = false,
}: OrderProgressBarProps) {
  const currentIndex = STATUS_ORDER[status] ?? 0;

  return (
    <div className={cn("w-full", compact ? "py-2" : "py-4")}>
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />
        {/* Completed line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-500"
          style={{
            width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`,
          }}
        />

        {STATUS_STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;

          return (
            <div
              key={step.status}
              className="relative flex flex-col items-center z-10"
            >
              {/* Circle */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                  compact ? "w-6 h-6" : "w-8 h-8",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                      ? "bg-background border-primary text-primary"
                      : "bg-background border-border text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                ) : (
                  <span
                    className={cn(
                      "font-bold",
                      compact ? "text-[9px]" : "text-[10px]",
                    )}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              {/* Label */}
              {!compact && (
                <span
                  className={cn(
                    "absolute top-10 text-[10px] font-medium whitespace-nowrap",
                    isCompleted || isActive
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {!compact && <div className="h-6" />}
    </div>
  );
}
