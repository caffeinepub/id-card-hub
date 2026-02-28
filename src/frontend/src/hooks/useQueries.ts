import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CardType,
  Customer,
  DashboardStats,
  Order,
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
      return actor.initializeSeedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
