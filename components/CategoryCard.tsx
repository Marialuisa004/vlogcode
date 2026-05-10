import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

type CategoryCardProps = {
  title: string;
  image?: string | null;
  count: number;
  onPress?: () => void;
};

export default function CategoryCard({
  title,
  image,
  count,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imageFallback]} />
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.count}>
          {count} recipe{count === 1 ? "" : "s"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: "#eee",
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  count: {
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
  },
});

