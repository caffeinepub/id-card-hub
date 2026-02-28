# ID Card Hub

## Current State
The app has a Client Portal where schools/colleges can add student/staff records to an order via `AddStudentsPage`. Records are listed in a `RecordsList` component with only a delete button per row. There is no way to view full details of a record or edit a record after it has been added. The backend has `addStudentRecord`, `bulkAddStudentRecords`, `getStudentRecordsByOrder`, and `deleteStudentRecord` but no `updateStudentRecord`.

## Requested Changes (Diff)

### Add
- `updateStudentRecord(id: Nat, record: StudentRecord): async ()` to backend -- updates all fields of a student record (same authorization: owner or admin)
- View button on each record row in `RecordsList` -- opens a read-only detail dialog showing all fields (name, father's name, DOB, blood group, address, parents contact, class/grade, role, department, photo)
- Edit button on each record row in `RecordsList` -- opens a pre-filled edit form (all the same fields as the individual add form including photo upload/camera) and saves via `updateStudentRecord`
- `useUpdateStudentRecord` query hook to call the new backend function

### Modify
- `RecordsList` component: add View (eye icon) and Edit (pencil icon) action buttons alongside the existing Delete button
- `RecordsList` component: integrate View dialog and Edit dialog/sheet

### Remove
- Nothing removed

## Implementation Plan
1. Add `updateStudentRecord` to `main.mo`
2. Regenerate backend to update bindings
3. In `AddStudentsPage.tsx`, add:
   - `useUpdateStudentRecord` hook usage
   - `ViewRecordDialog` component showing all fields
   - `EditRecordDialog` component with pre-filled form (reusing same fields as IndividualAddForm, with photo handling)
   - View (Eye) and Edit (Pencil) icon buttons in each record row
