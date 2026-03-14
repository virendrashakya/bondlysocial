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

  sendImage: (connectionId: number, image: File, body?: string) => {
    const formData = new FormData();
    formData.append("connection_id", String(connectionId));
    formData.append("image", image);
    if (body?.trim()) formData.append("body", body.trim());
    return api.post("/messages", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
