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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera,
  CameraIcon,
  CheckCircle,
  Download,
  Eye,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, PersonRole } from "../../backend";
import type { ClientOrder, StudentRecord } from "../../backend.d.ts";
import { useCamera } from "../../camera/useCamera";
import { PhotoCropper } from "../../components/PhotoCropper";
import {
  useDeleteStudentRecord,
  useMyClientOrders,
  useStudentRecordsByOrder,
  useUpdateStudentRecord,
  useUploadFile,
} from "../../hooks/useQueries";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const CLASS_GRADE_OPTIONS = {
  "Pre-KG": ["Nursery", "LKG", "UKG"],
  "Grade (Primary)": [
    "Grade I",
    "Grade II",
    "Grade III",
    "Grade IV",
    "Grade V",
  ],
  "Class (Primary/Secondary)": [
    "Class I",
    "Class II",
    "Class III",
    "Class IV",
    "Class V",
    "Class VI",
    "Class VII",
    "Class VIII",
    "Class IX",
    "Class X",
  ],
  "Higher Secondary": ["Class XI", "Class XII"],
  College: ["UG", "PG", "Other"],
};

// ─── View Record Dialog ────────────────────────────────────────────────────────
function ViewRecordDialog({
  record,
  open,
  onClose,
}: {
  record: StudentRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!record) return null;

  const photoUrl = record.photoKey
    ? ExternalBlob.fromURL(record.photoKey).getDirectURL()
    : null;

  const initials = record.personName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fields: { label: string; value: string | undefined }[] = [
    { label: "Full Name", value: record.personName },
    { label: "Father's Name", value: record.fathersName || "—" },
    {
      label: "Role",
      value: record.role === PersonRole.staff ? "Staff" : "Student",
    },
    { label: "Class / Grade", value: record.classGrade || "—" },
    { label: "Department / Section", value: record.department || "—" },
    { label: "Date of Birth", value: record.dateOfBirth || "—" },
    { label: "Blood Group", value: record.bloodGroup || "—" },
    { label: "Address", value: record.address || "—" },
    {
      label: "Parents Contact Number",
      value: record.parentsContactNumber || "—",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Record Details
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-5 pr-1">
            {/* Photo & name hero */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/60">
              {photoUrl ? (
                <div className="relative">
                  <img
                    src={photoUrl}
                    alt={record.personName}
                    className="h-20 w-[60px] object-cover rounded-lg border border-border/60 shadow-sm"
                  />
                  <a
                    href={photoUrl}
                    download={`${record.personName}-photo.jpg`}
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
                    title="Download photo"
                  >
                    <Download className="h-2.5 w-2.5 text-muted-foreground" />
                  </a>
                </div>
              ) : (
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-semibold text-base text-foreground leading-tight">
                  {record.personName}
                </p>
                {record.fathersName && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    S/O {record.fathersName}
                  </p>
                )}
                <Badge
                  variant="secondary"
                  className={`mt-2 text-xs ${
                    record.role === PersonRole.staff
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {record.role === PersonRole.staff ? "Staff" : "Student"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Fields grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {fields.slice(2).map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-sm text-foreground font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Record Dialog ────────────────────────────────────────────────────────
function EditRecordDialog({
  record,
  orderId,
  open,
  onClose,
}: {
  record: StudentRecord | null;
  orderId: bigint;
  open: boolean;
  onClose: () => void;
}) {
  const updateRecord = useUpdateStudentRecord();
  const uploadFile = useUploadFile();
  const editCamera = useCamera({ facingMode: "user", quality: 0.85 });

  const [personName, setPersonName] = useState(record?.personName ?? "");
  const [fathersName, setFathersName] = useState(record?.fathersName ?? "");
  const [role, setRole] = useState<PersonRole>(
    record?.role ?? PersonRole.student,
  );
  const [department, setDepartment] = useState(record?.department ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(record?.dateOfBirth ?? "");
  const [bloodGroup, setBloodGroup] = useState(record?.bloodGroup ?? "");
  const [address, setAddress] = useState(record?.address ?? "");
  const [parentsContactNumber, setParentsContactNumber] = useState(
    record?.parentsContactNumber ?? "",
  );
  const [classGrade, setClassGrade] = useState(record?.classGrade ?? "");

  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!record) return null;

  const existingPhotoUrl = record.photoKey
    ? ExternalBlob.fromURL(record.photoKey).getDirectURL()
    : null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => setCropperSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleOpenCamera = async () => {
    setShowCamera(true);
    await editCamera.startCamera();
  };

  const handleCapturePhoto = async () => {
    const captured = await editCamera.capturePhoto();
    if (!captured) {
      toast.error("Failed to capture photo");
      return;
    }
    await editCamera.stopCamera();
    setShowCamera(false);
    const reader = new FileReader();
    reader.onload = (ev) => setCropperSrc(ev.target?.result as string);
    reader.readAsDataURL(captured);
  };

  const handleCloseCamera = async () => {
    await editCamera.stopCamera();
    setShowCamera(false);
  };

  const handleCropDone = (file: File) => {
    setNewPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setNewPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setCropperSrc(null);
  };

  const handleCropCancel = () => {
    setCropperSrc(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    let photoKey = record.photoKey;

    if (newPhotoFile) {
      try {
        const bytes = new Uint8Array(await newPhotoFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        photoKey = `photo-${orderId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await uploadFile.mutateAsync({ id: photoKey, blob });
      } catch {
        toast.error("Photo upload failed, keeping existing photo");
        photoKey = record.photoKey;
      }
    }

    await updateRecord.mutateAsync({
      id: record.id,
      orderId,
      record: {
        ...record,
        personName: personName.trim(),
        fathersName: fathersName.trim(),
        role,
        department: department.trim(),
        dateOfBirth: dateOfBirth.trim(),
        bloodGroup: bloodGroup.trim(),
        address: address.trim(),
        parentsContactNumber: parentsContactNumber.trim(),
        classGrade: classGrade.trim(),
        photoKey,
      },
    });

    onClose();
  };

  const isLoading = updateRecord.isPending || uploadFile.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Edit Record
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh]">
          <form onSubmit={handleSubmit} className="space-y-4 pr-1">
            {/* Name row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vr-edit-person-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vr-edit-person-name"
                  placeholder="e.g. John Smith"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vr-edit-fathers-name">Father's Name</Label>
                <Input
                  id="vr-edit-fathers-name"
                  placeholder="e.g. Robert Smith"
                  value={fathersName}
                  onChange={(e) => setFathersName(e.target.value)}
                />
              </div>
            </div>

            {/* Role & Class */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as PersonRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PersonRole.student}>Student</SelectItem>
                    <SelectItem value={PersonRole.staff}>Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class / Grade</Label>
                <Select value={classGrade} onValueChange={setClassGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class / grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLASS_GRADE_OPTIONS).map(
                      ([groupLabel, options]) => (
                        <SelectGroup key={groupLabel}>
                          <SelectLabel>{groupLabel}</SelectLabel>
                          {options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="vr-edit-department">Department / Section</Label>
              <Input
                id="vr-edit-department"
                placeholder="e.g. Science, Commerce"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            {/* DOB & Blood Group */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vr-edit-dob">Date of Birth</Label>
                <Input
                  id="vr-edit-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="vr-edit-address">Address</Label>
              <Input
                id="vr-edit-address"
                placeholder="e.g. 123 Main Street, Chennai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Parents Contact */}
            <div className="space-y-2">
              <Label htmlFor="vr-edit-parents-contact">
                Parents Contact Number
              </Label>
              <Input
                id="vr-edit-parents-contact"
                type="tel"
                placeholder="e.g. 9876543210"
                value={parentsContactNumber}
                onChange={(e) => setParentsContactNumber(e.target.value)}
              />
            </div>

            {/* Photo */}
            <div className="space-y-2">
              <Label>Photo</Label>

              {cropperSrc && (
                <PhotoCropper
                  imageSrc={cropperSrc}
                  onCrop={handleCropDone}
                  onCancel={handleCropCancel}
                />
              )}

              {!cropperSrc && showCamera && (
                <div
                  className="relative bg-black rounded-xl overflow-hidden"
                  style={{ minHeight: 240 }}
                >
                  <video
                    ref={editCamera.videoRef}
                    style={{
                      width: "100%",
                      height: "auto",
                      minHeight: 240,
                      display: "block",
                    }}
                    playsInline
                    muted
                  />
                  <canvas
                    ref={editCamera.canvasRef}
                    style={{ display: "none" }}
                  />
                  {editCamera.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm p-4 text-center">
                      {editCamera.error.message}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleCloseCamera}
                      className="h-8"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 bg-white text-black hover:bg-white/90"
                      onClick={handleCapturePhoto}
                      disabled={!editCamera.isActive || editCamera.isLoading}
                    >
                      <CameraIcon className="h-4 w-4 mr-1" />
                      Capture
                    </Button>
                  </div>
                </div>
              )}

              {!cropperSrc && !showCamera && (
                <>
                  {newPhotoPreview ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/60">
                      <img
                        src={newPhotoPreview}
                        alt="New preview"
                        className="h-14 w-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          New photo selected
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ready to upload
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => {
                          setNewPhotoFile(null);
                          setNewPhotoPreview(null);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : existingPhotoUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/60">
                      <img
                        src={existingPhotoUrl}
                        alt="Current"
                        className="h-14 w-[42px] object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Current photo</p>
                        <p className="text-xs text-muted-foreground">
                          Replace with a new one below
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 flex-1"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {existingPhotoUrl ? "Replace Photo" : "Browse Photo"}
                    </Button>
                    {editCamera.isSupported !== false && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 flex-1"
                        onClick={handleOpenCamera}
                      >
                        <Camera className="h-4 w-4" />
                        Take Photo
                      </Button>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 pb-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={!personName.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {isLoading ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inner component: fetches & renders records for one order ─────────────────
function OrderRecordsSection({
  order,
}: {
  order: ClientOrder;
}) {
  const { data: records = [], isLoading } = useStudentRecordsByOrder(order.id);
  const deleteRecord = useDeleteStudentRecord();
  const [viewRecord, setViewRecord] = useState<StudentRecord | null>(null);
  const [editRecord, setEditRecord] = useState<StudentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    await deleteRecord.mutateAsync({ id: deleteTarget, orderId: order.id });
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base">
              {order.institutionName}
            </CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
              {order.institutionType || "Institution"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Users className="h-7 w-7 mb-2 opacity-30" />
            <p className="text-sm">No records uploaded for this order yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="font-display text-base">
              {order.institutionName}
            </CardTitle>
            <div className="flex items-center gap-2">
              {order.institutionType && (
                <Badge variant="outline" className="text-xs font-normal">
                  {order.institutionType}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="text-xs font-semibold bg-primary/10 text-primary"
              >
                {records.length} record{records.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border/50">
            {records.map((record) => (
              <RecordRow
                key={record.id.toString()}
                record={record}
                onView={() => setViewRecord(record)}
                onEdit={() => setEditRecord(record)}
                onDelete={() => setDeleteTarget(record.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <ViewRecordDialog
        record={viewRecord}
        open={viewRecord !== null}
        onClose={() => setViewRecord(null)}
      />

      {/* Edit Dialog */}
      {editRecord && (
        <EditRecordDialog
          key={editRecord.id.toString()}
          record={editRecord}
          orderId={order.id}
          open={editRecord !== null}
          onClose={() => setEditRecord(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this person's record and photo. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {deleteRecord.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Single record row ────────────────────────────────────────────────────────
function RecordRow({
  record,
  onView,
  onEdit,
  onDelete,
}: {
  record: StudentRecord;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photoUrl = record.photoKey
    ? ExternalBlob.fromURL(record.photoKey).getDirectURL()
    : null;

  const initials = record.personName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isStaff = record.role === PersonRole.staff;

  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      {/* Photo avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        {photoUrl && <AvatarImage src={photoUrl} alt={record.personName} />}
        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name & details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">
          {record.personName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {record.fathersName ? `S/O ${record.fathersName}` : ""}
          {record.fathersName && (record.classGrade || record.department)
            ? " • "
            : ""}
          {record.classGrade || record.department || ""}
          {record.bloodGroup ? ` • ${record.bloodGroup}` : ""}
        </p>
      </div>

      {/* Role badge */}
      <Badge
        variant="secondary"
        className={`text-xs shrink-0 ${
          isStaff
            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        }`}
      >
        {isStaff ? "Staff" : "Student"}
      </Badge>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          title="View record"
          onClick={onView}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title="Edit record"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          title="Delete record"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main ViewRecordsPage ─────────────────────────────────────────────────────
export function ViewRecordsPage() {
  const { data: orders = [], isLoading: ordersLoading } = useMyClientOrders();

  if (ordersLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
        {/* Card skeletons */}
        {[1, 2].map((k) => (
          <Card key={k} className="border-border/60">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48 rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            All Student &amp; Staff Records
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Records uploaded across all your orders
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 opacity-40" />
          </div>
          <p className="font-medium text-foreground">No orders yet</p>
          <p className="text-sm mt-1">
            Submit an order and upload student/staff records to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          All Student &amp; Staff Records
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Records uploaded across{" "}
          <span className="font-medium text-foreground">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        </p>
      </div>

      {/* One card per order */}
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderRecordsSection key={order.id.toString()} order={order} />
        ))}
      </div>
    </div>
  );
}
