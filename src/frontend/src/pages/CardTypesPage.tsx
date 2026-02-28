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
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { CardType } from "../backend.d.ts";
import {
  useAllCardTypes,
  useCreateCardType,
  useDeleteCardType,
  useUpdateCardType,
} from "../hooks/useQueries";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const emptyCardType = (): CardType => ({
  id: BigInt(0),
  name: "",
  description: "",
  pricePerCard: 0,
  turnaroundDays: BigInt(5),
});

function CardTypeFormModal({
  open,
  onClose,
  editCardType,
}: {
  open: boolean;
  onClose: () => void;
  editCardType?: CardType | null;
}) {
  const createCardType = useCreateCardType();
  const updateCardType = useUpdateCardType();

  const [form, setForm] = useState<CardType>(editCardType ?? emptyCardType());
  const isLoading = createCardType.isPending || updateCardType.isPending;
  const isEdit = !!editCardType;

  const updateField = (
    field: keyof CardType,
    value: string | number | bigint,
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.pricePerCard <= 0) return;

    if (isEdit && editCardType) {
      await updateCardType.mutateAsync({ id: editCardType.id, cardType: form });
    } else {
      await createCardType.mutateAsync(form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Card Type" : "New Card Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>
              Card Type Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Premium PVC Card"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the card specifications, materials, features…"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Price per Card ($) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-9"
                  min="0.01"
                  step="0.01"
                  value={form.pricePerCard}
                  onChange={(e) =>
                    updateField(
                      "pricePerCard",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Turnaround (days)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-9"
                  min="1"
                  value={form.turnaroundDays.toString()}
                  onChange={(e) =>
                    updateField(
                      "turnaroundDays",
                      BigInt(Number.parseInt(e.target.value) || 1),
                    )
                  }
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || !form.name.trim() || form.pricePerCard <= 0
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Card Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCardTypeDialog({
  cardType,
  onClose,
}: {
  cardType: CardType | null;
  onClose: () => void;
}) {
  const deleteCardType = useDeleteCardType();

  return (
    <AlertDialog open={!!cardType} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Card Type?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the{" "}
            <span className="font-semibold">{cardType?.name}</span> card type.
            Existing orders referencing this type will not be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              if (cardType) {
                await deleteCardType.mutateAsync(cardType.id);
                onClose();
              }
            }}
          >
            {deleteCardType.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CardTypesPage() {
  const { data: cardTypes = [], isLoading } = useAllCardTypes();
  const [formOpen, setFormOpen] = useState(false);
  const [editCardType, setEditCardType] = useState<CardType | null>(null);
  const [deleteCardType, setDeleteCardType] = useState<CardType | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Card Types
          </h1>
          <p className="text-muted-foreground mt-1">
            {cardTypes.length} card types configured
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Card Type
        </Button>
      </div>

      {/* Grid view */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {["s1", "s2", "s3", "s4"].map((k) => (
            <Skeleton key={k} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : cardTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border/60 shadow-card">
          <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground">No card types yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Create your first card type to start taking orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cardTypes.map((ct) => (
            <div
              key={ct.id.toString()}
              className="bg-card rounded-xl border border-border/60 shadow-card p-5 flex flex-col gap-4 hover:shadow-elevated transition-shadow duration-200"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold font-display truncate">
                      {ct.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ID: {ct.id.toString().padStart(4, "0")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditCardType(ct)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteCardType(ct)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              {ct.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ct.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 pt-1 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {formatCurrency(ct.pricePerCard)}
                  </span>
                  <span className="text-xs text-muted-foreground">/card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {ct.turnaroundDays.toString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    day turnaround
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CardTypeFormModal
        open={formOpen || !!editCardType}
        onClose={() => {
          setFormOpen(false);
          setEditCardType(null);
        }}
        editCardType={editCardType}
      />
      <DeleteCardTypeDialog
        cardType={deleteCardType}
        onClose={() => setDeleteCardType(null)}
      />
    </div>
  );
}
