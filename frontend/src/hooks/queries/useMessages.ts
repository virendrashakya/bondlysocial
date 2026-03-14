import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesService } from "@/services/messages.service";
import { queryKeys } from "@/lib/queryKeys";
import type { JsonApiResource, MessageAttributes } from "@/types";

/** Fetch messages for a connection. */
export function useMessages(connectionId: number) {
  return useQuery({
    queryKey: queryKeys.messages.list(connectionId),
    queryFn: () =>
      messagesService
        .getMessages(connectionId)
        .then((r) => (r.data.messages?.data ?? []) as JsonApiResource<MessageAttributes>[]),
  });
}

/** Fetch message preview for conversation list (shorter staleTime). */
export function useMessagePreview(connectionId: number) {
  return useQuery({
    queryKey: queryKeys.messages.preview(connectionId),
    queryFn: () =>
      messagesService
        .getMessages(connectionId)
        .then((r) => (r.data.messages?.data ?? []) as JsonApiResource<MessageAttributes>[]),
    staleTime: 30_000,
  });
}

/** Mutation: send a text message. */
export function useSendMessage(connectionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => messagesService.sendMessage(connectionId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
    },
  });
}

/** Mutation: send an image message. */
export function useSendImage(connectionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, body }: { file: File; body?: string }) =>
      messagesService.sendImage(connectionId, file, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
    },
  });
}
