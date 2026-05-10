import React, { useState } from "react";
import {
  SafeAreaView,
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

  const saveRecipe = async () => {
    if (!title || !ingredients || !image) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const { error } = await supabase.from("recipes").insert([
      {
        title,
        ingredients,
        category,
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.label}>Recipe Title</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Enter recipe title"
        />

        <Text style={styles.label}>Ingredients</Text>

        <TextInput
          value={ingredients}
          onChangeText={setIngredients}
          style={[styles.input, styles.ingredientsInput]}
          placeholder="Enter ingredients"
          multiline
        />

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

        <TouchableOpacity
          style={styles.imageButton}
          onPress={pickImage}
        >
          <Text style={styles.imageButtonText}>
            Pick Image
          </Text>
        </TouchableOpacity>

        {image && (
          <Image source={{ uri: image }} style={styles.image} />
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveRecipe}
        >
          <Text style={styles.saveButtonText}>
            Save Recipe
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },

  container: {
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 220,
    bottom: 90,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  ingredientsInput: {
    height: 120,
    textAlignVertical: "top",
  },

  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  categoryButton: {
    flex: 1,
    backgroundColor: "#e5e5e5",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
  },

  categoryButtonActive: {
    backgroundColor: "#ff6347",
  },

  imageButton: {
    backgroundColor: "#4a90e2",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },

  imageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    marginBottom: 20,
  },

 saveButton: {
  backgroundColor: "#ff6347",
  padding: 18,
  borderRadius: 14,
  alignItems: "center",
  marginTop: 20,
  marginBottom: 80,
},

  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});