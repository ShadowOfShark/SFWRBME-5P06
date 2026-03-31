import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NewScreen() {
  const goToQuestionnaire = (uri: string) => {
    router.push({
      pathname: "/questionnaire",
      params: { imageUri: uri },
    });
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera permission required",
          "We need camera access so you can take a photo of your teeth."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        goToQuestionnaire(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to open camera.");
    }
  };

  const handlePickFromLibrary = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo permission required",
          "We need access only to the photo you choose."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        goToQuestionnaire(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to open library.");
    }
  };

  const handleOpenGuidelines = () => {
    router.push("/guidelines");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Start a New Screening</Text>

        <Text style={styles.subtitle}>
          Capture or upload a photo, then complete the questionnaire.
        </Text>

        <Text style={styles.privacyText}>
          Only your selected image will be used for analysis.
        </Text>

        <View style={styles.placeholderBox}>
          <Ionicons name="image-outline" size={36} color="#7A8CA8" />
          <Text style={styles.placeholderText}>
            Choose one image to continue
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard} onPress={handleTakePhoto}>
            <Ionicons name="camera" size={26} color="#1E6FD9" />
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handlePickFromLibrary}
          >
            <Ionicons name="images-outline" size={26} color="#1E6FD9" />
            <Text style={styles.actionText}>Library</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.guidelinesButton}
          onPress={handleOpenGuidelines}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#1746A2"
          />
          <Text style={styles.guidelinesButtonText}>Photo Guidelines</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#5A6B85",
    textAlign: "center",
    marginBottom: 6,
  },
  privacyText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  placeholderBox: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    marginTop: 8,
    color: "#7A8CA8",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E3ECF7",
  },
  actionText: {
    marginTop: 6,
    fontWeight: "600",
    color: "#1E6FD9",
  },
  guidelinesButton: {
    backgroundColor: "#EAF2FF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  guidelinesButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1746A2",
  },
});