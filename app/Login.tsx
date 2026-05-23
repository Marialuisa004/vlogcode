import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { Image } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

const bgImage = require("../assets/image.png");
const logoImage = require("../assets/logo.png");

export default function Login({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    console.log("Login button clicked");

    if (!username || !password) {
      console.log("Missing username or password");

      Alert.alert("Error", "Fill all fields");
      return;
    }

    console.log("Username:", username);
    console.log("Password:", password);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    console.log("Supabase response data:", data);
    console.log("Supabase response error:", error);

    if (error || !data) {
      console.log("Invalid credentials");

      Alert.alert("Error", "Invalid credentials");
      return;
    }

    console.log("Login success");

    await AsyncStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    console.log("User saved to AsyncStorage");

    navigation.replace("Main");
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
        <View style={styles.cardTop} />
        <Image
          source={logoImage}
          style={styles.logo}
        />
        <Text style={styles.title}>TasteList</Text>


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

        <TouchableOpacity
          style={styles.button}
          onPress={login}
        >
          <Text style={styles.buttonText}>
            Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.link}>
            Create New Account
          </Text>
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
    width: "100%",
    height: "100%",
    backgroundColor: "#FFF4E6",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },

  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },

  cardTop: {
    position: "absolute",
    top: -40,
    left: 0,
    right: 0,
    height: 0,
  },

  backgroundImage: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#4B3248",
  },

  input: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFD6B0",
  },

  placeholder: {
    color: "#9CA3AF",
  },

  button: {
    backgroundColor: "#FF7A00",

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