import React from "react";
import { Image as RNImage, ImageStyle, StyleProp } from "react-native";

let ExpoImage: any = null;
try {
  ExpoImage = require("expo-image").Image;
} catch {
  // expo-image not available in Expo Go — fall back to RN Image
}

interface SafeImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain" | "fill" | "none";
  placeholder?: string | null;
  transition?: number;
  [key: string]: any;
}

export function SafeImage({
  source,
  style,
  contentFit = "cover",
  placeholder,
  transition,
  ...rest
}: SafeImageProps) {
  if (ExpoImage) {
    return (
      <ExpoImage
        source={source}
        style={style}
        contentFit={contentFit}
        placeholder={placeholder}
        transition={transition}
        {...rest}
      />
    );
  }

  return (
    <RNImage
      source={typeof source === "number" ? source : source}
      style={style}
      resizeMode={contentFit === "cover" ? "cover" : contentFit === "contain" ? "contain" : "cover"}
      {...rest}
    />
  );
}
