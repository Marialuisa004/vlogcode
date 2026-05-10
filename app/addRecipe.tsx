import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

export default function AddRecipe({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [image, setImage] = useState<string | null>(null);

  // =========================
  // PICK IMAGE
  // =========================
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // =========================
  // SAVE RECIPE
  // =========================
  const saveRecipe = async () => {
    if (!title || !ingredients || !image) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const { error } = await supabase.from("recipes").insert([
      {
        title,
        ingredients,
        category, // ✅ CATEGORY SAVED HERE
        image,
      },
    ]);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Recipe added!");
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.label}>Recipe Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Title:"
      />

      <Text style={styles.label}>Ingredients</Text>
      <TextInput
        value={ingredients}
        onChangeText={setIngredients}
        style={[styles.input, { height: 100 }]}
        placeholder="Ingredients:"
        multiline
      />

      {/* =========================
          CATEGORY SELECTOR
      ========================= */}
      <Text style={styles.label}>Select Category</Text>

      <View style={styles.categoryContainer}>
        {["Breakfast", "Lunch", "Dessert"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            style={[
              styles.categoryButton,
              category === item && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={{
                color: category === item ? "#fff" : "#333",
                fontWeight: "bold",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* =========================
          IMAGE PICKER
      ========================= */}
      <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
        <Text style={{ color: "#fff" }}>Pick Image</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* =========================
          SAVE BUTTON
      ========================= */}
      <TouchableOpacity onPress={saveRecipe} style={styles.saveBtn}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Save Recipe</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#f6f6f6",
    flexGrow: 1,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  categoryButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    alignItems: "center",
  },

  categoryButtonActive: {
    backgroundColor: "#ff6347",
  },

  imageBtn: {
    backgroundColor: "#4a90e2",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});