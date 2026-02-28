import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Download,
  Edit2,
  ExternalLink,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, PersonRole } from "../../backend";
import { ClientOrderStatusBadge } from "../../components/ClientOrderStatusBadge";
import { OrderProgressBar } from "../../components/OrderProgressBar";
import {
  useAllCardTypes,
  useClientOrder,
  useStudentRecordsByOrder,
  useUpdateClientOrder,
} from "../../hooks/useQueries";

const formatDate = (ts: bigint) => {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
};

interface OrderDetailPageProps {
  orderId: bigint;
  onBack: () => void;
  onAddStudents: (orderId: bigint) => void;
}

export function OrderDetailPage({
  orderId,
  onBack,
  onAddStudents,
}: OrderDetailPageProps) {
  const { data: order, isLoading } = useClientOrder(orderId);
  const { data: records = [], isLoading: recordsLoading } =
    useStudentRecordsByOrder(orderId);
  const { data: cardTypes = [] } = useAllCardTypes();
  const updateOrder = useUpdateClientOrder();

  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editInstitution, setEditInstitution] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editLayout, setEditLayout] = useState("");
  const [editColors, setEditColors] = useState("");

  const startEditing = () => {
    if (!order) return;
    setEditInstitution(order.institutionName);
    setEditContact(order.contactPerson);
    setEditPhone(order.contactPhone);
    setEditEmail(order.contactEmail);
    setEditAddress(order.deliveryAddress);
    setEditQuantity(order.cardQuantity.toString());
    setEditLayout(order.cardLayoutChoice);
    setEditColors(order.colorPreferences);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!order) return;
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    await updateOrder.mutateAsync({
      id: orderId,
      order: {
        ...order,
        institutionName: editInstitution,
        contactPerson: editContact,
        contactPhone: editPhone,
        contactEmail: editEmail,
        deliveryAddress: editAddress,
        cardQuantity: BigInt(Number.parseInt(editQuantity) || 0),
        cardLayoutChoice: editLayout,
        colorPreferences: editColors,
        updatedAt: now,
      },
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 mb-3 -ml-2 text-muted-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold font-display text-foreground">
              {order.institutionName}
            </h1>
            <ClientOrderStatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Submitted {formatDate(order.createdAt)}
          </p>
        </div>
        {order.canEdit && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={startEditing}
          >
            <Edit2 className="h-4 w-4" />
            Edit Order
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1"
              onClick={handleSave}
              disabled={updateOrder.isPending}
            >
              {updateOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Status Progress */}
      <Card className="border-border/60 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">
            Order Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <OrderProgressBar status={order.status} />
        </CardContent>
      </Card>

      {/* Design Preview */}
      {order.designImageKey ? (
        <Card className="border-border/60 shadow-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Your ID Card Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/20">
              <img
                src={ExternalBlob.fromURL(order.designImageKey).getDirectURL()}
                alt="Your ID card design"
                className="w-full object-contain max-h-64"
              />
            </div>
            <a
              href={ExternalBlob.fromURL(order.designImageKey).getDirectURL()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-full"
            >
              <Button className="w-full gap-2" size="sm">
                <Download className="h-4 w-4" />
                Download Design
                <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-60" />
              </Button>
            </a>
            <p className="text-xs text-muted-foreground text-center">
              {records.length > 0
                ? `This design will be used for all ${records.length} students and staff in your order.`
                : "Review this design and contact us if you'd like any changes."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 border-dashed shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Design Pending
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Your ID card design will appear here once our team has prepared
                it.{" "}
                {records.length > 0
                  ? `It will apply to all ${records.length} students and staff in your order.`
                  : "We'll have it ready for your review soon."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      <Card className="border-border/60 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution Name</Label>
                <Input
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Delivery Address</Label>
                <Textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Card Quantity</Label>
                <Input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Card Layout</Label>
                <Select value={editLayout} onValueChange={setEditLayout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cardTypes.map((ct) => (
                      <SelectItem key={ct.id.toString()} value={ct.name}>
                        {ct.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Color Preferences</Label>
                <Input
                  value={editColors}
                  onChange={(e) => setEditColors(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Institution
                  </p>
                  <p className="text-sm font-medium">{order.institutionName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Contact Person
                  </p>
                  <p className="text-sm font-medium">{order.contactPerson}</p>
                </div>
              </div>
              {order.contactPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Phone
                    </p>
                    <p className="text-sm font-medium">{order.contactPhone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="text-sm font-medium">{order.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Delivery Address
                  </p>
                  <p className="text-sm font-medium">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Card Quantity
                  </p>
                  <p className="text-sm font-medium">
                    {Number(order.cardQuantity).toLocaleString()} cards
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Card Layout
                  </p>
                  <p className="text-sm font-medium">
                    {order.cardLayoutChoice}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Submitted
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              {order.colorPreferences && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground/30 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Color Preferences
                    </p>
                    <p className="text-sm font-medium">
                      {order.colorPreferences}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!order.canEdit && !isEditing && (
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/40">
              Editing is currently locked. Contact the admin to request changes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* People */}
      <Card className="border-border/60 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              People ({records.length})
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 h-8"
              onClick={() => onAddStudents(orderId)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add More
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mb-4">
                No people added yet
              </p>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => onAddStudents(orderId)}
              >
                <Plus className="h-4 w-4" />
                Add Students & Staff
              </Button>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {records.map((record) => (
                <div
                  key={record.id.toString()}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/40"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    {record.photoKey && (
                      <AvatarImage
                        src={ExternalBlob.fromURL(
                          record.photoKey,
                        ).getDirectURL()}
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
                        (record.role === PersonRole.staff
                          ? "Staff"
                          : "Student")}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs shrink-0 ${record.role === PersonRole.staff ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    {record.role === PersonRole.staff ? "Staff" : "Student"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
