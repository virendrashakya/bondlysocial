import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeImage as Image } from "@/components/SafeImage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "@/services/groups.service";
import { queryKeys } from "@/lib/queryKeys";
import { useGroupChannel } from "@/lib/actioncable";
import { useAuthStore } from "@/store/authStore";
import type { JsonApiResource, GroupAttributes, GroupMessage } from "@/types";
import { format } from "date-fns";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"members" | "chat">("members");
  const [text, setText] = useState("");
  const [chatMessages, setChatMessages] = useState<GroupMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const { data: groupData, isLoading } = useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: () => groupsService.getOne(groupId).then((r) => r.data.group?.data as JsonApiResource<GroupAttributes>),
  });

  const group = groupData?.attributes;

  // Fetch initial messages
  useEffect(() => {
    if (group?.is_member) {
      groupsService.getMessages(groupId).then((r) => {
        setChatMessages(r.data.messages ?? []);
      });
    }
  }, [groupId, group?.is_member]);

  // Real-time messages
  useGroupChannel(group?.is_member ? groupId : null, (data: any) => {
    if (data.type === "message") {
      setChatMessages((prev) => [...prev, data.message]);
    }
  });

  const handleSend = async () => {
    if (!text.trim()) return;
    await groupsService.sendMessage(groupId, text.trim());
    setText("");
  };

  if (isLoading || !group) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" }}>
        <ActivityIndicator size="large" color="#FF3D6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0A" }} edges={["top"]}>
      {/* Header */}
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ color: "#FF3D6B", fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "700" }}>{group.title}</Text>
            <Text style={{ color: "#A0A0A0" }}>{group.members_count} members · {group.city}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", marginTop: 12, gap: 8 }}>
          {(["members", "chat"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: tab === t ? "#FF3D6B" : "#1A1A1A",
              }}
            >
              <Text style={{ color: tab === t ? "#FFF" : "#A0A0A0", fontWeight: "600", textTransform: "capitalize" }}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === "members" ? (
        <FlatList
          data={group.members}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item: member }) => (
            <TouchableOpacity
              onPress={() => router.push(`/profile/${member.id}`)}
              style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#141414", borderRadius: 14, gap: 12 }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#2A2A2A", overflow: "hidden" }}>
                {member.avatar_url && <Image source={{ uri: member.avatar_url }} style={{ width: 44, height: 44 }} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>{member.name}</Text>
                  {member.role === "admin" && <Text style={{ color: "#F59E0B", fontSize: 12 }}>👑</Text>}
                </View>
                {member.city && <Text style={{ color: "#666", marginTop: 2 }}>{member.city}</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item: msg }) => {
              const isMine = msg.user_id === userId;
              return (
                <View style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                  {!isMine && (
                    <Text style={{ color: "#FF3D6B", fontSize: 12, fontWeight: "600", marginBottom: 2 }}>
                      {msg.user_name}
                    </Text>
                  )}
                  <View
                    style={{
                      backgroundColor: isMine ? "#FF3D6B" : "#1A1A1A",
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 16,
                    }}
                  >
                    <Text style={{ color: "#FFF" }}>{msg.body}</Text>
                  </View>
                  <Text style={{ color: "#666", fontSize: 10, marginTop: 2, alignSelf: isMine ? "flex-end" : "flex-start" }}>
                    {format(new Date(msg.created_at), "HH:mm")}
                  </Text>
                </View>
              );
            }}
          />

          {/* Input */}
          <View style={{ flexDirection: "row", padding: 12, borderTopWidth: 1, borderTopColor: "#1A1A1A", gap: 8 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message group..."
              placeholderTextColor="#666"
              style={{ flex: 1, backgroundColor: "#141414", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: "#FFF" }}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim()}
              style={{
                backgroundColor: text.trim() ? "#FF3D6B" : "#333",
                width: 40, height: 40, borderRadius: 20,
                justifyContent: "center", alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF" }}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
