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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Camera,
  CameraIcon,
  CheckCircle,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, PersonRole } from "../../backend";
import { useCamera } from "../../camera/useCamera";
import {
  useAddStudentRecord,
  useBulkAddStudentRecords,
  useDeleteStudentRecord,
  useStudentRecordsByOrder,
  useUploadFile,
} from "../../hooks/useQueries";

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
  const [role, setRole] = useState<PersonRole>(PersonRole.student);
  const [department, setDepartment] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const camera = useCamera({ facingMode: "user", quality: 0.85 });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
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
    setPhotoFile(captured);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(captured);
    await camera.stopCamera();
    setShowCamera(false);
  };

  const handleCloseCamera = async () => {
    await camera.stopCamera();
    setShowCamera(false);
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
      role,
      department: department.trim(),
      photoKey,
      uploadedAt: now,
    });

    // Reset form
    setPersonName("");
    setDepartment("");
    setPhotoFile(null);
    setPhotoPreview(null);
    onAdded();
  };

  const isLoading = addRecord.isPending || uploadFile.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department / Class</Label>
        <Input
          id="department"
          placeholder="e.g. Grade 10 — Science"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
      </div>

      {/* Photo input */}
      <div className="space-y-2">
        <Label>Photo</Label>

        {/* Camera view */}
        {showCamera && (
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

        {!showCamera && (
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
                    {photoFile?.name ?? "Captured photo"}
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
  photoFile?: File;
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
        const [name, roleStr = "student", dept = ""] = cols;
        if (!name) continue;
        const roleNorm = roleStr.toLowerCase().trim();
        const role =
          roleNorm === "staff" ? PersonRole.staff : PersonRole.student;
        records.push({ personName: name, role, department: dept });
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

    // Upload photos and build records
    const backendRecords = await Promise.all(
      parsedRecords.map(async (r, i) => {
        let photoKey: string | undefined;
        const photoFile = photoMap[i];
        if (photoFile) {
          try {
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
          role: r.role,
          department: r.department,
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
        <div className="font-mono text-xs bg-background rounded p-2 border border-border/40">
          <span className="text-primary">Name</span>,{" "}
          <span className="text-primary">Role</span>,{" "}
          <span className="text-primary">Department</span>
          <br />
          John Smith, student, Grade 10 — Science
          <br />
          Dr. Jane Doe, staff, Mathematics
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Role must be <code className="font-mono">student</code> or{" "}
          <code className="font-mono">staff</code>
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
          matching the CSV rows.
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
                    {r.role === PersonRole.staff ? "Staff" : "Student"}{" "}
                    {r.department ? `• ${r.department}` : ""}
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

// ─── Records List ─────────────────────────────────────────────────────────────
function RecordsList({ orderId }: { orderId: bigint }) {
  const { data: records = [], isLoading } = useStudentRecordsByOrder(orderId);
  const deleteRecord = useDeleteStudentRecord();
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

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
              </p>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs shrink-0 ${record.role === PersonRole.staff ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
            >
              {record.role === PersonRole.staff ? "Staff" : "Student"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => setDeleteTarget(record.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

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
