import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "@/services/profiles.service";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/authStore";
import type { Profile, JsonApiResource, SuggestionProfile } from "@/types";
import toast from "react-hot-toast";

/** Fetch the current user's own profile. */
export function useMyProfile() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: queryKeys.profiles.me(),
    queryFn: () =>
      profilesService
        .getProfile(user!.id)
        .then((r) => r.data.profile.data?.attributes as Profile),
    enabled: !!user?.id,
  });
}

/** Fetch any user's profile by ID. */
export function useProfile(userId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(userId!),
    queryFn: () =>
      profilesService
        .getProfile(userId!)
        .then((r) => r.data.profile.data),
    enabled: !!userId,
  });
}

/** Mutation: update the current user's profile. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) => profilesService.updateProfile(data),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
    },
    onError: () => toast.error("Failed to save changes"),
  });
}

/** Mutation: upload a new avatar photo. */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profilesService.uploadAvatar(file),
    onSuccess: () => {
      toast.success("Photo updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
    },
  });
}

/** Search profiles with filters. */
export function useSearchProfiles(params: { q?: string; intent?: string; city?: string; interests?: string[] }) {
  return useQuery({
    queryKey: queryKeys.profiles.search(params),
    queryFn: () =>
      profilesService
        .searchProfiles(params)
        .then((r) => (r.data.profiles?.data ?? []) as JsonApiResource<SuggestionProfile>[]),
    enabled: !!(params.q || params.intent || params.city),
  });
}

/** Mutation: upload selfie for verification. */
export function useUploadSelfie() {
  return useMutation({
    mutationFn: (file: File) => profilesService.uploadSelfie(file),
    onSuccess: () => toast.success("Selfie submitted for review"),
  });
}
