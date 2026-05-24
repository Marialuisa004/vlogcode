import React, { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Animated,
} from "react-native";


import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const bgImage = require("../assets/image.png");
const logoImage = require("../assets/logo.png");

export default function Register({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = () => {
      logoAnim.setValue(0);
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),

      ]).start(() => bounce());
    };

    bounce();
    return () => {
      logoAnim.stopAnimation();
    };
  }, [logoAnim]);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.08],
  });

  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 0],
  });


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
      {/* SOFT OVERLAY */}
      <View style={styles.overlay} />

      {/* MAIN CARD */}
      <View style={styles.inner}>
        {/* LOGO */}
        <View style={styles.logoCircle}>
          <Animated.View
            style={{
              opacity: logoAnim,
              transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
            }}
          >
            <Image source={logoImage} style={styles.logo} />
          </Animated.View>
        </View>


        {/* TITLE */}
        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Start saving your delicious recipes 🍳
        </Text>

        {/* USERNAME */}
        <Text style={styles.label}>Username</Text>

        <TextInput
          placeholder="Enter username"
          placeholderTextColor="#9CA3AF"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        {/* PASSWORD */}
        <Text style={styles.label}>Password</Text>

        <TextInput
          placeholder="Enter password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={register}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            Register
          </Text>
        </TouchableOpacity>

        {/* LOGIN LINK */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Login")
          }
        >
          <Text style={styles.link}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  /* MAIN CONTAINER */
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFF4E6",
  },


  /* DARK OVERLAY */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },


  /* MAIN CARD */
  inner: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 30,
    padding: 28,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  /* BACKGROUND IMAGE */
  backgroundImage: {
    width: "100%",
    height: "100%",
  },


  /* LOGO CIRCLE */
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,

    backgroundColor: "#FFF4E6",

    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center",

    marginBottom: 18,

    borderWidth: 3,
    borderColor: "#FF7A00",
  },

  /* LOGO */
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },

  /* TITLE */
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#4B3248",
    marginBottom: 8,
  },

  /* SUBTITLE */
  subtitle: {
    textAlign: "center",
    color: "#4F9980",
    marginBottom: 28,
    fontSize: 15,
    fontWeight: "600",
  },

  /* LABELS */
  label: {
    color: "#4B3248",
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },

  /* INPUT */
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FFD6B0",

    paddingHorizontal: 16,
    height: 55,

    borderRadius: 18,

    marginBottom: 18,

    fontSize: 15,
    color: "#4B3248",
  },

  /* REGISTER BUTTON */
  button: {
    backgroundColor: "#FF7A00",

    height: 55,

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 8,

    shadowColor: "#FF7A00",
    shadowOpacity: 0.3,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  /* BUTTON TEXT */
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  /* LOGIN LINK */
  link: {
    textAlign: "center",
    marginTop: 22,

    color: "#4F9980",

    fontWeight: "700",
    fontSize: 14,
  },
});