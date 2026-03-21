import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeImage as Image } from "@/components/SafeImage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile, useConnect } from "@/hooks/queries";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useProfile(Number(id));
  const connect = useConnect();
  const profile = data?.attributes;

  if (isLoading || !profile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" }}>
        <ActivityIndicator size="large" color="#FF3D6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0A" }} edges={["top"]}>
      <ScrollView>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <Text style={{ color: "#FF3D6B", fontSize: 18 }}>← Back</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={{ width: 120, height: 120, borderRadius: 60 }} />
          ) : (
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: "#2A2A2A", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 48 }}>👤</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ paddingHorizontal: 24, gap: 12 }}>
          <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "800", textAlign: "center" }}>
            {profile.name}, {profile.age}
          </Text>
          <Text style={{ color: "#A0A0A0", textAlign: "center" }}>{profile.city}</Text>

          <View style={{ backgroundColor: "rgba(255,61,107,0.15)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, alignSelf: "center" }}>
            <Text style={{ color: "#FF3D6B", fontWeight: "600" }}>{profile.intent?.replace(/_/g, " ")}</Text>
          </View>

          {profile.bio && (
            <View style={{ backgroundColor: "#141414", padding: 16, borderRadius: 14, marginTop: 8 }}>
              <Text style={{ color: "#FFF", lineHeight: 22 }}>{profile.bio}</Text>
            </View>
          )}

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: "#A0A0A0", fontWeight: "600", marginBottom: 8 }}>Interests</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {profile.interests.map((i: string) => (
                  <View key={i} style={{ backgroundColor: "#1A1A1A", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                    <Text style={{ color: "#FFF" }}>{i}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Connect button */}
          <TouchableOpacity
            onPress={() => connect.mutate(Number(id))}
            style={{
              backgroundColor: "#FF3D6B",
              padding: 16,
              borderRadius: 14,
              alignItems: "center",
              marginTop: 16,
              marginBottom: 40,
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>Send Connection Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
