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

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

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

type Props = {
  navigation: any;
};

/* =========================
   ✨ PREMIUM ANIMATED IMAGE
========================= */
const AnimatedRecipeImage = ({ uri }: { uri: string }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const translateY = useSharedValue(12);

  React.useEffect(() => {
    // entrance animation
    opacity.value = withTiming(1, { duration: 500 });
    scale.value = withTiming(1, { duration: 650 });
    translateY.value = withTiming(0, { duration: 650 });
  }, []);

  // floating loop animation
  React.useEffect(() => {
    const loop = () => {
      translateY.value = withTiming(-5, { duration: 1600 }, () => {
        translateY.value = withTiming(0, { duration: 1600 }, loop);
      });
    };

    loop();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <Animated.View style={[{ width: "100%", height: 220 }, animatedStyle]}>
      <Image
        source={{ uri }}
        style={{
          width: "100%",
          height: 220,
        }}
      />
    </Animated.View>
  );
};

/* =========================
   HOME SCREEN
========================= */
export default function Home({ navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

<<<<<<< HEAD
  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Dessert",
  ];
=======
  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert"];
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012

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
<<<<<<< HEAD
    const channel = supabase
      .channel("recipes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recipes" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRecipes((prev) => [
              {
                ...(payload as any).new,
                id: String((payload as any).new.id),
              },
              ...prev,
            ]);
          }

          if (payload.eventType === "DELETE") {
            setRecipes((prev) =>
              prev.filter(
                (item) =>
                  item.id !== String((payload as any).old.id)
              )
            );
          }

          if (payload.eventType === "UPDATE") {
            setRecipes((prev) =>
              prev.map((item) =>
                item.id === String((payload as any).new.id)
                  ? {
                      ...(payload as any).new,
                      id: String((payload as any).new.id),
                    }
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

  useEffect(() => {
    let filteredRecipes = recipes;

    if (selectedCategory !== "All") {
      filteredRecipes = filteredRecipes.filter(
        (r) =>
          r.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      const searchText = search.toLowerCase();

      filteredRecipes = filteredRecipes.filter(
        (r) =>
          r.title?.toLowerCase().includes(searchText) ||
          r.ingredients?.toLowerCase().includes(searchText) ||
          r.category?.toLowerCase().includes(searchText) ||
          r.steps?.toLowerCase().includes(searchText)
      );
    }

=======
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

>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
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
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
<<<<<<< HEAD
        contentContainerStyle={{ paddingBottom: 100 }}
=======
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
        ListHeaderComponent={() => (
          <>
            {/* TOP BAR */}
            <View style={styles.topBar}>
              <TextInput
                placeholder="Search recipes..."
<<<<<<< HEAD
                placeholderTextColor="#6B7280"
=======
                placeholderTextColor="#7a9b8e"
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
                value={search}
                onChangeText={setSearch}
                style={styles.search}
              />

              <TouchableOpacity
                onPress={logout}
                style={styles.logoutBtn}
              >
<<<<<<< HEAD
                <Text style={styles.logoutText}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>

            {/* CATEGORIES */}
=======
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* CATEGORY */}
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
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
            {/* ✨ ANIMATED IMAGE */}
            <AnimatedRecipeImage uri={item.image} />

            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
<<<<<<< HEAD

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
                    navigation.navigate("EditRecipe", {
                      recipe: item,
                    })
                  }
                  style={styles.editBtn}
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
=======
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
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No recipes found
            </Text>
          </View>
        )}
      />
    </View>
  );
}

/* =========================
   STYLES (UNCHANGED)
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E6",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF4E6",
  },

  topBar: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
  },

  search: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE0C2",
    paddingHorizontal: 16,
    borderRadius: 18,
    flex: 1,
    height: 50,
  },
/* LABELS */
  label: {
    color: "#4B3248",
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  logoutBtn: {
    backgroundColor: "#FF7A00",
    padding: 12,
    borderRadius: 18,
  },

  logoutText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  categoriesWrapper: {
    marginBottom: 18,
  },

  categoryBtn: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  categoryActive: {
    backgroundColor: "#FF7A00",
  },

  categoryText: {
    color: "#6B7280",
    fontWeight: "700",
  },

  categoryActiveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    marginBottom: 20,
    overflow: "hidden",
  },

  cardContent: {
    padding: 18,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4B3248",
  },

  category: {
    color: "#4F9980",
    marginTop: 6,
    fontWeight: "700",
  },

  ingredients: {
    color: "#6B7280",
    marginTop: 10,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },

<<<<<<< HEAD
  editBtn: {
    backgroundColor: "#FF7A00",
    padding: 10,
    borderRadius: 16,
  },

  btnText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
=======
  logoutBtn: {
    backgroundColor: "#4b8f7e",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignSelf: "flex-end",
>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F9980",
  },
<<<<<<< HEAD
=======

>>>>>>> a3167abd08f4a34d375c3f88a10dc2b916cb8012
});