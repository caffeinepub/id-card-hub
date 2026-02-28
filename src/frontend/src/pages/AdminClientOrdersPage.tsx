import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Calendar,
  ClipboardList,
  CreditCard,
  Eye,
  Filter,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { ExternalBlob, type OrderStatus, PersonRole } from "../backend";
import type { ClientOrder } from "../backend.d.ts";
import {
  CLIENT_ORDER_STATUSES,
  ClientOrderStatusBadge,
} from "../components/ClientOrderStatusBadge";
import { OrderProgressBar } from "../components/OrderProgressBar";
import {
  useAllClientOrders,
  useRemoveClientOrderDesign,
  useSetClientOrderEditPermission,
  useStudentRecordsByOrder,
  useUpdateClientOrderStatus,
  useUploadClientOrderDesign,
  useUploadFile,
} from "../hooks/useQueries";

const formatDate = (ts: bigint) => {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
};

// ─── Order Detail Panel ───────────────────────────────────────────────────────
function OrderDetailPanel({
  order,
}: {
  order: ClientOrder;
}) {
  const { data: records = [], isLoading: recordsLoading } =
    useStudentRecordsByOrder(order.id);
  const updateStatus = useUpdateClientOrderStatus();
  const setEditPermission = useSetClientOrderEditPermission();
  const uploadFile = useUploadFile();
  const uploadDesign = useUploadClientOrderDesign();
  const removeDesign = useRemoveClientOrderDesign();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status,
  );
  const [canEdit, setCanEdit] = useState(order.canEdit);
  const [designImageKey, setDesignImageKey] = useState<string | undefined>(
    order.designImageKey,
  );
  const [isUploadingDesign, setIsUploadingDesign] = useState(false);
  const designFileInputRef = useRef<HTMLInputElement>(null);

  const handleStatusSave = async () => {
    await updateStatus.mutateAsync({ id: order.id, status: selectedStatus });
  };

  const handleEditToggle = async (val: boolean) => {
    setCanEdit(val);
    await setEditPermission.mutateAsync({ id: order.id, canEdit: val });
  };

  const handleDesignUpload = async (file: File) => {
    setIsUploadingDesign(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const key = `design-${order.id}-${Date.now()}`;
      await uploadFile.mutateAsync({ id: key, blob });
      await uploadDesign.mutateAsync({
        orderId: order.id,
        designImageKey: key,
      });
      setDesignImageKey(key);
    } finally {
      setIsUploadingDesign(false);
      if (designFileInputRef.current) designFileInputRef.current.value = "";
    }
  };

  const handleDesignRemove = async () => {
    await removeDesign.mutateAsync(order.id);
    setDesignImageKey(undefined);
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pb-6">
      {/* Order info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-xl text-foreground">
              {order.institutionName}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Order #{order.id.toString().padStart(4, "0")} •{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>
          <ClientOrderStatusBadge status={order.status} />
        </div>

        <OrderProgressBar status={order.status} />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="font-medium">{order.contactPerson}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Package className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="font-medium">
                {Number(order.cardQuantity).toLocaleString()} cards
              </p>
            </div>
          </div>
          {order.contactPhone && (
            <div className="flex items-start gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{order.contactPhone}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium truncate">{order.contactEmail}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 col-span-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery Address</p>
              <p className="font-medium">{order.deliveryAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Layout</p>
              <p className="font-medium">{order.cardLayoutChoice}</p>
            </div>
          </div>
          {order.colorPreferences && (
            <div className="flex items-start gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-muted-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Colors</p>
                <p className="font-medium">{order.colorPreferences}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin controls */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/60">
        <p className="text-sm font-semibold text-foreground">Admin Controls</p>

        {/* Status update */}
        <div className="space-y-2">
          <Label className="text-xs">Update Status</Label>
          <div className="flex gap-2">
            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_ORDER_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleStatusSave}
              disabled={
                updateStatus.isPending || selectedStatus === order.status
              }
              className="shrink-0"
            >
              {updateStatus.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </div>

        {/* Edit permission */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Allow Client to Edit</p>
            <p className="text-xs text-muted-foreground">
              Grants the client permission to modify this order
            </p>
          </div>
          <Switch
            checked={canEdit}
            onCheckedChange={handleEditToggle}
            disabled={setEditPermission.isPending}
          />
        </div>
      </div>

      {/* ID Card Design */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          ID Card Design
        </p>
        {records.length > 0 && (
          <p className="text-xs text-muted-foreground">
            This design will be applied to all {records.length} people in this
            order
          </p>
        )}

        {/* Hidden file input */}
        <input
          ref={designFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleDesignUpload(file);
          }}
        />

        {designImageKey ? (
          <div className="space-y-3">
            {/* Thumbnail preview */}
            <div className="relative rounded-xl overflow-hidden border border-border/60 bg-muted/30">
              <img
                src={ExternalBlob.fromURL(designImageKey).getDirectURL()}
                alt="ID card design"
                className="w-full object-contain max-h-48"
              />
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5"
                disabled={isUploadingDesign}
                onClick={() => designFileInputRef.current?.click()}
              >
                {isUploadingDesign ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {isUploadingDesign ? "Uploading..." : "Replace Design"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                disabled={removeDesign.isPending || isUploadingDesign}
                onClick={handleDesignRemove}
              >
                {removeDesign.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isUploadingDesign}
            onClick={() => designFileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border/60 rounded-xl text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingDesign ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-sm font-medium">Uploading design...</span>
              </>
            ) : (
              <>
                <Upload className="h-7 w-7" />
                <div className="text-center">
                  <p className="text-sm font-medium">Upload Design</p>
                  <p className="text-xs mt-0.5">
                    Click to select an image file
                  </p>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      {/* People */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            People ({records.length})
          </p>
          {records.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {records.filter((r) => r.role === PersonRole.student).length}{" "}
              students,{" "}
              {records.filter((r) => r.role === PersonRole.staff).length} staff
            </Badge>
          )}
        </div>

        {recordsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No records uploaded yet
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {records.map((record) => (
              <div
                key={record.id.toString()}
                className="flex items-center gap-3 p-2.5 bg-card rounded-lg border border-border/40"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {record.photoKey && (
                    <AvatarImage
                      src={ExternalBlob.fromURL(record.photoKey).getDirectURL()}
                      alt={record.personName}
                    />
                  )}
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                    {record.personName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {record.personName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {record.department ||
                      (record.role === PersonRole.staff ? "Staff" : "Student")}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs shrink-0 ${
                    record.role === PersonRole.staff
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {record.role === PersonRole.staff ? "Staff" : "Student"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminClientOrdersPage() {
  const { data: orders = [], isLoading } = useAllClientOrders();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null);

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">
            Admin
          </span>
        </div>
        <h1 className="text-3xl font-bold font-display text-foreground">
          Client Orders
        </h1>
        <p className="text-muted-foreground mt-1">
          {orders.length} total orders from schools and colleges.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground mr-1">Filter:</span>
        {[{ value: "all", label: "All" }, ...CLIENT_ORDER_STATUSES].map((s) => (
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
            {[1, 2, 3, 4, 5].map((k) => (
              <Skeleton key={k} className="h-14 w-full rounded" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">
              {statusFilter === "all"
                ? "No client orders yet"
                : `No ${statusFilter} orders`}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Client orders from schools and colleges will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3.5">
                    Institution
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Contact
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Qty
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Submitted
                  </th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr
                    key={order.id.toString()}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelectedOrder(order)
                    }
                    tabIndex={0}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[180px]">
                            {order.institutionName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            #{order.id.toString().padStart(4, "0")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium">{order.contactPerson}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.contactEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums">
                      {Number(order.cardQuantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <ClientOrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(v) => !v && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Order Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedOrder && <OrderDetailPanel order={selectedOrder} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
