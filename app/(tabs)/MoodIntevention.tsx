import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Image
} from 'react-native';

const MoodIntevention = ({ route, navigation }) => {
  const [moodData, setMoodData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize state from route params
  useEffect(() => {
    if (route.params && route.params.moodData) {
      setMoodData(route.params.moodData);
      loadContextSuggestions(route.params.moodData.mood);
    }
  }, [route.params]);

  // Format date more completely
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';

    try {
      const date = new Date(timestamp);
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Unknown date';
    }
  };

  // Load suggestions based on mood
  const loadContextSuggestions = (mood) => {
    setIsLoading(true);
    setError(null);

    // Mock suggestions based on mood type
    // In a real app, this would be an API call to get personalized suggestions
    setTimeout(() => {
      let moodSuggestions = [];

      switch (mood.toLowerCase()) {
        case 'happy':
          moodSuggestions = [
            "Journal about what made you happy to reinforce positive thinking",
            "Share your joy with someone you care about",
            "Take time to appreciate this positive moment",
            "Try a new activity while in this positive mindset"
          ];
          break;
        case 'sad':
          moodSuggestions = [
            "Try some gentle physical activity to boost endorphins",
            "Reach out to a friend or family member for support",
            "Practice self-compassion and allow yourself to feel",
            "Consider a brief mindfulness meditation"
          ];
          break;
        case 'angry':
          moodSuggestions = [
            "Take deep breaths for 2 minutes to calm your nervous system",
            "Physical exercise can help release tension",
            "Write your thoughts down to process them",
            "Step away from the situation if possible"
          ];
          break;
        case 'anxious':
          moodSuggestions = [
            "Try box breathing: inhale for 4, hold for 4, exhale for 4",
            "Ground yourself by naming 5 things you can see, 4 you can touch, etc.",
            "Break overwhelming tasks into smaller steps",
            "Limit caffeine and consider herbal tea instead"
          ];
          break;
        default:
          moodSuggestions = [
            "Take a moment to reflect on what might have caused this feeling",
            "Consider how your physical needs may be affecting your mood",
            "Try changing your environment briefly",
            "Practice self-awareness about your emotional patterns"
          ];
      }

      setSuggestions(moodSuggestions);
      setIsLoading(false);
    }, 1500); // Simulate API delay
  };

  // Fetch mood history (in a real app, this would be an API call)
  const fetchMoodHistory = () => {
    navigation.navigate('MoodHistoryScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mood Context</Text>
        </View>

        {moodData ? (
          <View style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <Text style={styles.moodTitle}>{moodData.mood}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(moodData.createdAt)}</Text>
            <View style={styles.divider} />
            <Text style={styles.reasonHeading}>Your thoughts:</Text>
            <Text style={styles.reasonText}>{moodData.note || "No notes recorded"}</Text>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7EC8E3" />
            <Text>Loading mood data...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Balance with back button
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  moodCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodEmoji: {
    fontSize: 30,
    marginRight: 10,
  },
  moodTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginVertical: 15,
  },
  reasonHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
});

export default MoodIntevention;