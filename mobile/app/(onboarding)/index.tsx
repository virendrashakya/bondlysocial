import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { profilesService } from "@/services/profiles.service";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/utils/toast";
import { INTENTS, INTERESTS } from "@/constants";
import { pickImage as safePickImage } from "@/utils/imagePicker";
import { SafeImage } from "@/components/SafeImage";

const STEPS = ["About You", "Intent", "Interests", "Photo"];

const INTENT_LABELS: Record<string, string> = {
  friendship: "Friendship",
  activity_partner: "Activity Partner",
  networking: "Networking",
  emotional_support: "Emotional Support",
  serious_relationship: "Serious Relationship",
  marriage: "Marriage",
};

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [intent, setIntent] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handlePickImage = async () => {
    const uri = await safePickImage();
    if (uri) setAvatarUri(uri);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data } = await profilesService.createProfile({
        name,
        age: parseInt(age),
        gender,
        city,
        intent,
        interests,
      });
      if (avatarUri) {
        await profilesService.uploadAvatar(avatarUri);
      }
      if (user) {
        setAuth(
          { ...user, profile: { name, city, intent } },
          useAuthStore.getState().accessToken!,
          useAuthStore.getState().refreshToken!
        );
      }
      router.replace("/(tabs)/discover");
    } catch {
      toast.error("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return name && age && gender && city;
    if (step === 1) return intent;
    if (step === 2) return interests.length >= 3;
    return true;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      {/* Progress */}
      <View style={{ flexDirection: "row", paddingHorizontal: 24, paddingTop: 60, gap: 8 }}>
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= step ? "#FF3D6B" : "#2A2A2A",
            }}
          />
        ))}
      </View>
      <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "700", paddingHorizontal: 24, marginTop: 24 }}>
        {STEPS[step]}
      </Text>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 24 }}>
        {step === 0 && (
          <View style={{ gap: 16 }}>
            <TextInput placeholder="Name" placeholderTextColor="#666" value={name} onChangeText={setName} style={inputStyle} />
            <TextInput placeholder="Age" placeholderTextColor="#666" value={age} onChangeText={setAge} keyboardType="number-pad" style={inputStyle} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              {["male", "female", "non_binary"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: gender === g ? "#FF3D6B" : "#2A2A2A",
                    backgroundColor: gender === g ? "rgba(255,61,107,0.1)" : "#141414",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: gender === g ? "#FF3D6B" : "#A0A0A0", fontWeight: "600", textTransform: "capitalize" }}>
                    {g.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput placeholder="City" placeholderTextColor="#666" value={city} onChangeText={setCity} style={inputStyle} />
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: 12 }}>
            {INTENTS.map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setIntent(i)}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: intent === i ? "#FF3D6B" : "#2A2A2A",
                  backgroundColor: intent === i ? "rgba(255,61,107,0.1)" : "#141414",
                }}
              >
                <Text style={{ color: intent === i ? "#FF3D6B" : "#FFF", fontWeight: "600", fontSize: 16 }}>
                  {INTENT_LABELS[i] || i}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {INTERESTS.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => toggleInterest(item)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: interests.includes(item) ? "#FF3D6B" : "#2A2A2A",
                  backgroundColor: interests.includes(item) ? "rgba(255,61,107,0.1)" : "#141414",
                }}
              >
                <Text style={{ color: interests.includes(item) ? "#FF3D6B" : "#A0A0A0" }}>{item}</Text>
              </TouchableOpacity>
            ))}
            <Text style={{ color: "#666", marginTop: 8, width: "100%" }}>Select at least 3 interests</Text>
          </View>
        )}

        {step === 3 && (
          <View style={{ alignItems: "center", gap: 20 }}>
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "#141414",
                borderWidth: 2,
                borderColor: avatarUri ? "#FF3D6B" : "#2A2A2A",
                borderStyle: "dashed",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {avatarUri ? (
                <View style={{ width: 156, height: 156, borderRadius: 78, overflow: "hidden" }}>
                  <SafeImage source={{ uri: avatarUri }} style={{ width: 156, height: 156 }} contentFit="cover" />
                </View>
              ) : (
                <Text style={{ color: "#666", textAlign: "center" }}>Tap to{"\n"}add photo</Text>
              )}
            </TouchableOpacity>
            <Text style={{ color: "#A0A0A0", textAlign: "center" }}>
              Add a profile photo so others can see you
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom buttons */}
      <View style={{ padding: 24, flexDirection: "row", gap: 12 }}>
        {step > 0 && (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#A0A0A0", fontWeight: "600" }}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={step < 3 ? () => setStep(step + 1) : handleFinish}
          disabled={!canNext() || loading}
          style={{
            flex: step > 0 ? 1 : undefined,
            width: step === 0 ? "100%" : undefined,
            backgroundColor: canNext() ? "#FF3D6B" : "#333",
            borderRadius: 14,
            padding: 16,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
              {step < 3 ? "Next" : "Get Started"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#141414",
  borderWidth: 1,
  borderColor: "#2A2A2A",
  borderRadius: 14,
  padding: 16,
  color: "#FFF",
  fontSize: 16,
};
