import { useEffect, useRef, useCallback } from "react";
// @ts-ignore -- no type declarations for @rails/actioncable
import { createConsumer } from "@rails/actioncable";
import { useAuthStore } from "../store/authStore";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000/cable";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cable: any = null;

function getCable() {
  if (!cable) {
    const token = useAuthStore.getState().accessToken;
    cable = createConsumer(`${WS_URL}?token=${token}`);
  }
  return cable;
}

export function useConversationChannel(
  connectionId: number | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage: (data: any) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!connectionId) return;

    const consumer = getCable();
    subscriptionRef.current = consumer.subscriptions.create(
      { channel: "ConversationChannel", connection_id: connectionId },
      { received: onMessage }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [connectionId]);

  /** Send typing indicator through ActionCable directly. */
  const sendTyping = useCallback(() => {
    subscriptionRef.current?.perform("typing");
  }, []);

  return { sendTyping };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useNotificationsChannel(onNotification: (data: any) => void) {
  useEffect(() => {
    const consumer = getCable();
    const sub = consumer.subscriptions.create(
      { channel: "NotificationsChannel" },
      { received: onNotification }
    );
    return () => sub.unsubscribe();
  }, []);
}

/** Subscribe to a group channel for real-time group chat messages. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useGroupChannel(groupId: number | null, onMessage: (data: any) => void) {
  useEffect(() => {
    if (!groupId) return;

    const consumer = getCable();
    const sub = consumer.subscriptions.create(
      { channel: "GroupChannel", group_id: groupId },
      { received: onMessage }
    );

    return () => sub.unsubscribe();
  }, [groupId]);
}

export interface PresenceUpdate {
  type: "presence";
  user_id: number;
  status: "online" | "offline";
  last_active_at: string | null;
}

/** Subscribe to the presence channel for online status. */
export function usePresenceChannel(onPresence: (data: PresenceUpdate) => void) {
  useEffect(() => {
    const consumer = getCable();
    const sub = consumer.subscriptions.create(
      { channel: "PresenceChannel" },
      {
        received: onPresence,
        connected: () => {
          // Send heartbeat every 30s
          const interval = setInterval(() => sub.perform("heartbeat"), 30_000);
          sub._heartbeatInterval = interval;
        },
        disconnected: () => {
          clearInterval(sub._heartbeatInterval);
        },
      }
    );
    return () => {
      clearInterval(sub._heartbeatInterval);
      sub.unsubscribe();
    };
  }, []);
}
