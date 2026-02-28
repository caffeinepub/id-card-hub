import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  Hammer,
  TrendingUp,
  Truck,
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import {
  useAllCardTypes,
  useAllCustomers,
  useAllOrders,
  useDashboardStats,
} from "../hooks/useQueries";

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconClassName: string;
  isLoading: boolean;
}) {
  return (
    <Card className="shadow-card border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold font-display text-foreground">
                {value}
              </p>
            )}
          </div>
          <div className={`rounded-xl p-2.5 ${iconClassName}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const { data: customers = [] } = useAllCustomers();
  const { data: cardTypes = [] } = useAllCardTypes();

  // Build lookup maps
  const customerMap = Object.fromEntries(
    customers.map((c) => [c.id.toString(), c]),
  );
  const cardTypeMap = Object.fromEntries(
    cardTypes.map((ct) => [ct.id.toString(), ct]),
  );

  // Last 8 orders sorted by createdAt desc
  const recentOrders = [...orders]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 8);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(ms));
  };

  const statCards = [
    {
      title: "Total Orders",
      value: statsLoading ? "—" : String(stats?.totalOrders ?? 0),
      icon: ClipboardList,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      title: "Pending",
      value: statsLoading ? "—" : String(stats?.pendingOrders ?? 0),
      icon: Clock,
      iconClassName: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "In Production",
      value: statsLoading ? "—" : String(stats?.inProductionOrders ?? 0),
      icon: Hammer,
      iconClassName: "bg-blue-100 text-blue-600",
    },
    {
      title: "Ready to Pickup",
      value: statsLoading ? "—" : String(stats?.readyOrders ?? 0),
      icon: CheckCircle,
      iconClassName: "bg-green-100 text-green-600",
    },
    {
      title: "Delivered",
      value: statsLoading ? "—" : String(stats?.deliveredOrders ?? 0),
      icon: Truck,
      iconClassName: "bg-muted text-muted-foreground",
    },
    {
      title: "Total Revenue",
      value: statsLoading ? "—" : formatCurrency(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      iconClassName: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">
            Overview
          </span>
        </div>
        <h1 className="text-3xl font-bold font-display text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your order pipeline and business performance.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconClassName={card.iconClassName}
            isLoading={statsLoading}
          />
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6 space-y-3">
              {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                <Skeleton key={k} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground/60">
                Orders will appear here once created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">
                      Order ID
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">
                      Customer
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">
                      Card Type
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">
                      Qty
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">
                      Total
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => {
                    const customer = customerMap[order.customerId.toString()];
                    const cardType = cardTypeMap[order.cardTypeId.toString()];
                    return (
                      <tr
                        key={order.id.toString()}
                        className={`border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors ${
                          i % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                          #{order.id.toString().padStart(4, "0")}
                        </td>
                        <td className="px-4 py-3.5 font-medium">
                          {customer?.name ?? "Unknown"}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {cardType?.name ?? "Unknown"}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums">
                          {order.quantity.toString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums font-medium">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-muted-foreground text-xs">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
