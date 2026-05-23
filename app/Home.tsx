import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type Recipe = {
  id: string;
  title: string;
  image: string;
  ingredients: string;
  category: string;
  steps?: string;
};

type Props = { navigation: any };

export default function Home({ navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert"];

  // =========================
  // FETCH RECIPES
  // =========================
  const fetchRecipes = async (showLoader = false) => {
    if (showLoader) setLoading(true);

    const { data, error } = await supabase
      .from("recipes")
      .select("*");

    if (error) {
      console.log("FETCH ERROR:", error.message);
      setLoading(false);
      return;
    }

    const normalized = (data || []).map((d: any) => ({
      ...d,
      id: String(d.id),
    })) as Recipe[];

    setRecipes(normalized);
    setFiltered(normalized);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecipes(true);
    }, [])
  );

  // =========================
  // DELETE FUNCTION
  // =========================
 
  // =========================
  // FILTER
  // =========================
  useEffect(() => {
    let filteredRecipes = recipes;

    if (selectedCategory !== "All") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      const text = search.toLowerCase();

      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.title?.toLowerCase().includes(text) ||
          recipe.ingredients?.toLowerCase().includes(text) ||
          recipe.category?.toLowerCase().includes(text) ||
          recipe.steps?.toLowerCase().includes(text)
      );
    }

    setFiltered(filteredRecipes);
  }, [search, selectedCategory, recipes]);

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f9980" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* TOP BAR */}
            <View style={styles.topBar}>
              <TextInput
                placeholder="Search recipes..."
                placeholderTextColor="#7a9b8e"
                value={search}
                onChangeText={setSearch}
                style={styles.search}
              />

              <TouchableOpacity
                onPress={logout}
                style={styles.logoutBtn}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* CATEGORY */}
            <View style={styles.categoriesWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setSelectedCategory(item)}
                    style={[
                      styles.categoryBtn,
                      selectedCategory === item &&
                        styles.categoryActive,
                    ]}
                  >
                    <Text
                      style={
                        selectedCategory === item
                          ? styles.categoryActiveText
                          : styles.categoryText
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>

              <Text numberOfLines={2} style={styles.ingredients}>
                {item.ingredients}
              </Text>

              {/* VIEW ONLY MODE */}
              <View style={{ marginTop: 10 }}>
                <Text style={styles.category}>{item.category}</Text>

                <Text numberOfLines={2} style={styles.ingredients}>
                  {item.ingredients}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#effaf3",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topBar: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#e5f7f0",
    borderRadius: 22,
    padding: 12,
    shadowColor: "#8bcfb5",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  categoriesWrapper: {
    marginBottom: 16,
  },

  categoriesContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  search: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    flex: 1,
    fontSize: 14,
    shadowColor: "#afe7d3",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  categoryBtn: {
    backgroundColor: "#c7e8d7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginRight: 10,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryActive: {
    backgroundColor: "#6fc4a6",
  },

  categoryActiveText: {
    color: "#fff",
    fontWeight: "700",
  },

  categoryText: {
    color: "#3f5f54",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#94c9b7",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 200,
  },

  cardContent: {
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4f374b",
    marginBottom: 8,
  },

  category: {
    color: "#5a9d80",
    marginBottom: 8,
    fontWeight: "700",
  },

  ingredients: {
    color: "#6d5d6e",
    marginBottom: 12,
    lineHeight: 20,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  logoutBtn: {
    backgroundColor: "#4b8f7e",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignSelf: "flex-end",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "800",
  },

});