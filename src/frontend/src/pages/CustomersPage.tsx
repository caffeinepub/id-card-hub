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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Customer } from "../backend.d.ts";
import {
  useAllCustomers,
  useAllOrders,
  useCreateCustomer,
  useDeleteCustomer,
  useUpdateCustomer,
} from "../hooks/useQueries";

const formatDate = (ts: bigint) => {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
};

const emptyCustomer = (): Customer => ({
  id: BigInt(0),
  name: "",
  email: "",
  phone: "",
  address: "",
  createdAt: BigInt(Date.now()) * BigInt(1_000_000),
});

function CustomerFormModal({
  open,
  onClose,
  editCustomer,
}: {
  open: boolean;
  onClose: () => void;
  editCustomer?: Customer | null;
}) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [form, setForm] = useState<Customer>(editCustomer ?? emptyCustomer());
  const isLoading = createCustomer.isPending || updateCustomer.isPending;
  const isEdit = !!editCustomer;

  const update = (field: keyof Customer, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    if (isEdit && editCustomer) {
      await updateCustomer.mutateAsync({ id: editCustomer.id, customer: form });
    } else {
      await createCustomer.mutateAsync(form);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Acme Corporation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                className="pl-9"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="contact@company.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.name.trim() || !form.email.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCustomerDialog({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  const deleteCustomer = useDeleteCustomer();

  return (
    <AlertDialog open={!!customer} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold">{customer?.name}</span> and all
            their data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              if (customer) {
                await deleteCustomer.mutateAsync(customer.id);
                onClose();
              }
            }}
          >
            {deleteCustomer.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CustomersPage() {
  const { data: customers = [], isLoading } = useAllCustomers();
  const { data: orders = [] } = useAllOrders();

  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");

  // Order count per customer
  const orderCountMap = orders.reduce<Record<string, number>>((acc, order) => {
    const key = order.customerId.toString();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedCustomers = [...filteredCustomers].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">
            {customers.length} total customers
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/60 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <Skeleton key={k} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : sortedCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">
              {search ? "No customers match your search" : "No customers yet"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {search
                ? "Try a different search term."
                : "Add your first customer to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3.5">
                    Name
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Email
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Phone
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Address
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Orders
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">
                    Since
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map((customer) => (
                  <tr
                    key={customer.id.toString()}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <a
                        href={`mailto:${customer.email}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {customer.email}
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {customer.phone || (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground max-w-[200px] truncate">
                      {customer.address || (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tabular-nums">
                        {orderCountMap[customer.id.toString()] ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditCustomer(customer)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteCustomer(customer)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerFormModal
        open={formOpen || !!editCustomer}
        onClose={() => {
          setFormOpen(false);
          setEditCustomer(null);
        }}
        editCustomer={editCustomer}
      />
      <DeleteCustomerDialog
        customer={deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
      />
    </div>
  );
}
