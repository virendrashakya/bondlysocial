import { Alert, Platform, ToastAndroid } from "react-native";

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS doesn't have a native toast — use a non-blocking alert
    Alert.alert("", message, [{ text: "OK" }], { cancelable: true });
  }
};

let Burnt: typeof import("burnt") | null = null;
try {
  Burnt = require("burnt");
} catch {
  // burnt requires native modules — fall back to RN toast
}

export const toast = {
  success: (message: string) => {
    if (Burnt) {
      Burnt.toast({ title: message, preset: "done", haptic: "success" });
    } else {
      showToast(message);
    }
  },
  error: (message: string) => {
    if (Burnt) {
      Burnt.toast({ title: message, preset: "error", haptic: "error" });
    } else {
      showToast(message);
    }
  },
  info: (message: string) => {
    if (Burnt) {
      Burnt.toast({ title: message, preset: "none" });
    } else {
      showToast(message);
    }
  },
};
