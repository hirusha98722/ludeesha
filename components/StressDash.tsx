import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const StressDash = () => {
  const navigation = useNavigation();

  // Emoji data with unique images for each mood
  const emojiData = [
    { label: 'Happy', image: require('@/assets/images/happyEmoji.png') },
    { label: 'Sad', image: require('@/assets/images/sadEmoji.png') },
    { label: 'Angry', image: require('@/assets/images/angryEmoji.png') },
    { label: 'Calm', image: require('@/assets/images/neutralEmoji.png') },
    { label: 'Surprise', image: require('@/assets/images/surpriseEmoji.png') },
    { label: 'Stress', image: require('@/assets/images/stressEmoji.png') },
  ];

  return (
    <View style={styles.tileWrapper}>
      {/* How are you? Tile */}
      <View style={styles.howAreYouTile}>
        <Text style={styles.howAreYouText}>How are you?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Scan My Face')}>
          <Text style={styles.moreText}>More..</Text>
        </TouchableOpacity>
      </View>

      {/* Emoji Row */}
      <View style={styles.emojiRow}>
        {emojiData.map((emoji, index) => (
          <View key={index} style={styles.emojiContainer}>
            <Image
              source={emoji.image}
              style={styles.emoji}
              resizeMode="contain" // Ensure the image scales to fit the container
            />
            <Text style={styles.emojiLabel}>{emoji.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tileWrapper: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 15,
  },
  howAreYouTile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  howAreYouText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moreText: {
    fontSize: 14,
    color: '#1E90FF', // Blue color for 'More..'
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiContainer: {
    alignItems: 'center',
    margin: 5,
  },
  emoji: {
    width: 40,    // Ensure all images have the same width
    height: 40,   // Ensure all images have the same height
  },
  emojiLabel: {
    fontSize: 12,
    marginTop: 1,
  },
});

export default StressDash;
