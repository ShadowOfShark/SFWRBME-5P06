import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, type Href, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

const MIN_PASSWORD_LENGTH = 8;
const TERMS_VIEWED_KEY = "termsViewed";

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
  "letmein",
  "admin123",
]);

function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }

  if (password.length > 64) {
    return "Password must be 64 characters or fewer.";
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "Please choose a stronger password.";
  }

  return null;
}

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [hasViewedTerms, setHasViewedTerms] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadTermsStatus = async () => {
        try {
          const viewed = await AsyncStorage.getItem(TERMS_VIEWED_KEY);
          setHasViewedTerms(viewed === "true");
        } catch (error) {
          console.error("Failed to load terms status:", error);
        }
      };

      loadTermsStatus();
    }, [])
  );

  const passwordError = useMemo(() => {
    if (!password) return "";
    return validatePassword(password) ?? "";
  }, [password]);

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  const openTerms = () => {
    router.push("/terms" as Href);
  };

  const handleCheckboxPress = () => {
    if (!hasViewedTerms) {
      Alert.alert(
        "Read Terms Required",
        "Please open and review the Terms & Privacy page before agreeing."
      );
      return;
    }

    setAgreed((prev) => !prev);
  };

  const handleSignup = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    const passwordValidationMessage = validatePassword(password);
    if (passwordValidationMessage) {
      Alert.alert("Weak password", passwordValidationMessage);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    if (!hasViewedTerms) {
      Alert.alert(
        "Terms not opened",
        "Please open and read the Terms & Privacy page before continuing."
      );
      return;
    }

    if (!agreed) {
      Alert.alert(
        "Agreement required",
        "Please confirm that you agree to the Terms & Privacy Policy."
      );
      return;
    }

    try {
      const user = {
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        agreed,
        termsViewed: hasViewedTerms,
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
              autoCapitalize="words"
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {!!password && (
              <Text style={passwordError ? styles.helperError : styles.helperText}>
                {passwordError ||
                  "Password looks good. Use 8+ characters; longer is better."}
              </Text>
            )}

            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#94A3B8"
              style={[
                styles.input,
                confirmPassword.length > 0 && !passwordsMatch && styles.inputError,
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {confirmPassword.length > 0 && !passwordsMatch && (
              <Text style={styles.helperError}>Passwords do not match.</Text>
            )}

            <View style={styles.termsBlock}>
              <Text style={styles.termsLead}>
                Please review our{" "}
                <Text style={styles.linkInline} onPress={openTerms}>
                  Terms & Privacy Policy
                </Text>{" "}
                before creating an account.
              </Text>

              <Pressable style={styles.checkboxRow} onPress={handleCheckboxPress}>
                <View
                  style={[
                    styles.checkbox,
                    !hasViewedTerms && styles.checkboxDisabled,
                    agreed && styles.checkboxChecked,
                  ]}
                >
                  {agreed && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <Text style={styles.checkboxText}>
                  I have read and agree to the Terms & Privacy Policy, including
                  the collection and handling of personal and health-related data.
                </Text>
              </Pressable>

              {!hasViewedTerms && (
                <Text style={styles.helperError}>
                  You must open the Terms & Privacy Policy before checking the box.
                </Text>
              )}

              {hasViewedTerms && !agreed && (
                <Text style={styles.helperText}>
                  Terms page reviewed. You can now confirm your agreement.
                </Text>
              )}
            </View>

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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DCEAFE",
    color: "#0F172A",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  helperText: {
    marginBottom: 12,
    marginLeft: 4,
    color: "#475569",
    fontSize: 13,
    lineHeight: 18,
  },
  helperError: {
    marginBottom: 12,
    marginLeft: 4,
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 18,
  },
  termsBlock: {
    marginTop: 4,
    marginBottom: 10,
  },
  termsLead: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  linkInline: {
    color: "#1E6FD9",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    marginTop: 2,
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
  checkboxDisabled: {
    borderColor: "#CBD5E1",
    backgroundColor: "#F1F5F9",
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
    marginTop: 4,
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