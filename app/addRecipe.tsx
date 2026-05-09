import React, { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { supabase } from "../lib/supabase";
import { RootStackParamList } from "../types/recipe";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddRecipe">;
};

export default function AddRecipe({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const fileName = `recipe-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
        });

      if (error) {
        console.log("UPLOAD ERROR:", error);
        return null;
      }

      const { data } = supabase.storage.from("recipe-images").getPublicUrl(
        fileName
      );

      return data.publicUrl;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const saveRecipe = async () => {
    if (!title || !category || !ingredients || !image) {
      Alert.alert("Please fill all fields");
      return;
    }

    const imageUrl = await uploadImage();

    const { error } = await supabase.from("recipes").insert([
      {
        title,
        category,
        ingredients,
        image: imageUrl,
      },
    ]);

    if (error) {
      console.log(error);
      Alert.alert("Failed to save recipe");
      return;
    }

    Alert.alert("Recipe Saved!");

    setTitle("");
    setCategory("");
    setIngredients("");
    setImage(null);

    // Go back to Home tab/screen
    navigation.navigate("Home");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Recipe</Text>

      <TextInput
        placeholder="Recipe Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      <TextInput
        placeholder="Ingredients"
        value={ingredients}
        onChangeText={setIngredients}
        multiline
        style={[styles.input, styles.ingredientsInput]}
      />

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Pick Image</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <TouchableOpacity style={styles.saveButton} onPress={saveRecipe}>
        <Text style={styles.saveButtonText}>Save Recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d35400",
    marginBottom: 25,
    marginTop: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },

  ingredientsInput: {
    height: 120,
    textAlignVertical: "top",
  },

  imageButton: {
    backgroundColor: "#d35400",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  imageButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    marginBottom: 20,
  },

  saveButton: {
    backgroundColor: "#e67e22",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 40,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

