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
        <Image
          source={logoImage}
          style={styles.logo}
        />
        <Text style={styles.title}>Login</Text>

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