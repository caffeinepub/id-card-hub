# ID Card Manufacturing Business App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Order Management**: Create and track ID card orders with customer details, card type, quantity, status (pending, in-production, ready, delivered)
- **Customer Management**: Store customer name, contact info, and order history
- **Card Templates/Types**: Manage different ID card types (employee ID, student ID, access card, etc.) with pricing
- **Dashboard**: Overview of active orders, revenue summary, orders by status
- **Order Detail View**: View/edit individual order details, update status, add notes
- **Sample Content**: Pre-populated card types and sample orders for demo purposes

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan
1. Backend:
   - `CardType` record: id, name, description, price, turnaround days
   - `Customer` record: id, name, email, phone, address, createdAt
   - `Order` record: id, customerId, cardTypeId, quantity, status, totalPrice, notes, createdAt, updatedAt
   - CRUD for CardTypes, Customers, Orders
   - Query: get orders by status, get orders by customer, dashboard stats (counts by status, total revenue)
   - Seed data: 3-4 card types, 5 customers, 8-10 sample orders

2. Frontend:
   - Navigation: Dashboard, Orders, Customers, Card Types
   - Dashboard page: stats cards (total orders, pending, in-production, ready), recent orders list
   - Orders page: list all orders with filters by status, button to create new order
   - New/Edit Order form: select customer, card type, quantity, notes
   - Order detail: view full order, status update dropdown, notes
   - Customers page: list customers, add/edit customer form
   - Card Types page: list and manage card type catalog
