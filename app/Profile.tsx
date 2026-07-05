import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profilePicture, setProfilePicture] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ============================
  // LOAD USER
  // ============================

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
  try {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    const parsed = JSON.parse(raw);

    // ADD THESE TWO LINES
    console.log("USER FROM ASYNC STORAGE:");
    console.log(parsed);

    setUser(parsed);

    setUsername(parsed.username || "");
    setEmail(parsed.email || "");
    setProfilePicture(parsed.profile_picture || "");
  } catch (error) {
    console.log(error);
  }
};

  // ============================
  // PICK IMAGE
  // ============================

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const image = result.assets[0].uri;
      setProfilePicture(image);
    }
  };

  // ============================
  // UPLOAD IMAGE TO SUPABASE
  // ============================

  const uploadProfilePicture = async () => {
    try {
      if (!profilePicture || profilePicture.startsWith("http")) {
        return profilePicture;
      }

      const response = await fetch(profilePicture);
      const blob = await response.blob();

      const reader = new FileReader();

      const base64: string = await new Promise((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      });

      const parts = base64.split(",");
      const base64File = parts[1];

      if (!base64File) {
        throw new Error("Invalid image data.");
      }

      // Supabase expects a binary type (Blob/ArrayBuffer/Uint8Array) here.
      const decoded = decode(base64File);
      const uint8 = new Uint8Array(decoded);

      const fileName = `profile_${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, uint8, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.log(error);

      Alert.alert("Upload Error", error.message || "Unable to upload image.");

      return profilePicture;
    }
  };

  // ============================
  // SAVE PROFILE
  // ============================

  const saveProfile = async () => {
  if (!user) {
    Alert.alert("Error", "No user loaded.");
    return;
  }

  if (!username.trim()) {
    Alert.alert("Error", "Username is required.");
    return;
  }

  setSaving(true);

  try {
    console.log("====================================");
    console.log("USER FROM ASYNC STORAGE:", user);
    console.log("USER ID:", user.id);
    console.log("USERNAME:", username);
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);
    console.log("PROFILE:", profilePicture);
    console.log("====================================");

    // Upload image if changed
    const imageUrl = await uploadProfilePicture();

    const updateData: any = {
      username: username.trim(),
      email: email.trim(),
      profile_picture: imageUrl,
    };

    if (password.trim() !== "") {
      updateData.password = password.trim();
    }

    console.log("Updating with:", updateData);

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select();

    console.log("Updated Data:", data);
    console.log("Supabase Error:", error);

    if (error) {
      Alert.alert("Update Error", error.message);
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert(
        "No rows updated",
        "The user ID does not match any record."
      );
      return;
    }

    const updatedUser = data[0];

    setUser(updatedUser);

    await AsyncStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setUsername(updatedUser.username);
    setEmail(updatedUser.email || "");
    setProfilePicture(updatedUser.profile_picture || "");
    setPassword("");

    setIsEditing(false);

    Alert.alert("Success", "Profile updated successfully!");

  } catch (e: any) {
    console.log(e);

    Alert.alert(
      "Error",
      e.message || "Something went wrong."
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              pickImage();
            }
          }}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri: profilePicture || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {isEditing && (
          <Text style={styles.changePhotoText}>Tap image to change profile picture</Text>
        )}
      </View>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        editable={isEditing}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={isEditing}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {isEditing && (
        <TextInput
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      )}

      {!isEditing ? (
        <TouchableOpacity style={styles.btn} onPress={() => setIsEditing(true)}>
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            disabled={saving}
            onPress={saveProfile}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            disabled={saving}
            onPress={() => {
              setUsername(user?.username || "");
              setEmail(user?.email || "");
              setPassword("");
              setProfilePicture(user?.profile_picture || "");
              setIsEditing(false);
            }}
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
    backgroundColor: "#FFF4E6",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
  },

  imageContainer: {
    alignItems: "center",
    marginBottom: 25,
  },

  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#FF7A00",
    backgroundColor: "#E5E5E5",
  },

  changePhotoText: {
    marginTop: 10,
    color: "#FF7A00",
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 15,
  },

  btn: {
    width: "90%",
    backgroundColor: "#FF7A00",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 15,
  },

  saveBtn: {
    flex: 1,
    backgroundColor: "#28A745",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
    elevation: 2,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#DC3545",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 10,
    elevation: 2,
  },

  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

