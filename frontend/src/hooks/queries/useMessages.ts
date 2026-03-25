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

/** Fetch pinned messages for a connection. */
export function usePinnedMessages(connectionId: number) {
  return useQuery({
    queryKey: queryKeys.messages.pinned(connectionId),
    queryFn: () =>
      messagesService
        .getPinned(connectionId)
        .then((r) => (r.data.messages?.data ?? []) as JsonApiResource<MessageAttributes>[]),
  });
}

import { useAuthStore } from "@/store/authStore";

/** Mutation: send a text message. */
export function useSendMessage(connectionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => messagesService.sendMessage(connectionId, text),
    onMutate: async (text: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.messages.list(connectionId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<JsonApiResource<MessageAttributes>[]>(queryKeys.messages.list(connectionId));

      // Create an optimistic message object
      const currentUser = useAuthStore.getState().user;
      const optimisticId = `temp-${Date.now()}`;
      
      const optimisticMsg: JsonApiResource<MessageAttributes> = {
        id: optimisticId,
        type: "message",
        attributes: {
          body: text,
          sender_id: currentUser?.id ?? 0,
          sender_name: currentUser?.profile?.name || "",
          read: true, // Optimistically assume it's sent
          created_at: new Date().toISOString(),
          message_type: "text",
          pinned: false,
          pinned_at: null,
          reactions: [],
        },
      };

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.messages.list(connectionId), (old: JsonApiResource<MessageAttributes>[] | undefined) => {
        return old ? [...old, optimisticMsg] : [optimisticMsg];
      });

      // Return a context with the previous messages and the temp ID to rollback or update later
      return { previousMessages, optimisticId };
    },
    onError: (err, newText, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.messages.list(connectionId), context.previousMessages);
      }
    },
    onSuccess: (response, variables, context) => {
      const realMessage = response.data.message?.data;
      if (realMessage && context?.optimisticId) {
        // Swap out the temporary optimistic message with the real one returned by the server
        queryClient.setQueryData(queryKeys.messages.list(connectionId), (old: JsonApiResource<MessageAttributes>[] | undefined) => {
          if (!old) return [realMessage];
          return old.map((msg) => msg.id === context.optimisticId ? realMessage : msg);
        });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
      }
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

/** Mutation: toggle reaction on a message. */
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

/** Mutation: toggle pin on a message. */
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

/** Mutation: send typing indicator. */
export function useSendTyping(connectionId: number) {
  return useMutation({
    mutationFn: () => messagesService.sendTyping(connectionId),
  });
}

/** Mutation: mark messages as read. */
export function useMarkRead(connectionId: number) {
  return useMutation({
    mutationFn: () => messagesService.markRead(connectionId),
  });
}
