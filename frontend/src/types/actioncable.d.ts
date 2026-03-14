declare module "actioncable" {
  export interface Subscription {
    unsubscribe(): void;
  }

  export interface Subscriptions {
    create(
      channel: string | { channel: string; [key: string]: any },
      callbacks: {
        received?: (data: any) => void;
        connected?: () => void;
        disconnected?: () => void;
      }
    ): Subscription;
  }

  export interface Consumer {
    subscriptions: Subscriptions;
    disconnect(): void;
  }

  export function createConsumer(url: string): Consumer;
}
