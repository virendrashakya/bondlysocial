import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { SafeImage as Image } from "@/components/SafeImage";
import { router } from "expo-router";
import { useConnections } from "@/hooks/queries";
import { usePresenceStore } from "@/store/presenceStore";
import { formatDistanceToNow } from "date-fns";

export default function MessagesScreen() {
  const { data: connections, isLoading } = useConnections();
  const isOnline = usePresenceStore((s) => s.isOnline);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" }}>
        <ActivityIndicator size="large" color="#FF3D6B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800", paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 }}>
        Messages
      </Text>

      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const other = item.attributes.other_user;
          const online = isOnline(other.id);
          return (
            <TouchableOpacity
              onPress={() => router.push(`/chat/${item.id}`)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#1A1A1A",
              }}
            >
              <View style={{ position: "relative" }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#2A2A2A", overflow: "hidden" }}>
                  {other.avatar_url && <Image source={{ uri: other.avatar_url }} style={{ width: 50, height: 50 }} />}
                </View>
                {online && (
                  <View style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 14, height: 14, borderRadius: 7,
                    backgroundColor: "#22C55E", borderWidth: 2, borderColor: "#0A0A0A",
                  }} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 16 }}>{other.name}</Text>
                <Text style={{ color: "#666", marginTop: 2 }}>{other.city}</Text>
              </View>
              <Text style={{ color: "#666", fontSize: 12 }}>
                {formatDistanceToNow(new Date(item.attributes.created_at), { addSuffix: true })}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
            <Text style={{ color: "#A0A0A0", textAlign: "center" }}>No conversations yet</Text>
          </View>
        }
      />
    </View>
  );
}
