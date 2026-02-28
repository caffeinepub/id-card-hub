import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CardType,
  ClientOrder,
  Customer,
  DashboardStats,
  Order,
  OrderStatus,
  StudentRecord,
  UserProfile,
} from "../backend.d.ts";
import { useActor } from "./useActor";

// ─── Dashboard ───────────────────────────────────────────────────────────────
export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrdersByStatus(status: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "status", status],
    queryFn: async () => {
      if (!actor) return [];
      if (status === "all") return actor.getAllOrders();
      return actor.getOrdersByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: Order) => {
      if (!actor) throw new Error("No actor");
      return actor.createOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Order created successfully");
    },
    onError: () => {
      toast.error("Failed to create order");
    },
  });
}

export function useUpdateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, order }: { id: bigint; order: Order }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateOrder(id, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Order updated successfully");
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
}

export function useDeleteOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteOrder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Order deleted");
    },
    onError: () => {
      toast.error("Failed to delete order");
    },
  });
}

// ─── Customers ────────────────────────────────────────────────────────────────
export function useAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: Customer) => {
      if (!actor) throw new Error("No actor");
      return actor.createCustomer(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added successfully");
    },
    onError: () => {
      toast.error("Failed to add customer");
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      customer,
    }: {
      id: bigint;
      customer: Customer;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCustomer(id, customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Customer updated successfully");
    },
    onError: () => {
      toast.error("Failed to update customer");
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
    },
    onError: () => {
      toast.error("Failed to delete customer");
    },
  });
}

// ─── Card Types ───────────────────────────────────────────────────────────────
export function useAllCardTypes() {
  const { actor, isFetching } = useActor();
  return useQuery<CardType[]>({
    queryKey: ["cardTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCardTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCardType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cardType: CardType) => {
      if (!actor) throw new Error("No actor");
      return actor.createCardType(cardType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardTypes"] });
      toast.success("Card type created successfully");
    },
    onError: () => {
      toast.error("Failed to create card type");
    },
  });
}

export function useUpdateCardType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      cardType,
    }: {
      id: bigint;
      cardType: CardType;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCardType(id, cardType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardTypes"] });
      toast.success("Card type updated successfully");
    },
    onError: () => {
      toast.error("Failed to update card type");
    },
  });
}

export function useDeleteCardType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCardType(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardTypes"] });
      toast.success("Card type deleted");
    },
    onError: () => {
      toast.error("Failed to delete card type");
    },
  });
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
export function useInitializeSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).initializeSeedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

// ─── Auth / User Profile ──────────────────────────────────────────────────────
export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest";
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success("Profile saved");
    },
    onError: () => {
      toast.error("Failed to save profile");
    },
  });
}

// ─── Client Orders ────────────────────────────────────────────────────────────
export function useMyClientOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<ClientOrder[]>({
    queryKey: ["myClientOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyClientOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllClientOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<ClientOrder[]>({
    queryKey: ["allClientOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClientOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClientOrder(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ClientOrder | null>({
    queryKey: ["clientOrder", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getClientOrder(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateClientOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: ClientOrder) => {
      if (!actor) throw new Error("No actor");
      return actor.createClientOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myClientOrders"] });
      queryClient.invalidateQueries({ queryKey: ["allClientOrders"] });
      toast.success("Order submitted successfully");
    },
    onError: () => {
      toast.error("Failed to submit order");
    },
  });
}

export function useUpdateClientOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, order }: { id: bigint; order: ClientOrder }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateClientOrder(id, order);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["myClientOrders"] });
      queryClient.invalidateQueries({ queryKey: ["allClientOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["clientOrder", vars.id.toString()],
      });
      toast.success("Order updated successfully");
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
}

export function useUpdateClientOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateClientOrderStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allClientOrders"] });
      queryClient.invalidateQueries({ queryKey: ["clientOrder"] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });
}

export function useSetClientOrderEditPermission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, canEdit }: { id: bigint; canEdit: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.setClientOrderEditPermission(id, canEdit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allClientOrders"] });
      queryClient.invalidateQueries({ queryKey: ["clientOrder"] });
      toast.success("Edit permission updated");
    },
    onError: () => {
      toast.error("Failed to update permission");
    },
  });
}

// ─── Student Records ──────────────────────────────────────────────────────────
export function useStudentRecordsByOrder(orderId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<StudentRecord[]>({
    queryKey: ["studentRecords", orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) return [];
      return actor.getStudentRecordsByOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
  });
}

export function useAddStudentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: StudentRecord) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudentRecord(record);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["studentRecords", vars.orderId.toString()],
      });
    },
    onError: () => {
      toast.error("Failed to add person record");
    },
  });
}

export function useBulkAddStudentRecords() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      records,
    }: { orderId: bigint; records: StudentRecord[] }) => {
      if (!actor) throw new Error("No actor");
      return actor.bulkAddStudentRecords(orderId, records);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["studentRecords", vars.orderId.toString()],
      });
      toast.success("Records uploaded successfully");
    },
    onError: () => {
      toast.error("Failed to upload records");
    },
  });
}

export function useDeleteStudentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      orderId: _orderId,
    }: { id: bigint; orderId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudentRecord(id);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["studentRecords", vars.orderId.toString()],
      });
      toast.success("Record deleted");
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });
}

export function useUpdateStudentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      record,
    }: { id: bigint; record: StudentRecord; orderId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudentRecord(id, record);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["studentRecords", vars.orderId.toString()],
      });
      toast.success("Record updated");
    },
    onError: () => {
      toast.error("Failed to update record");
    },
  });
}

// ─── Client Order Design ──────────────────────────────────────────────────────
export function useUploadClientOrderDesign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      designImageKey,
    }: { orderId: bigint; designImageKey: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.uploadClientOrderDesign(orderId, designImageKey);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["allClientOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["clientOrder", vars.orderId.toString()],
      });
      toast.success("Design uploaded successfully");
    },
    onError: () => {
      toast.error("Failed to upload design");
    },
  });
}

export function useRemoveClientOrderDesign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeClientOrderDesign(orderId);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["allClientOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["clientOrder", orderId.toString()],
      });
      toast.success("Design removed");
    },
    onError: () => {
      toast.error("Failed to remove design");
    },
  });
}

// ─── File Upload ──────────────────────────────────────────────────────────────
export function useUploadFile() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      id,
      blob,
    }: { id: string; blob: import("../backend.d.ts").ExternalBlob }) => {
      if (!actor) throw new Error("No actor");
      return actor.uploadFile(id, blob);
    },
    onError: () => {
      toast.error("Failed to upload file");
    },
  });
}
