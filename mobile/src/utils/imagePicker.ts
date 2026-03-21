import { Alert } from "react-native";

let ImagePicker: typeof import("expo-image-picker") | null = null;
try {
  ImagePicker = require("expo-image-picker");
} catch {
  // expo-image-picker not available — provide stub
}

export async function pickImage(): Promise<string | null> {
  if (!ImagePicker) {
    Alert.alert(
      "Not Available",
      "Image picker requires a development build. Please use 'npx expo run:ios' or 'npx expo run:android'."
    );
    return null;
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Permission needed", "Please allow photo library access.");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  if (!ImagePicker) {
    Alert.alert(
      "Not Available",
      "Camera requires a development build. Please use 'npx expo run:ios' or 'npx expo run:android'."
    );
    return null;
  }

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Permission needed", "Please allow camera access.");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}
