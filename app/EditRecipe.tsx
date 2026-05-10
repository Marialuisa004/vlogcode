import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function EditRecipe({ route, navigation }: any) {
  const { recipe } = route.params;

  const [title, setTitle] = useState(recipe.title);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [category, setCategory] = useState(recipe.category);

  const updateRecipe = async () => {
    const { error } = await supabase
      .from("recipes")
      .update({
        title,
        ingredients,
        category,
      })
      .eq("id", recipe.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Recipe updated!");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Edit Recipe ✏️</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Ingredients"
        value={ingredients}
        onChangeText={setIngredients}
        style={styles.input}
        multiline
      />

      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      <TouchableOpacity onPress={updateRecipe} style={styles.button}>
        <Text style={styles.buttonText}>Update Recipe</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    padding: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  button: {
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});