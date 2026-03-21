import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectionsService } from "@/services/connections.service";
import { queryKeys } from "@/lib/queryKeys";
import type { JsonApiResource, ConnectionAttributes } from "@/types";
import { toast } from "@/utils/toast";

export function useConnections() {
  return useQuery({
    queryKey: queryKeys.connections.all,
    queryFn: () =>
      connectionsService.getAll().then((r) => (r.data.connections?.data ?? []) as JsonApiResource<ConnectionAttributes>[]),
  });
}

export function useConnectionRequests() {
  return useQuery({
    queryKey: queryKeys.connections.requests(),
    queryFn: () =>
      connectionsService.getRequests().then((r) => (r.data.requests?.data ?? []) as JsonApiResource<ConnectionAttributes>[]),
  });
}

export function useAcceptConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => connectionsService.accept(id),
    onSuccess: () => {
      toast.success("Connection accepted!");
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.requests() });
    },
  });
}

export function useRejectConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => connectionsService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.requests() });
    },
  });
}
