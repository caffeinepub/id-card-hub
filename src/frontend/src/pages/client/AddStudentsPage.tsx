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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Camera,
  CameraIcon,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, PersonRole } from "../../backend";
import type { StudentRecord } from "../../backend.d.ts";
import { useCamera } from "../../camera/useCamera";
import { PhotoCropper } from "../../components/PhotoCropper";
import {
  useAddStudentRecord,
  useBulkAddStudentRecords,
  useDeleteStudentRecord,
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

interface AddStudentsPageProps {
  orderId: bigint;
  onBack: () => void;
  onDone: () => void;
}

// ─── Individual Add Form ───────────────────────────────────────────────────────
function IndividualAddForm({
  orderId,
  onAdded,
}: {
  orderId: bigint;
  onAdded: () => void;
}) {
  const addRecord = useAddStudentRecord();
  const uploadFile = useUploadFile();

  const [personName, setPersonName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [role, setRole] = useState<PersonRole>(PersonRole.student);
  const [department, setDepartment] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [parentsContactNumber, setParentsContactNumber] = useState("");
  const [classGrade, setClassGrade] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const camera = useCamera({ facingMode: "user", quality: 0.85 });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input value so same file can be re-selected
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => setCropperSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleOpenCamera = async () => {
    setShowCamera(true);
    await camera.startCamera();
  };

  const handleCapturePhoto = async () => {
    const captured = await camera.capturePhoto();
    if (!captured) {
      toast.error("Failed to capture photo");
      return;
    }
    await camera.stopCamera();
    setShowCamera(false);
    // Load captured photo into cropper
    const reader = new FileReader();
    reader.onload = (ev) => setCropperSrc(ev.target?.result as string);
    reader.readAsDataURL(captured);
  };

  const handleCloseCamera = async () => {
    await camera.stopCamera();
    setShowCamera(false);
  };

  const handleCropDone = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setCropperSrc(null);
  };

  const handleCropCancel = () => {
    setCropperSrc(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    let photoKey: string | undefined;
    if (photoFile) {
      try {
        const bytes = new Uint8Array(await photoFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        photoKey = `photo-${orderId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await uploadFile.mutateAsync({ id: photoKey, blob });
      } catch {
        toast.error("Photo upload failed, saving record without photo");
      }
    }

    const now = BigInt(Date.now()) * BigInt(1_000_000);
    await addRecord.mutateAsync({
      id: BigInt(0),
      orderId,
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
      uploadedAt: now,
    });

    // Reset form
    setPersonName("");
    setFathersName("");
    setDepartment("");
    setDateOfBirth("");
    setBloodGroup("");
    setAddress("");
    setParentsContactNumber("");
    setClassGrade("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setCropperSrc(null);
    onAdded();
  };

  const isLoading = addRecord.isPending || uploadFile.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="person-name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="person-name"
            placeholder="e.g. John Smith"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fathers-name">Father's Name</Label>
          <Input
            id="fathers-name"
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
          <Select value={role} onValueChange={(v) => setRole(v as PersonRole)}>
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
        <Label htmlFor="department">Department / Section</Label>
        <Input
          id="department"
          placeholder="e.g. Science, Commerce"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
      </div>

      {/* DOB & Blood Group */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
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
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="e.g. 123 Main Street, Chennai"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* Parents Contact */}
      <div className="space-y-2">
        <Label htmlFor="parents-contact">Parents Contact Number</Label>
        <Input
          id="parents-contact"
          type="tel"
          placeholder="e.g. 9876543210"
          value={parentsContactNumber}
          onChange={(e) => setParentsContactNumber(e.target.value)}
        />
      </div>

      {/* Photo input */}
      <div className="space-y-2">
        <Label>Photo</Label>

        {/* Photo cropper */}
        {cropperSrc && (
          <PhotoCropper
            imageSrc={cropperSrc}
            onCrop={handleCropDone}
            onCancel={handleCropCancel}
          />
        )}

        {/* Camera view */}
        {!cropperSrc && showCamera && (
          <div
            className="relative bg-black rounded-xl overflow-hidden"
            style={{ minHeight: 240 }}
          >
            <video
              ref={camera.videoRef}
              style={{
                width: "100%",
                height: "auto",
                minHeight: 240,
                display: "block",
              }}
              playsInline
              muted
            />
            <canvas ref={camera.canvasRef} style={{ display: "none" }} />
            {camera.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm p-4 text-center">
                {camera.error.message}
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
                disabled={!camera.isActive || camera.isLoading}
              >
                <CameraIcon className="h-4 w-4 mr-1" />
                Capture
              </Button>
            </div>
          </div>
        )}

        {!cropperSrc && !showCamera && (
          <>
            {photoPreview ? (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/60">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-14 w-14 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {photoFile?.name ?? "Cropped photo"}
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
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Browse Photo
                </Button>
                {camera.isSupported !== false && (
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
            )}
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

      <Button
        type="submit"
        className="w-full gap-2"
        disabled={!personName.trim() || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {isLoading ? "Saving…" : "Add Person"}
      </Button>
    </form>
  );
}

// ─── Bulk Upload Form ─────────────────────────────────────────────────────────
interface ParsedRecord {
  personName: string;
  role: PersonRole;
  department: string;
  fathersName: string;
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  parentsContactNumber: string;
  classGrade: string;
  photoFile?: File;
}

/** Center-crop an image File to 3:4 ratio and return a new File */
async function autoCropToPortrait(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: iw, naturalHeight: ih } = img;
      // target aspect = 3/4
      let srcX = 0;
      let srcY = 0;
      let srcW = iw;
      let srcH = ih;
      const targetAspect = 3 / 4;
      if (iw / ih > targetAspect) {
        // image is wider than target — crop width
        srcW = Math.round(ih * targetAspect);
        srcX = Math.round((iw - srcW) / 2);
      } else {
        // image is taller than target — crop height
        srcH = Math.round(iw / targetAspect);
        srcY = Math.round((ih - srcH) / 2);
      }
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 300, 400);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            }),
          );
        },
        "image/jpeg",
        0.9,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

function BulkUploadForm({
  orderId,
  onDone,
}: { orderId: bigint; onDone: () => void }) {
  const bulkAdd = useBulkAddStudentRecords();
  const uploadFile = useUploadFile();

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const csvInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const handleCsvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setParseError(null);

    try {
      const text = await file.text();
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setParseError("CSV must have a header row and at least one data row.");
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);
      const records: ParsedRecord[] = [];
      for (const line of dataLines) {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 1) continue;
        const [
          name = "",
          roleStr = "student",
          dept = "",
          fathersNameCol = "",
          dateOfBirthCol = "",
          bloodGroupCol = "",
          addressCol = "",
          parentsContactCol = "",
          classGradeCol = "",
        ] = cols;
        if (!name) continue;
        const roleNorm = roleStr.toLowerCase().trim();
        const role =
          roleNorm === "staff" ? PersonRole.staff : PersonRole.student;
        records.push({
          personName: name,
          role,
          department: dept,
          fathersName: fathersNameCol,
          dateOfBirth: dateOfBirthCol,
          bloodGroup: bloodGroupCol,
          address: addressCol,
          parentsContactNumber: parentsContactCol,
          classGrade: classGradeCol,
        });
      }

      if (records.length === 0) {
        setParseError("No valid records found in CSV.");
        return;
      }

      setParsedRecords(records);
    } catch {
      setParseError("Failed to parse CSV file.");
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotoFiles(files);
  };

  const handleUploadAll = async () => {
    if (parsedRecords.length === 0) return;
    const now = BigInt(Date.now()) * BigInt(1_000_000);

    // Match photos to records by index or filename
    const photoMap: Record<number, File> = {};
    for (const file of photoFiles) {
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, "").toLowerCase();
      const idxByName = parsedRecords.findIndex(
        (r) => r.personName.toLowerCase() === nameWithoutExt,
      );
      if (idxByName >= 0) {
        photoMap[idxByName] = file;
      }
    }
    // Fallback: match by index if not matched by name
    for (let i = 0; i < photoFiles.length; i++) {
      if (!(i in photoMap) && i < parsedRecords.length) {
        photoMap[i] = photoFiles[i];
      }
    }

    // Upload photos (auto-cropped) and build records
    const backendRecords = await Promise.all(
      parsedRecords.map(async (r, i) => {
        let photoKey: string | undefined;
        let photoFile = photoMap[i];
        if (photoFile) {
          try {
            // Auto-crop to 3:4 portrait before uploading
            photoFile = await autoCropToPortrait(photoFile);
            const bytes = new Uint8Array(await photoFile.arrayBuffer());
            const blob = ExternalBlob.fromBytes(bytes);
            photoKey = `photo-${orderId}-${Date.now()}-${i}`;
            await uploadFile.mutateAsync({ id: photoKey, blob });
          } catch {
            // continue without photo
          }
        }
        return {
          id: BigInt(0),
          orderId,
          personName: r.personName,
          fathersName: r.fathersName,
          role: r.role,
          department: r.department,
          dateOfBirth: r.dateOfBirth,
          bloodGroup: r.bloodGroup,
          address: r.address,
          parentsContactNumber: r.parentsContactNumber,
          classGrade: r.classGrade,
          photoKey,
          uploadedAt: now,
        };
      }),
    );

    await bulkAdd.mutateAsync({ orderId, records: backendRecords });
    onDone();
  };

  const isLoading = bulkAdd.isPending || uploadFile.isPending;

  return (
    <div className="space-y-5">
      {/* CSV Instructions */}
      <div className="bg-muted/40 rounded-lg border border-border/60 p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">CSV Format</p>
        <p className="text-muted-foreground mb-2">
          Upload a CSV file with the following columns (header row required):
        </p>
        <div className="font-mono text-xs bg-background rounded p-2 border border-border/40 overflow-x-auto">
          <span className="text-primary">
            Name, Role, Department, FathersName, DateOfBirth, BloodGroup,
            Address, ParentsContact, ClassGrade
          </span>
          <br />
          John Smith, student, Grade 10, Robert Smith, 2010-05-15, O+, 123 Main
          St, 9876543210, Class X
          <br />
          Dr. Jane Doe, staff, Mathematics, , , , , ,
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Role must be <code className="font-mono">student</code> or{" "}
          <code className="font-mono">staff</code>. Columns after Role are
          optional.
        </p>
      </div>

      {/* CSV Upload */}
      <div className="space-y-2">
        <Label>Student/Staff CSV File</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => csvInputRef.current?.click()}
          >
            <FileText className="h-4 w-4" />
            {csvFile ? csvFile.name : "Choose CSV File"}
          </Button>
          {csvFile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => {
                setCsvFile(null);
                setParsedRecords([]);
                setParseError(null);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleCsvChange}
        />
        {parseError && <p className="text-sm text-destructive">{parseError}</p>}
      </div>

      {/* Photos Upload */}
      <div className="space-y-2">
        <Label>Photos (Optional)</Label>
        <p className="text-xs text-muted-foreground">
          Upload photos named after students (e.g. "John Smith.jpg") or in order
          matching the CSV rows. Photos will be automatically cropped to
          portrait size.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => photosInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {photoFiles.length > 0
            ? `${photoFiles.length} photo(s) selected`
            : "Upload Photos"}
        </Button>
        <input
          ref={photosInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotosChange}
        />
      </div>

      {/* Preview */}
      {parsedRecords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Preview ({parsedRecords.length} records)</Label>
            <Badge variant="secondary" className="text-xs">
              {photoFiles.length} photos
            </Badge>
          </div>
          <div className="max-h-52 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
            {parsedRecords.slice(0, 20).map((r, i) => (
              <div
                key={`${r.personName}-${i}`}
                className="flex items-center gap-3 px-3 py-2 text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.personName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.role === PersonRole.staff ? "Staff" : "Student"}
                    {r.department ? ` • ${r.department}` : ""}
                    {r.classGrade ? ` • ${r.classGrade}` : ""}
                    {r.bloodGroup ? ` • ${r.bloodGroup}` : ""}
                  </p>
                </div>
              </div>
            ))}
            {parsedRecords.length > 20 && (
              <div className="px-3 py-2 text-xs text-center text-muted-foreground">
                +{parsedRecords.length - 20} more records
              </div>
            )}
          </div>

          <Button
            type="button"
            className="w-full gap-2 mt-2"
            onClick={handleUploadAll}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isLoading
              ? "Uploading…"
              : `Upload All ${parsedRecords.length} Records`}
          </Button>
        </div>
      )}
    </div>
  );
}

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
                <Label htmlFor="edit-person-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-person-name"
                  placeholder="e.g. John Smith"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fathers-name">Father's Name</Label>
                <Input
                  id="edit-fathers-name"
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
              <Label htmlFor="edit-department">Department / Section</Label>
              <Input
                id="edit-department"
                placeholder="e.g. Science, Commerce"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            {/* DOB & Blood Group */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dob">Date of Birth</Label>
                <Input
                  id="edit-dob"
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
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                placeholder="e.g. 123 Main Street, Chennai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Parents Contact */}
            <div className="space-y-2">
              <Label htmlFor="edit-parents-contact">
                Parents Contact Number
              </Label>
              <Input
                id="edit-parents-contact"
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

// ─── Records List ─────────────────────────────────────────────────────────────
function RecordsList({ orderId }: { orderId: bigint }) {
  const { data: records = [], isLoading } = useStudentRecordsByOrder(orderId);
  const deleteRecord = useDeleteStudentRecord();
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [viewRecord, setViewRecord] = useState<StudentRecord | null>(null);
  const [editRecord, setEditRecord] = useState<StudentRecord | null>(null);

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    await deleteRecord.mutateAsync({ id: deleteTarget, orderId });
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((k) => (
          <Skeleton key={k} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No records added yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {records.map((record) => (
          <div
            key={record.id.toString()}
            className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/60"
          >
            <Avatar className="h-10 w-10 shrink-0">
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
              <p className="font-medium text-sm truncate">
                {record.personName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {record.role === PersonRole.staff ? "Staff" : "Student"}
                {record.department ? ` • ${record.department}` : ""}
                {record.classGrade ? ` • ${record.classGrade}` : ""}
                {record.bloodGroup ? ` • ${record.bloodGroup}` : ""}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs shrink-0 ${record.role === PersonRole.staff ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
            >
              {record.role === PersonRole.staff ? "Staff" : "Student"}
            </Badge>
            {/* Action buttons */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                title="View record"
                onClick={() => setViewRecord(record)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Edit record"
                onClick={() => setEditRecord(record)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                title="Delete record"
                onClick={() => setDeleteTarget(record.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

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
          orderId={orderId}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AddStudentsPage({
  orderId,
  onBack,
  onDone,
}: AddStudentsPageProps) {
  const { data: records = [] } = useStudentRecordsByOrder(orderId);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 mb-3 -ml-2 text-muted-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Order
          </Button>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Add People
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload student and staff records for this order.{" "}
            <span className="font-medium text-foreground">
              {records.length} added so far.
            </span>
          </p>
        </div>
        <Button onClick={onDone} className="gap-2 shrink-0">
          <CheckCircle className="h-4 w-4" />
          Done
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input section */}
        <div>
          <Tabs defaultValue="individual">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="individual" className="flex-1">
                Add Individually
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex-1">
                Bulk Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual">
              <Card className="border-border/60 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Add Individual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IndividualAddForm
                    key={refreshKey}
                    orderId={orderId}
                    onAdded={() => setRefreshKey((k) => k + 1)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk">
              <Card className="border-border/60 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    Bulk Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BulkUploadForm orderId={orderId} onDone={() => {}} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Records list */}
        <div>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Added Records
                </span>
                <Badge variant="secondary">{records.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecordsList orderId={orderId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
