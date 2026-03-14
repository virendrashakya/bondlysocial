import { useEffect, useRef } from "react";
// @ts-ignore -- no type declarations for @rails/actioncable
import { createConsumer } from "@rails/actioncable";
import { useAuthStore } from "../store/authStore";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001/cable";

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
