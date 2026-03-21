import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { SafeImage as Image } from "@/components/SafeImage";
import { router } from "expo-router";
import { useConnections, useConnectionRequests, useAcceptConnection, useRejectConnection } from "@/hooks/queries";

export default function ConnectionsScreen() {
  const [tab, setTab] = useState<"accepted" | "pending">("accepted");
  const { data: connections, isLoading: loadingConnections } = useConnections();
  const { data: requests, isLoading: loadingRequests } = useConnectionRequests();
  const accept = useAcceptConnection();
  const reject = useRejectConnection();

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800", paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 }}>
        Connections
      </Text>

      {/* Tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, marginBottom: 12, gap: 8 }}>
        {(["accepted", "pending"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: tab === t ? "#FF3D6B" : "#141414",
            }}
          >
            <Text style={{ color: tab === t ? "#FFF" : "#A0A0A0", fontWeight: "600", textTransform: "capitalize" }}>
              {t} {t === "pending" ? `(${requests?.length ?? 0})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "accepted" ? (
        <FlatList
          data={connections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const other = item.attributes.other_user;
            return (
              <TouchableOpacity
                onPress={() => router.push(`/profile/${other.id}`)}
                style={{ flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" }}
              >
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#2A2A2A", overflow: "hidden" }}>
                  {other.avatar_url && <Image source={{ uri: other.avatar_url }} style={{ width: 50, height: 50 }} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>{other.name}</Text>
                  <Text style={{ color: "#666", marginTop: 2 }}>{other.city}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/chat/${item.id}`)}
                  style={{ backgroundColor: "#FF3D6B", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}
                >
                  <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 13 }}>Chat</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🤝</Text>
              <Text style={{ color: "#A0A0A0" }}>No connections yet</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const other = item.attributes.other_user;
            return (
              <View style={{ flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#2A2A2A", overflow: "hidden" }}>
                  {other.avatar_url && <Image source={{ uri: other.avatar_url }} style={{ width: 50, height: 50 }} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>{other.name}</Text>
                  <Text style={{ color: "#A0A0A0", marginTop: 2 }}>{other.intent?.replace(/_/g, " ")}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => accept.mutate(Number(item.id))}
                    style={{ backgroundColor: "#22C55E", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "600" }}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => reject.mutate(Number(item.id))}
                    style={{ backgroundColor: "#333", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
                  >
                    <Text style={{ color: "#A0A0A0", fontWeight: "600" }}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📩</Text>
              <Text style={{ color: "#A0A0A0" }}>No pending requests</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
