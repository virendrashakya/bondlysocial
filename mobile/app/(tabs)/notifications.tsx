import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/queries";
import { formatDistanceToNow } from "date-fns";

const KIND_ICONS: Record<string, string> = {
  connection_request: "🤝",
  message: "💬",
  group_invite: "👥",
  system: "📢",
};

export default function NotificationsScreen() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 }}>
        <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800" }}>Notifications</Text>
        {(data?.unreadCount ?? 0) > 0 && (
          <TouchableOpacity onPress={() => markAllRead.mutate()}>
            <Text style={{ color: "#FF3D6B", fontWeight: "600" }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={data?.notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const n = item.attributes;
          return (
            <TouchableOpacity
              onPress={() => {
                if (!n.read) markRead.mutate(Number(item.id));
                if (n.kind === "connection_request") router.push("/(tabs)/connections");
                else if (n.kind === "message") router.push("/(tabs)/messages");
              }}
              style={{
                flexDirection: "row",
                padding: 16,
                gap: 12,
                backgroundColor: n.read ? "transparent" : "rgba(255,61,107,0.05)",
                borderBottomWidth: 1,
                borderBottomColor: "#1A1A1A",
              }}
            >
              <Text style={{ fontSize: 24 }}>{KIND_ICONS[n.kind] || "📢"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#FFF", fontWeight: n.read ? "400" : "700" }}>{n.title}</Text>
                {n.body && <Text style={{ color: "#A0A0A0", marginTop: 4 }}>{n.body}</Text>}
                <Text style={{ color: "#666", marginTop: 4, fontSize: 12 }}>
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </Text>
              </View>
              {!n.read && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3D6B", marginTop: 6 }} />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
            <Text style={{ color: "#A0A0A0" }}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}
