import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#DCEAFE',
          height: 82,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#1E6FD9',
        tabBarInactiveTintColor: '#7B8AA0',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarLabel: 'Results',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="new_scan"
        options={{
          title: 'New Scan',
          tabBarLabel: '',
          tabBarIcon: () => null,
          tabBarButton: ({ onPress }) => (
            <Pressable onPress={onPress} style={styles.centerButton}>
              <View style={styles.plusCircle}>
                <Ionicons name="add" size={34} color="#FFFFFF" />
              </View>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E6FD9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E6FD9',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});