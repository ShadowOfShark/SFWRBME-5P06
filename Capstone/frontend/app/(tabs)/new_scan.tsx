import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function NewScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
    }
  };

  const handleContinue = () => {
    if (!imageUri) {
      Alert.alert('No image selected', 'Please take a photo first.');
      return;
    }

    router.push({
      pathname: '/questionnaire',
      params: { imageUri },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="camera-outline" size={30} color="#1E6FD9" />
        </View>

        <Text style={styles.title}>Start a New Screening</Text>
        <Text style={styles.subtitle}>
          Take a photo first, then complete the questionnaire to assess oral
          health risk.
        </Text>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleTakePhoto}>
          <Text style={styles.primaryButtonText}>
            {imageUri ? 'Retake Photo' : 'Take Photo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, !imageUri && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!imageUri}
        >
          <Text style={styles.secondaryButtonText}>Continue to Questionnaire</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FF',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5A6B85',
    textAlign: 'center',
    marginBottom: 22,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#1E6FD9',
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 16,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#EAF2FF',
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#1E6FD9',
    fontSize: 17,
    fontWeight: '700',
  },
});