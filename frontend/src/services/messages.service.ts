import { api } from "../lib/api";

export const messagesService = {
  getMessages: (connectionId: number) =>
    api.get(`/messages/${connectionId}`),

  sendMessage: (connectionId: number, body: string, referencedPostId?: number) =>
    api.post("/messages", {
      connection_id: connectionId,
      body: body || undefined,
      referenced_post_id: referencedPostId,
    }),
};
