import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy & Security</Text>

        {/* Overview */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.text}>
            This application is designed as a clinical support and screening
            tool. We follow Canadian regulatory expectations and internationally
            recognized medical software standards to ensure that your personal
            and health-related data is handled securely and responsibly.
          </Text>
        </View>

        {/* Data Collection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What We Collect</Text>
          <Text style={styles.text}>
            We collect only the minimum data required to provide your oral
            health assessment:
          </Text>
          <Text style={styles.bullet}>• Dental images you upload</Text>
          <Text style={styles.bullet}>• Questionnaire responses</Text>
          <Text style={styles.bullet}>• Basic account information</Text>
        </View>

        {/* Data Usage */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How Your Data Is Used</Text>
          <Text style={styles.text}>
            Your data is used solely to generate personalized oral health risk
            assessments and recommendations. We do not sell or share your
            personal health information with third parties for marketing
            purposes.
          </Text>
        </View>

        {/* Privacy Laws */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Privacy Compliance</Text>
          <Text style={styles.text}>
            This application is designed to align with Canadian privacy laws,
            including:
          </Text>
          <Text style={styles.bullet}>
            • PIPEDA – Personal Information Protection and Electronic Documents
            Act
          </Text>
          <Text style={styles.bullet}>
            • PHIPA – Ontario Personal Health Information Protection Act
          </Text>
          <Text style={styles.text}>
            These frameworks ensure accountability, consent, and secure handling
            of personal health data.
          </Text>
        </View>

        {/* Security */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Security Practices</Text>
          <Text style={styles.text}>
            We follow industry best practices based on Canadian cybersecurity
            guidance:
          </Text>
          <Text style={styles.bullet}>
            • Secure data storage and controlled access
          </Text>
          <Text style={styles.bullet}>
            • Encryption during data transmission
          </Text>
          <Text style={styles.bullet}>
            • Local data isolation on device when possible
          </Text>
        </View>

        {/* Medical Device Standards */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Medical Software Standards</Text>
          <Text style={styles.text}>
            This system is designed with reference to recognized medical device
            software standards:
          </Text>
          <Text style={styles.bullet}>
            • ISO 14971 – Risk Management for Medical Devices
          </Text>
          <Text style={styles.bullet}>
            • IEC 62304 – Medical Device Software Lifecycle
          </Text>
          <Text style={styles.bullet}>• IEC 62366 – Usability Engineering</Text>
          <Text style={styles.text}>
            These standards guide safe design, validation, and usability.
          </Text>
        </View>

        {/* SaMD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Software as a Medical Device</Text>
          <Text style={styles.text}>
            This application follows Health Canada guidance for Software as a
            Medical Device (SaMD), ensuring that risk classification and
            intended use are clearly defined.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Medical Disclaimer</Text>
          <Text style={styles.text}>
            This application provides risk assessments only and is not a
            substitute for professional diagnosis or treatment. Always consult a
            licensed dental professional.
          </Text>
        </View>

        {/* User Control */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Control</Text>
          <Text style={styles.text}>
            You can reset the application at any time to remove stored data from
            your device.
          </Text>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    color: "#0F172A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E3ECF7",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1746A2",
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
    marginLeft: 6,
  },
});
