import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ResourceCardProps = {
  number: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  learnMore?: string;
};

function ResourceCard({
  number,
  title,
  subtitle,
  bullets,
  learnMore,
}: ResourceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberBadgeText}>{number}</Text>
        </View>
        <View style={styles.cardHeaderTextWrap}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.bulletList}>
        {bullets.map((bullet, index) => (
          <View key={index} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
      </View>

      {learnMore ? (
        <View style={styles.learnMoreBox}>
          <Text style={styles.learnMoreLabel}>Learn More</Text>
          <Text style={styles.learnMoreText}>{learnMore}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function EducationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Educational resources</Text>
          <Text style={styles.heroTitle}>Maintain Your Oral Health</Text>
          <Text style={styles.heroSubtitle}>
            Good oral health starts with small daily habits. These resources
            summarize practical ways to care for your teeth and gums between
            dental visits.
          </Text>
        </View>

        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>Important note</Text>
          <Text style={styles.infoBannerText}>
            This page is for general education only and does not replace advice,
            diagnosis, or treatment from a licensed dental professional.
          </Text>
        </View>

        <ResourceCard
          number="1"
          title="The 2×2 Brushing Rule"
          subtitle="The foundation of a healthy mouth is brushing for two minutes, two times a day."
          bullets={[
            "Brush every morning and every night for a full two minutes.",
            "Place your toothbrush at a 45-degree angle to your gums.",
            "Move the brush gently using short, back-and-forth strokes.",
            "Brush the outer surfaces, inner surfaces, and chewing surfaces of all teeth.",
            "Use a fluoride toothpaste to help protect enamel and support remineralization.",
          ]}
          learnMore="ADA Guide to Brushing"
        />

        <ResourceCard
          number="2"
          title="Flossing Is Not Optional"
          subtitle="Your toothbrush cannot fully clean the tight spaces between your teeth."
          bullets={[
            "If you do not clean between your teeth, a large portion of tooth surfaces remains uncleaned.",
            "Use about 18 inches of floss wrapped around your middle fingers.",
            "Gently guide the floss between your teeth without snapping it into the gums.",
            'Curve the floss into a “C” shape against the side of each tooth and move it up and down gently.',
            "If regular floss is difficult to use, consider a water flosser or interdental brush.",
          ]}
          learnMore="ADA Guide to Flossing"
        />

        <ResourceCard
          number="3"
          title="Diet and Hydration"
          subtitle="What you eat and drink affects your oral health every day."
          bullets={[
            "Limit frequent snacking on sugary or starchy foods.",
            "After sugary foods or drinks, bacteria in the mouth can produce acids that affect the teeth.",
            "Frequent sipping or grazing can keep your teeth under repeated acid exposure.",
            "Drink water regularly to help rinse away food debris.",
            "Tap water with fluoride can support oral health and help protect enamel.",
          ]}
          learnMore="ADA Diet and Dental Health"
        />

        <ResourceCard
          number="4"
          title="The 6-Month Checkup"
          subtitle="Do not wait until pain appears before seeing a dentist."
          bullets={[
            "Routine dental visits can help identify early decay before it becomes more serious.",
            "Regular exams may include screening for gum disease and other oral health concerns.",
            "Professional cleanings help remove tartar buildup that cannot be removed by brushing alone.",
            "Seeing a dentist every 6 months can support long-term prevention and maintenance.",
          ]}
        />

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Healthy habits matter</Text>
          <Text style={styles.footerText}>
            Brushing, flossing, hydration, diet, and regular dental visits work
            together. Even small improvements in daily habits can make a big
            difference over time.
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
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  topBar: {
    marginBottom: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  eyebrow: {
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
  infoBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 6,
  },
  infoBannerText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#1E40AF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  numberBadgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  cardHeaderTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
  bulletList: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2563EB",
    marginTop: 8,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: "#1E293B",
  },
  learnMoreBox: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  learnMoreLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#2563EB",
    marginBottom: 4,
  },
  learnMoreText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
    fontWeight: "600",
  },
  footerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  footerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
});