import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyProfile, useUpdateProfile, useUploadAvatar, usePreferences, useUpdatePrivacy, useUpdateNotificationPrefs } from "@/hooks/queries";
import { useAuthStore } from "@/store/authStore";
import { resetCable } from "@/lib/actioncable";
import { pickImage } from "@/utils/imagePicker";
import { SafeImage as Image } from "@/components/SafeImage";

export default function SettingsScreen() {
  const [tab, setTab] = useState<"profile" | "privacy" | "notifications">("profile");
  const { data: profile } = useMyProfile();
  const { data: prefs } = usePreferences();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const updatePrivacy = useUpdatePrivacy();
  const updateNotifPrefs = useUpdateNotificationPrefs();
  const logout = useAuthStore((s) => s.logout);

  const [bio, setBio] = useState(profile?.bio || "");

  const handlePickAvatar = async () => {
    const uri = await pickImage();
    if (uri) uploadAvatar.mutate(uri);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          resetCable();
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0A" }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: "#FF3D6B", fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "700" }}>Settings</Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {(["profile", "privacy", "notifications"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: tab === t ? "#FF3D6B" : "#1A1A1A",
            }}
          >
            <Text style={{ color: tab === t ? "#FFF" : "#A0A0A0", fontWeight: "600", textTransform: "capitalize", fontSize: 13 }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {tab === "profile" && (
          <View style={{ gap: 16, paddingTop: 8 }}>
            {/* Avatar */}
            <TouchableOpacity onPress={handlePickAvatar} style={{ alignSelf: "center" }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#2A2A2A", overflow: "hidden" }}>
                {profile?.avatar_url && <Image source={{ uri: profile.avatar_url }} style={{ width: 80, height: 80 }} />}
              </View>
              <Text style={{ color: "#FF3D6B", textAlign: "center", marginTop: 8, fontWeight: "600" }}>Change Photo</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Bio"
              placeholderTextColor="#666"
              value={bio}
              onChangeText={setBio}
              multiline
              style={{
                backgroundColor: "#141414",
                borderWidth: 1,
                borderColor: "#2A2A2A",
                borderRadius: 14,
                padding: 16,
                color: "#FFF",
                minHeight: 80,
                textAlignVertical: "top",
              }}
            />
            <TouchableOpacity
              onPress={() => updateProfile.mutate({ bio })}
              style={{ backgroundColor: "#FF3D6B", padding: 14, borderRadius: 14, alignItems: "center" }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700" }}>Save Bio</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === "privacy" && prefs?.privacy && (
          <View style={{ gap: 4, paddingTop: 8 }}>
            {[
              { key: "hidden", label: "Hide Profile" },
              { key: "show_online", label: "Show Online Status" },
              { key: "searchable", label: "Searchable" },
              { key: "show_distance", label: "Show Distance" },
            ].map(({ key, label }) => (
              <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" }}>
                <Text style={{ color: "#FFF", fontSize: 16 }}>{label}</Text>
                <Switch
                  value={(prefs.privacy as any)[key]}
                  onValueChange={(val) => updatePrivacy.mutate({ [key]: val })}
                  trackColor={{ false: "#333", true: "#FF3D6B" }}
                  thumbColor="#FFF"
                />
              </View>
            ))}
          </View>
        )}

        {tab === "notifications" && prefs?.notifications && (
          <View style={{ gap: 4, paddingTop: 8 }}>
            {[
              { key: "connection_requests", label: "Connection Requests" },
              { key: "messages", label: "Messages" },
              { key: "group_activity", label: "Group Activity" },
              { key: "match_alerts", label: "Match Alerts" },
              { key: "weekly_digest", label: "Weekly Digest" },
            ].map(({ key, label }) => (
              <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" }}>
                <Text style={{ color: "#FFF", fontSize: 16 }}>{label}</Text>
                <Switch
                  value={(prefs.notifications as any)[key]}
                  onValueChange={(val) => updateNotifPrefs.mutate({ [key]: val })}
                  trackColor={{ false: "#333", true: "#FF3D6B" }}
                  thumbColor="#FFF"
                />
              </View>
            ))}
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{ backgroundColor: "#1A1A1A", padding: 16, borderRadius: 14, alignItems: "center", marginTop: 32, marginBottom: 40 }}
        >
          <Text style={{ color: "#EF4444", fontWeight: "700" }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
