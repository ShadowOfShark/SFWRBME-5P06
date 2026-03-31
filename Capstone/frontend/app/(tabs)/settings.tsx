import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showBorder?: boolean;
};

function MenuRow({ icon, label, onPress, showBorder = true }: MenuRowProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !showBorder && styles.menuItemNoBorder]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={22} color="#1E6FD9" />
        <Text style={styles.menuText}>{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#9AA7B8" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [username, setUsername] = useState("User");
  const [email, setEmail] = useState("user@example.com");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("loggedInUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUsername(parsed.username || "User");
          setEmail(parsed.email || "user@example.com");
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  const handleResetApp = async () => {
    try {
      await AsyncStorage.multiRemove([
        "hasLaunched",
        "loggedInUser",
        "user",
        "scanHistory",
      ]);

      Alert.alert(
        "Reset complete",
        "All demo data, including scan history, has been cleared.",
      );
    } catch (error) {
      console.error("Reset error:", error);
      Alert.alert("Error", "Could not reset app state.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={34} color="#1E6FD9" />
          </View>
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.menuCard}>
          <MenuRow
            icon="person-circle-outline"
            label="Profile Information"
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "Profile information editing is not available yet.",
              )
            }
          />

          <MenuRow
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            onPress={() => router.push("/privacy")}
          />

          <MenuRow
            icon="book-outline"
            label="Educational Resources"
            onPress={() => router.push("/education")}
          />

          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "Notification settings are not available yet.",
              )
            }
          />

          <MenuRow
            icon="help-circle-outline"
            label="Help & Support"
            showBorder={false}
            onPress={() =>
              Alert.alert(
                "Help & Support",
                "For support, please contact your project team or supervisor.",
              )
            }
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>App Version 1.0</Text>

          {__DEV__ && (
            <TouchableOpacity onPress={handleResetApp}>
              <Text style={styles.resetText}>Reset Demo State</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FF",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#EAF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6B7A90",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF4FF",
  },
  menuItemNoBorder: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    color: "#12304F",
    fontWeight: "600",
    marginLeft: 12,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9AA7B8",
    marginBottom: 10,
  },
  resetText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "600",
  },
});
