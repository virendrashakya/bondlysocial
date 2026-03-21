import { View, Text, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "@/services/groups.service";
import { queryKeys } from "@/lib/queryKeys";
import type { JsonApiResource, GroupAttributes } from "@/types";
import { toast } from "@/utils/toast";

export default function GroupsScreen() {
  const queryClient = useQueryClient();
  const { data: groups, isLoading, refetch } = useQuery({
    queryKey: queryKeys.groups.all,
    queryFn: () => groupsService.getAll().then((r) => (r.data.groups?.data ?? []) as JsonApiResource<GroupAttributes>[]),
  });

  const join = useMutation({
    mutationFn: (id: number) => groupsService.join(id),
    onSuccess: () => {
      toast.success("Joined group!");
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: "#FF3D6B", fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800" }}>Groups</Text>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF3D6B" />}
        renderItem={({ item }) => {
          const g = item.attributes;
          return (
            <TouchableOpacity
              onPress={() => router.push(`/groups/${item.id}`)}
              style={{ backgroundColor: "#141414", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1A1A1A" }}
            >
              <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700" }}>{g.title}</Text>
              <Text style={{ color: "#A0A0A0", marginTop: 4 }}>{g.city} · {g.category}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <Text style={{ color: "#666" }}>{g.members_count}/{g.max_members} members</Text>
                {g.is_member ? (
                  <View style={{ backgroundColor: "rgba(34,197,94,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                    <Text style={{ color: "#22C55E", fontWeight: "600" }}>Joined ✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => join.mutate(Number(item.id))}
                    style={{ backgroundColor: "#FF3D6B", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "600" }}>Join</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>👥</Text>
            <Text style={{ color: "#A0A0A0" }}>No groups available</Text>
          </View>
        }
      />
    </View>
  );
}
