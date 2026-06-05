import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔄 LOAD USER
  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("user");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setUser(parsed);

      setUsername(parsed.username);
      setEmail(parsed.email);
    };

    load();
  }, []);

  // 💾 SAVE PROFILE (FIXED)
  const saveProfile = async () => {
    if (!username || !email) {
      Alert.alert("Error", "Username and email required");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          email,
        })
        .eq("id", user.id);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      // OPTIONAL PASSWORD UPDATE
      if (password.length > 0) {
        const { error: passError } = await supabase.auth.updateUser({
          password,
        });

        if (passError) {
          Alert.alert("Password Error", passError.message);
          return;
        }
      }

      // update local storage
      const updatedUser = {
        ...user,
        username,
        email,
      };

      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      setPassword("");

      Alert.alert("Success", "Profile updated!");

    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }

    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {/* USERNAME */}
      <TextInput
        placeholder="Name"
        value={username}
        onChangeText={setUsername}
        editable={isEditing}
        style={styles.input}
      />

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={isEditing}
        style={styles.input}
      />

      {/* PASSWORD */}
      {isEditing && (
        <TextInput
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      )}

      {/* BUTTONS */}
      {!isEditing ? (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.row}>
          
          {/* ✅ FIXED SAVE BUTTON */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={saveProfile}   // 🔥 FIXED HERE
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Save</Text>
            )}
          </TouchableOpacity>

          {/* CANCEL */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setIsEditing(false);
              setPassword("");
            }}
            disabled={saving}
          >
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#FFF4E6",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },

  input: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  btn: {
    marginTop: 25,
    backgroundColor: "#FF7A00",
    padding: 15,
    borderRadius: 12,
    width: "85%",
    alignItems: "center",
  },

  saveBtn: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 12,
    width: "40%",
    alignItems: "center",
  },

  cancelBtn: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 12,
    width: "40%",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginTop: 15,
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
});