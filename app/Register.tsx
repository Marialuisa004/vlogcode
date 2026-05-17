import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";

import { supabase } from "../lib/supabase";

import AsyncStorage from "@react-native-async-storage/async-storage";

const bgImage = require("../assets/image.png");
const logoImage = require("../assets/logo.png");

async function registerImageToSupabase() {
  // Expo web can’t upload bundled require() assets directly.
  // Instead, create a fetchable URL for the local bundled asset.
  const asset = require("../assets/image.png");
  const localUri = (typeof asset === "string" ? asset : (asset as any)?.uri) || asset;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const fileName = `avatar-${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, blob, { contentType: "image/png" });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("recipe-images").getPublicUrl(fileName);
  return data.publicUrl as string;
}


export default function Register({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    const { error } = await supabase.from("users").insert([
      {
        username,
        password,
      },
    ]);

    if (error) {
      Alert.alert("Error", "Username already exists");
      return;
    }

    Alert.alert("Success", "Account created");
    navigation.navigate("Login");
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.inner}>
        {/* Circle Logo */}
        <View style={styles.logoCircle}>
          <Image source={logoImage} style={styles.logo} />
        </View>
        <Text style={styles.title}>Register</Text>


        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={register}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account?</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },

  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },

  backgroundImage: {
    opacity: 1,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    resizeMode: "contain",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#ff6347",
  },

  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#4a90e2",
    fontWeight: "bold",
  },
});

