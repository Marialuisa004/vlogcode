import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { supabase } from '../lib/supabase';

type Props = {
  onBackToLogin: () => void;
};

export default function Register({
  onBackToLogin,
}: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // ---------------- REGISTER ----------------
  const handleRegister = async () => {
    if (loading) return; // prevent double click

    setLoading(true);

    // validation
    if (!username || !email || !password) {
      Alert.alert('Error', 'Fill all fields');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Invalid email');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Error',
        'Password must be at least 6 characters'
      );
      setLoading(false);
      return;
    }

    try {
      // 1. CREATE AUTH USER
      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (error) {
        Alert.alert(
          'Signup Failed',
          error.message
        );
        setLoading(false);
        return;
      }

      // 2. SAVE USER PROFILE
      const { error: insertError } =
        await supabase.from('users').insert({
          id: data.user?.id,
          email,
          username,
        });

      if (insertError) {
        Alert.alert(
          'Database Error',
          insertError.message
        );
        setLoading(false);
        return;
      }

      // ---------------- SUCCESS ----------------
      Alert.alert(
        '🎉 Success',
        'Successfully registered!'
      );

      // reset fields
      setUsername('');
      setEmail('');
      setPassword('');

      // wait before going back to login
      setTimeout(() => {
        onBackToLogin();
      }, 1200);
    } catch (err: any) {
      Alert.alert(
        'Unexpected Error',
        err.message
      );
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🍲 Create Account
      </Text>

      {/* USERNAME */}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      {/* PASSWORD */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* REGISTER BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.text}>
          {loading
            ? 'Creating account...'
            : 'Register'}
        </Text>
      </TouchableOpacity>

      {/* BACK TO LOGIN */}
      <TouchableOpacity
        onPress={onBackToLogin}
        disabled={loading}
      >
        <Text style={styles.toggle}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  text: {
    color: 'white',
    fontWeight: 'bold',
  },

  toggle: {
    textAlign: 'center',
    marginTop: 10,
    color: 'blue',
  },
});