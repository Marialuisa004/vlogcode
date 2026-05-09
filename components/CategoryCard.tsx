import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type Props = {
  title: string;
  image: string;
  count: number;
};

export default function CategoryCard({
  title,
  image,
  count,
}: Props) {
  return (
    <TouchableOpacity style={styles.container}>
      <ImageBackground
        source={{ uri: image }}
        style={styles.image}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>{count}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 10,
  },
  image: {
    height: 140,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: '#d35400',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
  },
  count: {
    color: 'white',
  },
});