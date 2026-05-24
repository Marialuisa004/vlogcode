import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
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

export default function Home({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(
    () => ["All", "Breakfast", "Lunch", "Dinner", "Dessert"],
    []
  );

  const fetchRecipes = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);

    const { data, error } = await supabase.from("recipes").select("*");

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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecipes(true);
    }, [fetchRecipes])
  );

  useEffect(() => {
    let next = recipes;

    if (selectedCategory !== "All") {
      next = next.filter(
        (r) => r.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    const text = search.trim().toLowerCase();

    if (text) {
      next = next.filter(
        (r) =>
          r.title?.toLowerCase().includes(text) ||
          r.ingredients?.toLowerCase().includes(text) ||
          r.category?.toLowerCase().includes(text) ||
          r.steps?.toLowerCase().includes(text)
      );
    }

    setFiltered(next);
  }, [recipes, search, selectedCategory]);

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  // ANIMATED IMAGE COMPONENT
  const AnimatedRecipeImage = ({ uri }: { uri: string }) => {
    const translateX = useSharedValue(-120);
    const scale = useSharedValue(0.8);

    useEffect(() => {
      // swipe animation
      translateX.value = withSpring(0, {
        damping: 8,
        stiffness: 90,
      });

      // bounce animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { scale: scale.value },
        ],
      };
    });

    return (
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image source={{ uri }} style={styles.recipeImage} />
      </Animated.View>
    );
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
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <>
            <View style={styles.topBar}>
              <TextInput
                placeholder="Search recipes..."
                placeholderTextColor="#7a9b8e"
                value={search}
                onChangeText={setSearch}
                style={styles.search}
              />

              <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categoriesWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setSelectedCategory(item)}
                    style={[
                      styles.categoryBtn,
                      selectedCategory === item && styles.categoryActive,
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
            <AnimatedRecipeImage uri={item.image} />

            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>

              <Text style={styles.category}>{item.category}</Text>

              <Text numberOfLines={2} style={styles.ingredients}>
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
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recipes found</Text>
          </View>
        )}
      />
    </View>
  );
}

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
    paddingVertical: 10,
    paddingHorizontal: 18,
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },

  imageContainer: {
    width: "100%",
    height: 220,
    overflow: "hidden",
  },

  recipeImage: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    lineHeight: 20,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },

  editBtn: {
    backgroundColor: "#FF7A00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },

  btnText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F9980",
  },
});