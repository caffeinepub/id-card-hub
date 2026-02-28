# ID Card Hub

## Current State

The app has a client portal for schools/colleges to submit orders and an admin dashboard to manage them. The admin can upload a final ID card design image per order, and the client can view and download it. There is no messaging that clarifies the uploaded design applies to all students/staff in that order.

## Requested Changes (Diff)

### Add
- On the admin side (AdminClientOrdersPage): A note below the "ID Card Design" section header stating how many people are in the order and that the design applies to all of them (e.g. "This design will be applied to all 45 students and staff in this order").
- On the client side (OrderDetailPage): A note inside the "Your ID Card Design" card stating the design applies to all people in the order, showing the total count (e.g. "This design will be used for all 45 people in your order").
- When no design has been uploaded yet, update the pending message on the client side to also mention it will apply to all their students and staff.

### Modify
- AdminClientOrdersPage: Update the ID Card Design section to display the "applies to all X people" note, using the already-fetched `records` array to get the count.
- OrderDetailPage: Update the Design Preview card to show the "applies to all X people" note, using the already-fetched `records` array.

### Remove
- Nothing removed.

## Implementation Plan

1. In `AdminClientOrdersPage.tsx` (`OrderDetailPanel`): Below the "ID Card Design" section title, add a small info note: "This design applies to all {records.length} people in this order" -- visible both when a design is uploaded and when the upload prompt is shown.
2. In `OrderDetailPage.tsx`: In the design card (both the "design uploaded" state and the "Design Pending" empty state), add a note showing the total people count: "This design will be used for all {records.length} students and staff in your order."
