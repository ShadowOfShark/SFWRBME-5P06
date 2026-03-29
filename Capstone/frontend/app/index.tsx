import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        const loggedInUser = await AsyncStorage.getItem("loggedInUser");

        if (loggedInUser) {
          router.replace("/home" as Href);
        } else if (!hasLaunched) {
          await AsyncStorage.setItem("hasLaunched", "true");
          router.replace("/landing" as Href);
        } else {
          router.replace("/login" as Href);
        }
      } catch (error) {
        console.error("Error checking app launch status:", error);
        router.replace("/landing" as Href);
      }
    };

    checkFirstLaunch();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}