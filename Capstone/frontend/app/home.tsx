import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("loggedInUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUsername(parsed.username || "User");
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  const handleGetStarted = () => {
    router.replace("/(tabs)" as Href);
  };

  return (
    <LinearGradient
      colors={["#2563EB", "#38BDF8", "#E0F2FE"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.topShape} />
          <View style={styles.bottomShape} />

          <View style={styles.card}>
            <Text style={styles.title}>Welcome, {username}!</Text>
            <Text style={styles.subtitle}>
              Your account is ready. Let&apos;s begin your dental health
              check-in journey.
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
              <Text style={styles.buttonText}>Let&apos;s Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  topShape: {
    position: "absolute",
    top: 60,
    left: -60,
    width: 220,
    height: 220,
    backgroundColor: "rgba(255,255,255,0.14)",
    transform: [{ rotate: "25deg" }],
    borderRadius: 32,
  },
  bottomShape: {
    position: "absolute",
    bottom: 40,
    right: -70,
    width: 220,
    height: 220,
    backgroundColor: "rgba(255,255,255,0.16)",
    transform: [{ rotate: "-20deg" }],
    borderRadius: 32,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 14,
    textAlign: "center",
    color: "#0F172A",
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    paddingHorizontal: 34,
    borderRadius: 999,
    minWidth: 220,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
