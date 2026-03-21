import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeImage as Image } from "@/components/SafeImage";
import { useSuggestions, useConnect } from "@/hooks/queries";
import type { JsonApiResource, SuggestionProfile } from "@/types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

export default function DiscoverScreen() {
  const { data: suggestions, isLoading } = useSuggestions();
  const connect = useConnect();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCard = suggestions?.[currentIndex];
  const profile = currentCard?.attributes;

  const handlePass = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const handleConnect = useCallback(() => {
    if (!currentCard) return;
    connect.mutate(Number(currentCard.id));
    setCurrentIndex((i) => i + 1);
  }, [currentCard]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" }}>
        <ActivityIndicator size="large" color="#FF3D6B" />
      </View>
    );
  }

  if (!profile || currentIndex >= (suggestions?.length ?? 0)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A", paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✨</Text>
        <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "700", textAlign: "center" }}>
          No more suggestions
        </Text>
        <Text style={{ color: "#A0A0A0", marginTop: 8, textAlign: "center" }}>
          Check back later for new people
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A", paddingTop: 60 }}>
      <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800", paddingHorizontal: 16, marginBottom: 16 }}>
        Discover
      </Text>

      {/* Card */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 24,
            backgroundColor: "#141414",
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#2A2A2A",
          }}
        >
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: "100%", height: "60%" }}
              contentFit="cover"
            />
          ) : (
            <View style={{ width: "100%", height: "60%", backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 64 }}>👤</Text>
            </View>
          )}

          <View style={{ padding: 20, flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "700" }}>
                {profile.name}, {profile.age}
              </Text>
              {profile.verified && <Text>✓</Text>}
            </View>
            <Text style={{ color: "#A0A0A0", marginTop: 4 }}>{profile.city}</Text>

            <View
              style={{
                backgroundColor: "rgba(255,61,107,0.15)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                alignSelf: "flex-start",
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#FF3D6B", fontWeight: "600", fontSize: 13 }}>
                {profile.intent?.replace(/_/g, " ")}
              </Text>
            </View>

            {profile.bio && (
              <Text style={{ color: "#A0A0A0", marginTop: 12, lineHeight: 20 }} numberOfLines={3}>
                {profile.bio}
              </Text>
            )}

            {profile.match_score !== undefined && (
              <Text style={{ color: "#22C55E", fontWeight: "600", marginTop: 8 }}>
                {profile.match_score}% Match
              </Text>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
          <TouchableOpacity
            onPress={handlePass}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              alignItems: "center",
              backgroundColor: "#141414",
            }}
          >
            <Text style={{ fontSize: 24 }}>👋</Text>
            <Text style={{ color: "#A0A0A0", marginTop: 4, fontWeight: "600" }}>Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/profile/${currentCard.id}`)}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              alignItems: "center",
              backgroundColor: "#141414",
            }}
          >
            <Text style={{ fontSize: 24 }}>👁</Text>
            <Text style={{ color: "#A0A0A0", marginTop: 4, fontWeight: "600" }}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConnect}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 16,
              alignItems: "center",
              backgroundColor: "#FF3D6B",
            }}
          >
            <Text style={{ fontSize: 24 }}>💝</Text>
            <Text style={{ color: "#FFF", marginTop: 4, fontWeight: "600" }}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
