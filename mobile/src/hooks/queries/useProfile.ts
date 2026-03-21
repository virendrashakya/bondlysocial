import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "@/services/profiles.service";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/authStore";
import type { Profile, JsonApiResource, SuggestionProfile } from "@/types";
import { toast } from "@/utils/toast";

export function useMyProfile() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: queryKeys.profiles.me(),
    queryFn: () =>
      profilesService.getProfile(user!.id).then((r) => r.data.profile.data?.attributes as Profile),
    enabled: !!user?.id,
  });
}

export function useProfile(userId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(userId!),
    queryFn: () =>
      profilesService.getProfile(userId!).then((r) => r.data.profile.data),
    enabled: !!userId,
  });
}

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

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageUri: string) => profilesService.uploadAvatar(imageUri),
    onSuccess: () => {
      toast.success("Photo updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
    },
  });
}

export function useSearchProfiles(params: { q?: string; intent?: string; city?: string; interests?: string[] }) {
  return useQuery({
    queryKey: queryKeys.profiles.search(params),
    queryFn: () =>
      profilesService.searchProfiles(params).then((r) => (r.data.profiles?.data ?? []) as JsonApiResource<SuggestionProfile>[]),
    enabled: !!(params.q || params.intent || params.city),
  });
}

export function useUploadSelfie() {
  return useMutation({
    mutationFn: (imageUri: string) => profilesService.uploadSelfie(imageUri),
    onSuccess: () => toast.success("Selfie submitted for review"),
  });
}
