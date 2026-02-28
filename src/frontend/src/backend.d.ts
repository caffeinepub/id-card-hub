import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ClientOrder {
    id: bigint;
    status: OrderStatus;
    deliveryAddress: string;
    cardLayoutChoice: string;
    institutionName: string;
    institutionType: string;
    city: string;
    createdAt: bigint;
    contactPerson: string;
    designImageKey?: string;
    canEdit: boolean;
    schoolLogoKey?: string;
    website: string;
    clientPrincipal: Principal;
    updatedAt: bigint;
    state: string;
    colorPreferences: string;
    contactEmail: string;
    pinCode: string;
    cardQuantity: bigint;
    contactPhone: string;
}
export interface CardType {
    id: bigint;
    turnaroundDays: bigint;
    name: string;
    pricePerCard: number;
    description: string;
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
export interface Customer {
    id: bigint;
    name: string;
    createdAt: bigint;
    email: string;
    address: string;
    phone: string;
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
export interface StudentRecord {
    id: bigint;
    parentsContactNumber: string;
    dateOfBirth: string;
    role: PersonRole;
    photoKey?: string;
    personName: string;
    fathersName: string;
    orderId: bigint;
    bloodGroup: string;
    address: string;
    department: string;
    classGrade: string;
    uploadedAt: bigint;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    submitted = "submitted",
    printing = "printing",
    designing = "designing",
    dispatched = "dispatched",
    inReview = "inReview",
    delivered = "delivered"
}
export enum PersonRole {
    staff = "staff",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStudentRecord(record: StudentRecord): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkAddStudentRecords(orderId: bigint, records: Array<StudentRecord>): Promise<bigint>;
    createCardType(cardType: CardType): Promise<bigint>;
    createClientOrder(clientOrder: ClientOrder): Promise<bigint>;
    createCustomer(customer: Customer): Promise<bigint>;
    createOrder(order: Order): Promise<bigint>;
    deleteCardType(id: bigint): Promise<void>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteFile(id: string): Promise<void>;
    deleteOrder(id: bigint): Promise<void>;
    deleteStudentRecord(id: bigint): Promise<void>;
    getAllCardTypes(): Promise<Array<CardType>>;
    getAllClientOrders(): Promise<Array<ClientOrder>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllFiles(): Promise<Array<[string, ExternalBlob]>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCardType(id: bigint): Promise<CardType | null>;
    getClientOrder(id: bigint): Promise<ClientOrder | null>;
    getCustomer(id: bigint): Promise<Customer | null>;
    getDashboardStats(): Promise<DashboardStats>;
    getMyClientOrders(): Promise<Array<ClientOrder>>;
    getOrder(id: bigint): Promise<Order | null>;
    getOrdersByCustomerId(customerId: bigint): Promise<Array<Order>>;
    getOrdersByStatus(status: string): Promise<Array<Order>>;
    getStudentRecordsByOrder(orderId: bigint): Promise<Array<StudentRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeClientOrderDesign(orderId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setClientOrderEditPermission(id: bigint, canEdit: boolean): Promise<void>;
    updateCardType(id: bigint, cardType: CardType): Promise<void>;
    updateClientOrder(id: bigint, updatedOrder: ClientOrder): Promise<void>;
    updateClientOrderStatus(id: bigint, status: OrderStatus): Promise<void>;
    updateCustomer(id: bigint, customer: Customer): Promise<void>;
    updateOrder(id: bigint, order: Order): Promise<void>;
    updateStudentRecord(id: bigint, record: StudentRecord): Promise<void>;
    uploadClientOrderDesign(orderId: bigint, designImageKey: string): Promise<void>;
    uploadFile(id: string, externalBlob: ExternalBlob): Promise<void>;
}
