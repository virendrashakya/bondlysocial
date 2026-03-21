import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useNotifications } from "@/hooks/queries";

function TabIcon({ name, focused, badge }: { name: string; focused: boolean; badge?: number }) {
  const icons: Record<string, string> = {
    Discover: "💎",
    Moments: "📸",
    Chat: "💬",
    Connect: "🤝",
    Alerts: "🔔",
  };
  return (
    <View style={{ alignItems: "center", position: "relative" }}>
      <Text style={{ fontSize: 22 }}>{icons[name] || "•"}</Text>
      {(badge ?? 0) > 0 && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -8,
            backgroundColor: "#FF3D6B",
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { data } = useNotifications();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0A0A0A",
          borderTopColor: "#1A1A1A",
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#FF3D6B",
        tabBarInactiveTintColor: "#666",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused }) => <TabIcon name="Discover" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Moments",
          tabBarIcon: ({ focused }) => <TabIcon name="Moments" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => <TabIcon name="Chat" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          title: "Connect",
          tabBarIcon: ({ focused }) => <TabIcon name="Connect" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ focused }) => <TabIcon name="Alerts" focused={focused} badge={unreadCount} />,
        }}
      />
    </Tabs>
  );
}
