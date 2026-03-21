import { useEffect, useRef, useCallback } from "react";
// @ts-ignore
import { createConsumer } from "@rails/actioncable";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";

const WS_URL = Constants.expoConfig?.extra?.wsUrl || "ws://192.168.29.207:3000/cable";

let cable: any = null;

function getCable() {
  if (!cable) {
    const token = useAuthStore.getState().accessToken;
    cable = createConsumer(`${WS_URL}?token=${token}`);
  }
  return cable;
}

export function resetCable() {
  if (cable) {
    cable.disconnect();
    cable = null;
  }
}

export function useConversationChannel(
  connectionId: number | null,
  onMessage: (data: any) => void
) {
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

  const sendTyping = useCallback(() => {
    subscriptionRef.current?.perform("typing");
  }, []);

  return { sendTyping };
}

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

export function usePresenceChannel(onPresence: (data: PresenceUpdate) => void) {
  useEffect(() => {
    const consumer = getCable();
    const sub = consumer.subscriptions.create(
      { channel: "PresenceChannel" },
      {
        received: onPresence,
        connected: () => {
          const interval = setInterval(() => sub.perform("heartbeat"), 30_000);
          (sub as any)._heartbeatInterval = interval;
        },
        disconnected: () => {
          clearInterval((sub as any)._heartbeatInterval);
        },
      }
    );
    return () => {
      clearInterval((sub as any)._heartbeatInterval);
      sub.unsubscribe();
    };
  }, []);
}
