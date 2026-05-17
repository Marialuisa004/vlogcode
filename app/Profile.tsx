import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export default function Profile({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (e) {
        console.log("[Profile] loadUser error", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f9980" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No profile data</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Login")}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const username = user.username ?? user?.user?.username ?? "User";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{String(username).charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{username}</Text>
        <Text style={styles.subtitle}>Profile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Account</Text>
        <Text style={styles.value}>{username}</Text>

        <TouchableOpacity
          style={[styles.button, { marginTop: 14 }]}
          onPress={() => {
            console.log("[Profile] Edit Profile pressed");
            Alert.alert("Edit Profile", "Profile editing is not implemented yet in this version.");
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logout]} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#effaf3",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#effaf3",
    padding: 16,
  },
  header: {
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#72b99e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2f6b55",
  },
  subtitle: {
    marginTop: 6,
    color: "#5a9d80",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#94c9b7",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
    marginTop: 10,
  },
  label: {
    fontWeight: "800",
    color: "#3c7d68",
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: "#3f5f54",
    fontWeight: "700",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#3c7d68",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#459c80",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  logout: {
    backgroundColor: "#44846e",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
});

