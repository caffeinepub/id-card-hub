import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Customer {
    id: bigint;
    name: string;
    createdAt: bigint;
    email: string;
    address: string;
    phone: string;
}
export interface CardType {
    id: bigint;
    turnaroundDays: bigint;
    name: string;
    pricePerCard: number;
    description: string;
}
export interface Order {
    id: bigint;
    status: string;
    createdAt: bigint;
    updatedAt: bigint;
    cardTypeId: bigint;
    notes: string;
    quantity: bigint;
    customerId: bigint;
    totalPrice: number;
}
export interface UserProfile {
    name: string;
}
export interface DashboardStats {
    cancelledOrders: bigint;
    totalOrders: bigint;
    pendingOrders: bigint;
    readyOrders: bigint;
    inProductionOrders: bigint;
    totalRevenue: number;
    deliveredOrders: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCardType(cardType: CardType): Promise<bigint>;
    createCustomer(customer: Customer): Promise<bigint>;
    createOrder(order: Order): Promise<bigint>;
    deleteCardType(id: bigint): Promise<void>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteOrder(id: bigint): Promise<void>;
    getAllCardTypes(): Promise<Array<CardType>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCardType(id: bigint): Promise<CardType | null>;
    getCustomer(id: bigint): Promise<Customer | null>;
    getDashboardStats(): Promise<DashboardStats>;
    getOrder(id: bigint): Promise<Order | null>;
    getOrdersByCustomerId(customerId: bigint): Promise<Array<Order>>;
    getOrdersByStatus(status: string): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeSeedData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCardType(id: bigint, cardType: CardType): Promise<void>;
    updateCustomer(id: bigint, customer: Customer): Promise<void>;
    updateOrder(id: bigint, order: Order): Promise<void>;
}
