import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/utils/toast";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.login({ email: email.trim(), password });
      const { user, access_token, refresh_token } = data;
      const authUser = { ...user.data.attributes, id: Number(user.data.id) };
      setAuth(authUser, access_token, refresh_token);
      if (authUser.profile) {
        router.replace("/(tabs)/discover");
      } else {
        router.replace("/(onboarding)");
      }
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#0A0A0A" }}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: "#FF3D6B", fontSize: 32, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>
          IntentConnect
        </Text>
        <Text style={{ color: "#A0A0A0", fontSize: 16, textAlign: "center", marginBottom: 40 }}>
          Connect with purpose, not swipes.
        </Text>

        <View style={{ gap: 16 }}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              backgroundColor: "#141414",
              borderWidth: 1,
              borderColor: "#2A2A2A",
              borderRadius: 14,
              padding: 16,
              color: "#FFF",
              fontSize: 16,
            }}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              backgroundColor: "#141414",
              borderWidth: 1,
              borderColor: "#2A2A2A",
              borderRadius: 14,
              padding: 16,
              color: "#FFF",
              fontSize: 16,
            }}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: "#FF3D6B",
              borderRadius: 14,
              padding: 16,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: "#A0A0A0" }}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={{ color: "#FF3D6B", fontWeight: "600" }}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
