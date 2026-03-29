import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="add" size={30} color="#1E6FD9" />
        </View>

        <Text style={styles.title}>Start a New Screening</Text>
        <Text style={styles.subtitle}>
          Begin a new scan or questionnaire to assess oral health risk.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/questionnaire')}
        >
          <Text style={styles.primaryButtonText}>Open Questionnaire</Text>
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
  primaryButton: {
    backgroundColor: '#1E6FD9',
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});