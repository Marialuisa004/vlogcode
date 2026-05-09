import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
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
      Alert.alert(error.message);
    } else {
      Alert.alert("Updated!");
      navigation.goBack();
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput value={title} onChangeText={setTitle} style={{ borderWidth: 1 }} />
      <TextInput value={ingredients} onChangeText={setIngredients} style={{ borderWidth: 1 }} />
      <TextInput value={category} onChangeText={setCategory} style={{ borderWidth: 1 }} />

      <TouchableOpacity onPress={updateRecipe} style={{ backgroundColor: "green", padding: 10 }}>
        <Text style={{ color: "white" }}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}