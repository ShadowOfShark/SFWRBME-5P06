import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

function GuidelineCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

export default function PhotoGuidelinesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Photo taking help</Text>
          <Text style={styles.heroTitle}>How to take a good photo</Text>
          <Text style={styles.heroSubtitle}>
            Follow these tips to capture a clearer photo of your teeth using your phone.
          </Text>
        </View>

        <GuidelineCard
          title="Use bright, even lighting"
          body="Stand facing a bright light source or use a well-lit bathroom mirror. Avoid dim lighting, harsh shadows, and strong backlighting."
        />

        <GuidelineCard
          title="Keep the image in focus"
          body="Hold the phone steady and wait for the camera to focus before taking the picture. Retake the image if it looks blurry."
        />

        <GuidelineCard
          title="Center your teeth in the frame"
          body="Move close enough so the front teeth and gumline are clearly visible, but not so close that the image becomes out of focus."
        />

        <GuidelineCard
          title="Show teeth and gums clearly"
          body="Pull your lips back gently and open enough to show the front teeth and gumline. Keep the camera straight instead of tilted."
        />

        <GuidelineCard
          title="Avoid glare and obstructions"
          body="Make sure there is no heavy reflection, lip obstruction, or anything covering the teeth."
        />

        <GuidelineCard
          title="Clean the camera lens"
          body="Wipe your phone camera lens before taking the photo. A smudged lens can make the image look hazy or low contrast."
        />

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Quick checklist</Text>
          <Text style={styles.tipItem}>• Bright lighting</Text>
          <Text style={styles.tipItem}>• Teeth centered</Text>
          <Text style={styles.tipItem}>• In focus</Text>
          <Text style={styles.tipItem}>• Gumline visible</Text>
          <Text style={styles.tipItem}>• Minimal glare</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Back</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#2563EB",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  tipCard: {
    backgroundColor: "#EAF2FF",
    borderRadius: 20,
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1746A2",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 15,
    lineHeight: 24,
    color: "#1746A2",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});