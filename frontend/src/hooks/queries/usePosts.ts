import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Post } from "@/types";
import toast from "react-hot-toast";

/** Fetch posts — optionally scoped to a user. */
export function usePosts(userId?: number) {
  return useQuery({
    queryKey: queryKeys.posts.list(userId),
    queryFn: () => {
      const url = userId ? `/users/${userId}/posts` : "/posts";
      return api.get(url).then((r) => (r.data.posts ?? []) as Post[]);
    },
  });
}

/** Mutation: like / unlike a post. */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => api.post(`/posts/${postId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

/** Mutation: delete a post. */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => api.delete(`/posts/${postId}`),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: () => toast.error("Failed to delete post"),
  });
}

/** Mutation: create a new post with media files. */
export function useCreatePost(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      caption?: string;
      visibility: string;
      location?: string;
      files: File[];
    }) => {
      const form = new FormData();
      if (params.caption) form.append("post[caption]", params.caption);
      form.append("post[visibility]", params.visibility);
      if (params.location) form.append("post[location]", params.location);
      params.files.forEach((file) => form.append("post[media_files][]", file));
      return api.post("/posts", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Post shared!");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to post. Try again."),
  });
}
