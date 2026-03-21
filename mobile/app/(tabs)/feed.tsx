import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeImage as Image } from "@/components/SafeImage";
import { router } from "expo-router";
import { usePosts, useLikePost } from "@/hooks/queries";
import type { Post } from "@/types";

const { width } = Dimensions.get("window");
const GRID_SIZE = (width - 4) / 3;

export default function FeedScreen() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { data: posts, isLoading, refetch } = usePosts();
  const likePost = useLikePost();

  const renderGridItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      onPress={() => router.push(`/profile/${item.author_id}`)}
      style={{ width: GRID_SIZE, height: GRID_SIZE }}
    >
      {item.media?.[0]?.url ? (
        <Image source={{ uri: item.media[0].url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      ) : (
        <View style={{ flex: 1, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#666" }}>📷</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: Post }) => (
    <View style={{ backgroundColor: "#141414", marginBottom: 12, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#1A1A1A" }}>
      {/* Author */}
      <TouchableOpacity
        onPress={() => router.push(`/profile/${item.author_id}`)}
        style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 10 }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#2A2A2A", overflow: "hidden" }}>
          {item.author_avatar && <Image source={{ uri: item.author_avatar }} style={{ width: 36, height: 36 }} />}
        </View>
        <Text style={{ color: "#FFF", fontWeight: "600" }}>{item.author_name}</Text>
      </TouchableOpacity>

      {/* Media */}
      {item.media?.[0]?.url && (
        <Image source={{ uri: item.media[0].url }} style={{ width: "100%", height: width }} contentFit="cover" />
      )}

      {/* Actions */}
      <View style={{ padding: 14, gap: 8 }}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity onPress={() => likePost.mutate(item.id)} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 20 }}>{item.liked_by_me ? "❤️" : "🤍"}</Text>
            <Text style={{ color: "#A0A0A0" }}>{item.likes_count}</Text>
          </TouchableOpacity>
        </View>
        {item.caption && (
          <Text style={{ color: "#FFF", lineHeight: 20 }}>
            <Text style={{ fontWeight: "700" }}>{item.author_name} </Text>
            {item.caption}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 }}>
        <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800" }}>Moments</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setViewMode("list")}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: viewMode === "list" ? "rgba(255,61,107,0.2)" : "transparent",
            }}
          >
            <Text style={{ fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("grid")}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: viewMode === "grid" ? "rgba(255,61,107,0.2)" : "transparent",
            }}
          >
            <Text style={{ fontSize: 18 }}>⊞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "grid" ? (
        <FlatList
          data={posts}
          numColumns={3}
          renderItem={renderGridItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: 2 }}
          columnWrapperStyle={{ gap: 2 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF3D6B" />}
        />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderListItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF3D6B" />}
        />
      )}
    </View>
  );
}
