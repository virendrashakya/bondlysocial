import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 64, marginBottom: 16 }}>🔍</Text>
      <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "700" }}>Page Not Found</Text>
      <Text style={{ color: "#A0A0A0", marginTop: 8, textAlign: "center" }}>
        The page you're looking for doesn't exist.
      </Text>
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/discover")}
        style={{ backgroundColor: "#FF3D6B", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 24 }}
      >
        <Text style={{ color: "#FFF", fontWeight: "700" }}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}
