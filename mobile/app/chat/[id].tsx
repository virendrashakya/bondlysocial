import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMessages, useSendMessage, useMarkRead } from "@/hooks/queries";
import { useConversationChannel } from "@/lib/actioncable";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { format } from "date-fns";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const connectionId = Number(id);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const { data: messages } = useMessages(connectionId);
  const sendMessage = useSendMessage(connectionId);
  const markRead = useMarkRead(connectionId);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useConversationChannel(connectionId, (data: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
  });

  useEffect(() => {
    markRead.mutate();
  }, [connectionId]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage.mutate(text.trim());
    setText("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0A" }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: "#FF3D6B", fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700", flex: 1 }}>Chat</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        inverted={false}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const msg = item.attributes;
          const isMine = msg.sender_id === userId;
          return (
            <View style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
              <View
                style={{
                  backgroundColor: isMine ? "#FF3D6B" : "#1A1A1A",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 18,
                  borderBottomRightRadius: isMine ? 4 : 18,
                  borderBottomLeftRadius: isMine ? 18 : 4,
                }}
              >
                <Text style={{ color: "#FFF", lineHeight: 20 }}>{msg.body}</Text>
              </View>
              <Text style={{ color: "#666", fontSize: 10, marginTop: 4, alignSelf: isMine ? "flex-end" : "flex-start" }}>
                {format(new Date(msg.created_at), "HH:mm")}
              </Text>
            </View>
          );
        }}
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          borderTopWidth: 1,
          borderTopColor: "#1A1A1A",
          gap: 8,
        }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor="#666"
            style={{
              flex: 1,
              backgroundColor: "#141414",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: "#FFF",
              fontSize: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim()}
            style={{
              backgroundColor: text.trim() ? "#FF3D6B" : "#333",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 16 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
