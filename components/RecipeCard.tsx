import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type RecipeCardProps = {
  title: string;
  category: string;
  image: string;
  ingredients?: string;
  onPress?: () => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  category,
  image,
  ingredients,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.category}>{category}</Text>

        {ingredients && (
          <Text style={styles.ingredients} numberOfLines={2}>
            {ingredients}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RecipeCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,

    elevation: 4,
  },

  image: {
    width: "100%",
    height: 180,
  },

  content: {
    padding: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },

  category: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d35400",
    marginBottom: 8,
  },

  ingredients: {
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
  },
});