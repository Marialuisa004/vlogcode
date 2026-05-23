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

  const updateRecipe = async () => {
    if (!title || !ingredients || !steps || !category) {
      Alert.alert("Missing Fields");
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

    Alert.alert("Success", "Recipe updated");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Recipe</Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={styles.input}
      />

      <TextInput
        value={ingredients}
        onChangeText={setIngredients}
        placeholder="Ingredients"
        multiline
        style={[styles.input, { height: 100 }]}
      />

      <TextInput
        value={steps}
        onChangeText={setSteps}
        placeholder="Cooking Steps"
        multiline
        style={[styles.input, { height: 120 }]}
      />

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
            <Text
              style={{
                color: category === item ? "#fff" : "#333",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", marginTop: 10 }}>

  {/* UPDATE BUTTON */}
  <TouchableOpacity
    style={[styles.saveBtn, { flex: 1, marginRight: 8 }]}
    onPress={updateRecipe}
  >
    <Text style={styles.saveText}>Update Recipe</Text>
  </TouchableOpacity>

  {/* CANCEL BUTTON */}
  <TouchableOpacity
    style={[
      styles.deleteBtn,
      {
        flex: 1,
        marginTop: 0,
        backgroundColor: "#9e9e9e",
      },
    ]}
    onPress={() => navigation.goBack()}
  >
    <Text style={styles.deleteText}>Cancel</Text>
  </TouchableOpacity>

</View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3fcf6",
    padding: 18,
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#3c7d68",
  },

  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 15,
    marginBottom: 14,
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  catBtn: {
    backgroundColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  catActive: {
    backgroundColor: "#72b99e",
  },

  saveBtn: {
    backgroundColor: "#459c80",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  deleteBtn: {
  padding: 16,
  borderRadius: 24,
  alignItems: "center",
},

deleteText: {
  color: "#fff",
  fontWeight: "bold",
},
});