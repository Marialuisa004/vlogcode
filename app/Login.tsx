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
  onLogin: () => void;
  onGoToRegister: () => void;
};

export default function Login({
  onLogin,
  onGoToRegister,
}: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);

    if (!username || !password) {
      Alert.alert('Error', 'Fill all fields');
      setLoading(false);
      return;
    }

    try {
      // find email using username
      const { data, error: userError } =
        await supabase
          .from('users')
          .select('email')
          .eq('username', username)
          .single();

      if (userError || !data) {
        Alert.alert('Error', 'Username not found');
        setLoading(false);
        return;
      }

      // login using supabase auth
      const { error } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password,
        });

      if (error) {
        Alert.alert('Login Failed', error.message);
        setLoading(false);
        return;
      }

      Alert.alert('Success', 'Logged in successfully');
      onLogin();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🍲 Recipe App Login
      </Text>

      {/* USERNAME */}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      {/* PASSWORD */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* LOGIN BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.text}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* GO TO REGISTER */}
      <TouchableOpacity
        onPress={onGoToRegister}
        disabled={loading}
      >
        <Text style={styles.toggle}>
          No account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 30,
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