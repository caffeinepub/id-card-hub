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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, OrderStatus } from "../../backend";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useAllCardTypes,
  useCreateClientOrder,
  useUploadFile,
} from "../../hooks/useQueries";

interface NewOrderFormProps {
  onSuccess: (orderId: bigint) => void;
  onCancel: () => void;
}

const INSTITUTION_TYPES = ["School", "College", "University"];

const INDIAN_STATES = [
  // States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function NewOrderForm({ onSuccess, onCancel }: NewOrderFormProps) {
  const { data: cardTypes = [] } = useAllCardTypes();
  const createOrder = useCreateClientOrder();
  const uploadFile = useUploadFile();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  // Existing fields
  const [institutionName, setInstitutionName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [cardQuantity, setCardQuantity] = useState("100");
  const [cardLayoutChoice, setCardLayoutChoice] = useState("");
  const [colorPreferences, setColorPreferences] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // New institution fields
  const [institutionType, setInstitutionType] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [website, setWebsite] = useState("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !institutionName.trim() ||
      !contactPerson.trim() ||
      !contactEmail.trim() ||
      !deliveryAddress.trim() ||
      !cardLayoutChoice ||
      !actor
    )
      return;

    const principal = identity?.getPrincipal();
    if (!principal) {
      toast.error("Please sign in first");
      return;
    }

    let schoolLogoKey: string | undefined;

    // Upload logo if provided
    if (logoFile) {
      try {
        const bytes = new Uint8Array(await logoFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        schoolLogoKey = `logo-${Date.now()}`;
        await uploadFile.mutateAsync({ id: schoolLogoKey, blob });
      } catch {
        toast.error("Failed to upload logo, continuing without it");
      }
    }

    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const orderData = {
      id: BigInt(0),
      institutionName: institutionName.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      deliveryAddress: deliveryAddress.trim(),
      cardQuantity: BigInt(Number.parseInt(cardQuantity) || 100),
      cardLayoutChoice,
      colorPreferences: colorPreferences.trim(),
      schoolLogoKey,
      // New fields
      institutionType: institutionType.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      website: website.trim(),
      status: OrderStatus.submitted,
      canEdit: false,
      clientPrincipal: principal,
      createdAt: now,
      updatedAt: now,
    };

    const newId = await createOrder.mutateAsync(orderData);
    onSuccess(newId);
  };

  const qty = Number.parseInt(cardQuantity) || 0;
  const isLoading = createOrder.isPending || uploadFile.isPending;
  const canSubmit =
    institutionName.trim() &&
    contactPerson.trim() &&
    contactEmail.trim() &&
    deliveryAddress.trim() &&
    cardLayoutChoice &&
    qty > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            New Order
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in your institution's ID card requirements.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1">
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Institution Info */}
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inst-name">
                  Institution Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inst-name"
                  placeholder="e.g. Springfield High School"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                />
              </div>

              {/* Institution Type */}
              <div className="space-y-2">
                <Label>Institution Type</Label>
                <Select
                  value={institutionType}
                  onValueChange={setInstitutionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-person">
                  Contact Person <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-person"
                  placeholder="e.g. Principal Johnson"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="principal@school.edu"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Chennai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* PIN Code */}
              <div className="space-y-2">
                <Label htmlFor="pin-code">PIN Code</Label>
                <Input
                  id="pin-code"
                  placeholder="e.g. 600001"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) =>
                    setPinCode(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website / Social Media</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.school.edu"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-address">
                  Delivery Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="delivery-address"
                  placeholder="123 School Lane, Springfield, State 12345"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Card Requirements */}
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">
                Card Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-quantity">
                  Card Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="card-quantity"
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={cardQuantity}
                  onChange={(e) => setCardQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-layout">
                  Card Layout <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={cardLayoutChoice}
                  onValueChange={setCardLayoutChoice}
                >
                  <SelectTrigger id="card-layout">
                    <SelectValue placeholder="Select a card layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {cardTypes.length === 0 ? (
                      <SelectItem value="_loading" disabled>
                        Loading layouts…
                      </SelectItem>
                    ) : (
                      cardTypes.map((ct) => (
                        <SelectItem key={ct.id.toString()} value={ct.name}>
                          {ct.name} — {ct.turnaroundDays.toString()} days
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color-pref">Color Preferences</Label>
                <Input
                  id="color-pref"
                  placeholder="e.g. School colors: navy blue and gold"
                  value={colorPreferences}
                  onChange={(e) => setColorPreferences(e.target.value)}
                />
              </div>

              {/* School Logo */}
              <div className="space-y-2">
                <Label>School Logo</Label>
                {logoPreview ? (
                  <div className="relative inline-flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/60">
                    <img
                      src={logoPreview}
                      alt="School logo preview"
                      className="h-14 w-14 object-contain rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {logoFile?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {logoFile ? (logoFile.size / 1024).toFixed(1) : 0} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Upload Logo</span>
                    <span className="text-xs mt-0.5">PNG, JPG, SVG</span>
                  </button>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="px-8"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Submitting…" : "Submit Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
