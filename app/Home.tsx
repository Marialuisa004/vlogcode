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
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Dessert",
  ];

  // =========================
  // FETCH RECIPES
  // =========================
  const fetchRecipes = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

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

  // =========================
  // REFRESH WHEN SCREEN FOCUS
  // =========================
  useFocusEffect(
    useCallback(() => {
      fetchRecipes(true);
    }, [])
  );

  // =========================
  // REALTIME
  // =========================
  useEffect(() => {
    const channel = supabase
      .channel("recipes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recipes",
        },
        (payload) => {
          console.log("REALTIME:", payload);

          // INSERT
          if (payload.eventType === "INSERT") {
            setRecipes((prev) => {
              const exists = prev.some(
                (r) =>
                  r.id === String((payload as any).new.id)
              );

              if (exists) return prev;

              return [
                {
                  ...(payload as any).new,
                  id: String((payload as any).new.id),
                } as Recipe,
                ...prev,
              ];
            });
          }

          // DELETE
          if (payload.eventType === "DELETE") {
            setRecipes((prev) =>
              prev.filter(
                (item) =>
                  item.id !==
                  String((payload as any).old.id)
              )
            );
          }

          // UPDATE
          if (payload.eventType === "UPDATE") {
            setRecipes((prev) =>
              prev.map((item) =>
                item.id ===
                String((payload as any).new.id)
                  ? ({
                      ...(payload as any).new,
                      id: String(
                        (payload as any).new.id
                      ),
                    } as Recipe)
                  : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =========================
  // SEARCH + CATEGORY FILTER
  // =========================
  useEffect(() => {
    let filteredRecipes = recipes;

    // CATEGORY FILTER
    if (selectedCategory !== "All") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    // SEARCH FILTER
    if (search.trim() !== "") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => {
          const searchText = search.toLowerCase();

          return (
            recipe.title
              ?.toLowerCase()
              .includes(searchText) ||
            recipe.ingredients
              ?.toLowerCase()
              .includes(searchText) ||
            recipe.category
              ?.toLowerCase()
              .includes(searchText) ||
            recipe.steps
              ?.toLowerCase()
              .includes(searchText)
          );
        }
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

  // =========================
  // LOADER
  // =========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#4f9980"
        />
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
                onChangeText={(text) =>
                  setSearch(text)
                }
                style={styles.search}
                keyboardType="default"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              
              {/* LOGOUT */}
              <TouchableOpacity
                onPress={logout}
                style={styles.logoutBtn}
              >
                <Text style={styles.logoutText}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>

            {/* CATEGORY */}
            <View style={styles.categoriesWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  styles.categoriesContent
                }
              >
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() =>
                      setSelectedCategory(item)
                    }
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
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />

            <View style={styles.cardContent}>
              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.category}>
                {item.category}
              </Text>

              <Text
                numberOfLines={2}
                style={styles.ingredients}
              >
                {item.ingredients}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      "EditRecipe",
                      {
                        recipe: item,
                      }
                    )
                  }
                  style={styles.editBtn}
                >
                  <Text style={styles.btnText}>
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#5a9d80",
              }}
            >
              No recipes found
            </Text>
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

  editBtn: {
    backgroundColor: "#5fae93",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
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