import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesService } from "@/services/messages.service";
import { queryKeys } from "@/lib/queryKeys";
import type { JsonApiResource, MessageAttributes } from "@/types";

export function useMessages(connectionId: number) {
  return useQuery({
    queryKey: queryKeys.messages.list(connectionId),
    queryFn: () =>
      messagesService.getMessages(connectionId).then((r) => (r.data.messages?.data ?? []) as JsonApiResource<MessageAttributes>[]),
  });
}

export function useMessagePreview(connectionId: number) {
  return useQuery({
    queryKey: queryKeys.messages.preview(connectionId),
    queryFn: () =>
      messagesService.getMessages(connectionId).then((r) => (r.data.messages?.data ?? []) as JsonApiResource<MessageAttributes>[]),
    staleTime: 30_000,
  });
}

export function usePinnedMessages(connectionId: number) {
  return useQuery({
    queryKey: queryKeys.messages.pinned(connectionId),
    queryFn: () =>
      messagesService.getPinned(connectionId).then((r) => (r.data.messages?.data ?? []) as JsonApiResource<MessageAttributes>[]),
  });
}

export function useSendMessage(connectionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => messagesService.sendMessage(connectionId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
    },
  });
}

export function useSendImage(connectionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageUri, body }: { imageUri: string; body?: string }) =>
      messagesService.sendImage(connectionId, imageUri, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
    },
  });
}

export function useReactToMessage(connectionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: number; emoji: string }) =>
      messagesService.react(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
    },
  });
}

export function usePinMessage(connectionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: number) => messagesService.pin(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.pinned(connectionId) });
    },
  });
}

export function useSendTyping(connectionId: number) {
  return useMutation({
    mutationFn: () => messagesService.sendTyping(connectionId),
  });
}

export function useMarkRead(connectionId: number) {
  return useMutation({
    mutationFn: () => messagesService.markRead(connectionId),
  });
}
