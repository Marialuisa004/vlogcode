import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: string;
};

export default function UserPostsModal({
  visible,
  onClose,
  userId,
}: Props) {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", String(userId))
      .order("id", { ascending: false });

    if (error) {
      console.log(error.message);
    } else {
      setRecipes(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (visible) fetchPosts();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>My Posts</Text>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF7A00" />
        ) : (
          <ScrollView>
            {recipes.length === 0 ? (
              <Text style={styles.empty}>No posts yet</Text>
            ) : (
              recipes.map((item) => (
                <View key={item.id} style={styles.card}>
                  <Image source={{ uri: item.image }} style={styles.image} />

                  <Text style={styles.name}>{item.title}</Text>
                  <Text style={styles.category}>{item.category}</Text>

                  <Text style={styles.label}>Ingredients</Text>
                  <Text style={styles.text}>{item.ingredients}</Text>

                  <Text style={styles.label}>Steps</Text>
                  <Text style={styles.text}>{item.steps}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E6",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4B3248",
  },

  close: {
    color: "#FF7A00",
    fontWeight: "800",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    padding: 12,
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },

  category: {
    color: "#4F9980",
    fontWeight: "700",
  },

  label: {
    marginTop: 10,
    fontWeight: "800",
    color: "#FF7A00",
  },

  text: {
    color: "#6B7280",
    marginTop: 4,
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});