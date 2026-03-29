import { router, type Href } from "expo-router";
import {
        Image,
        SafeAreaView,
        StyleSheet,
        Text,
        TouchableOpacity,
        View,
} from "react-native";

export default function LandingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroContainer}>
        <Image
          source={require("../assets/images/landing-teeth.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* <LinearGradient
          colors={['transparent', '#FFFFFF']}
          style={styles.fade}
        /> */}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Take control of your oral health.</Text>

        <Text style={styles.subtitle}>
          Capture dental images, complete guided check-ins, and monitor your
          oral health with confidence — all from your phone.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/signup" as Href)}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login" as Href)}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.link}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const PRIMARY = "#2563EB";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  heroContainer: {
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: 340,
  },

  fade: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 90,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#60A5FA",
    marginBottom: 14,
    lineHeight: 34,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 24,
    marginBottom: 30,
  },

  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: PRIMARY,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  footerText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
  },

  link: {
    color: PRIMARY,
    fontWeight: "700",
  },
});
