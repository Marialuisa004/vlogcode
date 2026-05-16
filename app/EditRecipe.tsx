import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function EditRecipe({ route, navigation }: any) {
  const { recipe } = route.params;

  const [title, setTitle] = useState(recipe.title);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [steps, setSteps] = useState(recipe.steps || "");
  const [category, setCategory] = useState(recipe.category);

  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert"];

  // =========================
  // UPDATE RECIPE
  // =========================
  const updateRecipe = async () => {
    if (!title || !ingredients || !steps || !category) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }

    const { error } = await supabase
      .from("recipes")
      .update({
        title,
        ingredients,
        steps,
        category,
      })
      .eq("id", recipe.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Recipe updated!");

    // go back (real-time will update Home automatically)
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.header}>Edit Recipe</Text>

      {/* TITLE */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={styles.input}
      />

      {/* INGREDIENTS */}
      <TextInput
        value={ingredients}
        onChangeText={setIngredients}
        placeholder="Ingredients"
        multiline
        style={[styles.input, { height: 100 }]}
      />

      {/* COOKING STEPS */}
      <TextInput
        value={steps}
        onChangeText={setSteps}
        placeholder="Cooking Steps"
        multiline
        style={[styles.input, { height: 120 }]}
      />

      {/* CATEGORY BUTTONS */}
      <Text style={styles.label}>Category</Text>

      <View style={styles.categoryRow}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            style={[
              styles.catBtn,
              category === item && styles.catActive,
            ]}
          >
            <Text style={{ color: category === item ? "#fff" : "#333" }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.saveBtn} onPress={updateRecipe}>
        <Text style={styles.saveText}>Update Recipe</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    padding: 15,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },

  catBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ddd",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  catActive: {
    backgroundColor: "#ff6347",
  },

  saveBtn: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});