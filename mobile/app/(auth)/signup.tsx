import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/utils/toast";

export default function SignupScreen() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSignup = async () => {
    if (!email.trim() || !phone.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await authService.signup({ email: email.trim(), phone: phone.trim(), password });
      toast.success("OTP sent to your phone!");
      setStep("otp");
    } catch {
      toast.error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp({ phone: phone.trim(), otp: otp.trim() });
      const { user, access_token, refresh_token } = data;
      const authUser = { ...user.data.attributes, id: Number(user.data.id) };
      setAuth(authUser, access_token, refresh_token);
      router.replace("/(onboarding)");
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#0A0A0A" }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: "#FF3D6B", fontSize: 32, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>
          Join IntentConnect
        </Text>
        <Text style={{ color: "#A0A0A0", fontSize: 16, textAlign: "center", marginBottom: 40 }}>
          {step === "form" ? "Create your account" : "Verify your phone number"}
        </Text>

        {step === "form" ? (
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
              placeholder="Phone (+91...)"
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
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
              onPress={handleSignup}
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
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <TextInput
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#666"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                backgroundColor: "#141414",
                borderWidth: 1,
                borderColor: "#2A2A2A",
                borderRadius: 14,
                padding: 16,
                color: "#FFF",
                fontSize: 24,
                textAlign: "center",
                letterSpacing: 8,
              }}
            />
            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading}
              style={{
                backgroundColor: "#FF3D6B",
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: "#A0A0A0" }}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={{ color: "#FF3D6B", fontWeight: "600" }}>Log In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
