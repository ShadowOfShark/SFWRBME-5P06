import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    if (!agreed) {
      Alert.alert(
        "Agreement required",
        "Please agree to the information collection terms."
      );
      return;
    }

    try {
      const user = {
        username,
        email,
        password,
        agreed,
      };

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("loggedInUser", JSON.stringify(user));

      Alert.alert("Success", "Account created successfully.");
      router.replace("/home" as Href);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save user data.");
    }
  };

  return (
    <LinearGradient
      colors={["#2563EB", "#1E6FD9", "#EAF2FF"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Start your dental wellness journey
            </Text>

            <TextInput
              placeholder="Username"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Pressable
              style={styles.checkboxRow}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the collection and storage of my information for app
                use.
              </Text>
            </Pressable>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/login" as Href)}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.link}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 26,
    shadowColor: "#1E6FD9",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    color: "#0F172A",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#F8FAFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCEAFE",
    color: "#0F172A",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#1E6FD9",
    borderRadius: 6,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#1E6FD9",
  },
  checkmark: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  checkboxText: {
    flex: 1,
    color: "#475569",
    lineHeight: 20,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#1E6FD9",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 14,
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  footerText: {
    textAlign: "center",
    color: "#64748B",
  },
  link: {
    color: "#1E6FD9",
    fontWeight: "700",
  },
});