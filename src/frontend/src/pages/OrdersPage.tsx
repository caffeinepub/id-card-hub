import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Order } from "../backend.d.ts";
import { ORDER_STATUSES, StatusBadge } from "../components/StatusBadge";
import {
  useAllCardTypes,
  useAllCustomers,
  useAllOrders,
  useCreateOrder,
  useDeleteOrder,
  useUpdateOrder,
} from "../hooks/useQueries";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (ts: bigint) => {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
};

function OrderFormModal({
  open,
  onClose,
  editOrder,
}: {
  open: boolean;
  onClose: () => void;
  editOrder?: Order | null;
}) {
  const { data: customers = [] } = useAllCustomers();
  const { data: cardTypes = [] } = useAllCardTypes();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  const [customerId, setCustomerId] = useState<string>(
    editOrder ? editOrder.customerId.toString() : "",
  );
  const [cardTypeId, setCardTypeId] = useState<string>(
    editOrder ? editOrder.cardTypeId.toString() : "",
  );
  const [quantity, setQuantity] = useState<string>(
    editOrder ? editOrder.quantity.toString() : "100",
  );
  const [notes, setNotes] = useState(editOrder?.notes ?? "");
  const [status, setStatus] = useState(editOrder?.status ?? "pending");

  const selectedCardType = cardTypes.find(
    (ct) => ct.id.toString() === cardTypeId,
  );
  const qty = Number.parseInt(quantity) || 0;
  const totalPrice = selectedCardType ? selectedCardType.pricePerCard * qty : 0;

  const isLoading = createOrder.isPending || updateOrder.isPending;
  const isEdit = !!editOrder;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !cardTypeId || qty <= 0) return;

    const orderData: Order = {
      id: editOrder?.id ?? BigInt(0),
      customerId: BigInt(customerId),
      cardTypeId: BigInt(cardTypeId),
      quantity: BigInt(qty),
      totalPrice,
      notes,
      status: isEdit ? status : "pending",
      createdAt: editOrder?.createdAt ?? BigInt(Date.now()) * BigInt(1_000_000),
      updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
    };

    if (isEdit && editOrder) {
      await updateOrder.mutateAsync({ id: editOrder.id, order: orderData });
    } else {
      await createOrder.mutateAsync(orderData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Order" : "New Order"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id.toString()} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Card Type</Label>
            <Select value={cardTypeId} onValueChange={setCardTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a card type" />
              </SelectTrigger>
              <SelectContent>
                {cardTypes.map((ct) => (
                  <SelectItem key={ct.id.toString()} value={ct.id.toString()}>
                    {ct.name} — {formatCurrency(ct.pricePerCard)}/card
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 100"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Price</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium tabular-nums text-muted-foreground">
                {formatCurrency(totalPrice)}
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions, artwork specs, delivery notes…"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !customerId || !cardTypeId || qty <= 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteOrderDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const deleteOrder = useDeleteOrder();

  const handleDelete = async () => {
    if (!order) return;
    await deleteOrder.mutateAsync(order.id);
    onClose();
  };

  return (
    <AlertDialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Order?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete order{" "}
            <span className="font-mono font-semibold">
              #{order?.id.toString().padStart(4, "0")}
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            {deleteOrder.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function OrdersPage() {
  const { data: orders = [], isLoading } = useAllOrders();
  const { data: customers = [] } = useAllCustomers();
  const { data: cardTypes = [] } = useAllCardTypes();

  const customerMap = Object.fromEntries(
    customers.map((c) => [c.id.toString(), c]),
  );
  const cardTypeMap = Object.fromEntries(
    cardTypes.map((ct) => [ct.id.toString(), ct]),
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            {orders.length} total orders
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground mr-1">Filter:</span>
        {[{ value: "all", label: "All" }, ...ORDER_STATUSES].map((s) => (
          <button
            type="button"
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.label}
            {s.value !== "all" && (
              <span className="ml-1.5 opacity-70">
                ({orders.filter((o) => o.status === s.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/60 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
              <Skeleton key={k} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">
              {statusFilter === "all"
                ? "No orders yet"
                : `No ${statusFilter} orders`}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {statusFilter === "all"
                ? "Create your first order to get started."
                : "Try changing the filter to see other orders."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3.5">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Customer
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Card Type
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Qty
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Total
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => {
                  const customer = customerMap[order.customerId.toString()];
                  const cardType = cardTypeMap[order.cardTypeId.toString()];
                  return (
                    <tr
                      key={order.id.toString()}
                      className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground font-medium">
                        #{order.id.toString().padStart(4, "0")}
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {customer?.name ?? (
                          <span className="text-muted-foreground/60 italic">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {cardType?.name ?? (
                          <span className="text-muted-foreground/60 italic">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        {order.quantity.toString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-semibold">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditOrder(order)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteOrder(order)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <OrderFormModal
        open={formOpen || !!editOrder}
        onClose={() => {
          setFormOpen(false);
          setEditOrder(null);
        }}
        editOrder={editOrder}
      />
      <DeleteOrderDialog
        order={deleteOrder}
        onClose={() => setDeleteOrder(null)}
      />
    </div>
  );
}
