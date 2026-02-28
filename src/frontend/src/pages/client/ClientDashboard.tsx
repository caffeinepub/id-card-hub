import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ClipboardList,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { ClientOrder, UserProfile } from "../../backend.d.ts";
import { ClientOrderStatusBadge } from "../../components/ClientOrderStatusBadge";
import { OrderProgressBar } from "../../components/OrderProgressBar";
import { useMyClientOrders } from "../../hooks/useQueries";

const formatDate = (ts: bigint) => {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
};

interface ClientDashboardProps {
  userProfile: UserProfile | null;
  onNewOrder: () => void;
  onViewOrder: (orderId: bigint) => void;
}

function OrderCard({
  order,
  onView,
}: {
  order: ClientOrder;
  onView: (id: bigint) => void;
}) {
  return (
    <Card className="border-border/60 shadow-card hover:shadow-elevated transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-foreground truncate">
              {order.institutionName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.cardLayoutChoice} •{" "}
              {Number(order.cardQuantity).toLocaleString()} cards
            </p>
          </div>
          <ClientOrderStatusBadge status={order.status} />
        </div>

        <OrderProgressBar status={order.status} compact />

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            Submitted {formatDate(order.createdAt)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-xs gap-1 text-primary hover:text-primary"
            onClick={() => onView(order.id)}
          >
            View Details
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ClientDashboard({
  userProfile,
  onNewOrder,
  onViewOrder,
}: ClientDashboardProps) {
  const { data: orders = [], isLoading } = useMyClientOrders();

  const sortedOrders = [...orders].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const activeOrders = orders.filter((o) => o.status !== "delivered").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              Client Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Welcome{userProfile?.name ? `, ${userProfile.name}` : " back"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your ID card orders and track progress.
          </p>
        </div>
        <Button
          onClick={onNewOrder}
          className="gap-2 shrink-0 h-10"
          size="default"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">
                {isLoading ? "—" : orders.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">
                {isLoading ? "—" : activeOrders}
              </p>
              <p className="text-xs text-muted-foreground">Active Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card col-span-2 sm:col-span-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">
                {isLoading
                  ? "—"
                  : orders
                      .reduce((sum, o) => sum + Number(o.cardQuantity), 0)
                      .toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Cards</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders list */}
      <div>
        <CardHeader className="px-0 pb-4">
          <CardTitle className="font-display text-lg">Your Orders</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-border/60 rounded-xl p-12 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="font-display font-semibold text-foreground mb-2">
              No orders yet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Submit your first order to get started with ID card production.
            </p>
            <Button onClick={onNewOrder} className="gap-2">
              <Plus className="h-4 w-4" />
              Submit First Order
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sortedOrders.map((order, i) => (
              <motion.div
                key={order.id.toString()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <OrderCard order={order} onView={onViewOrder} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
