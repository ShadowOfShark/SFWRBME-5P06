import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, type Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');

      if (!storedUser) {
        Alert.alert('No account found', 'Please sign up first.');
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.email === email && parsedUser.password === password) {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(parsedUser));
        router.replace('/home' as Href);
      } else {
        Alert.alert('Login failed', 'Incorrect email or password.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not log in.');
    }
  };

  return (
    <LinearGradient
      colors={['#2563EB', '#1E6FD9', '#EAF2FF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>

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

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup' as Href)}>
            <Text style={styles.footerText}>
              New here? <Text style={styles.link}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 26,
    shadowColor: '#1E6FD9',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    color: '#0F172A',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F8FAFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCEAFE',
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#1E6FD9', // matches tabs
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#64748B',
  },
  link: {
    color: '#1E6FD9',
    fontWeight: '700',
  },
});