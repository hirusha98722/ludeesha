import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function MoodHistory() {
  const navigation = useNavigation();
  const [history, setHistory] = useState();

  // Function to delete a mood entry
  const deleteMood = (id) => {
    console.log('Delete mood entry:', id);

    Alert.alert('Delete Entry', 'Are you sure you want to delete this mood entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          // Delete mood entry from API
          const deleteMoodEntry = async () => {
            try {
              const response = await fetch(`http://192.168.8.140:5000/emotions/${id}`, {
                method: 'DELETE',
              });
              const data = await response.json();
              console.log('Mood entry deleted:', data);

              // Update mood history list
              setHistory(history.filter(item => item._id !== id));
            } catch (error) {
              console.error('Error deleting mood entry:', error);
            }
          }
          deleteMoodEntry();
        }
      }
    ]);
  };

  // Function to format MongoDB date object
  const formatDate = (dateObj) => {
    if (!dateObj) return 'Unknown date';

    // Check if it's a MongoDB date object
    if (dateObj.$date) {
      const date = new Date(dateObj.$date);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    // If it's a regular date string
    try {
      const date = new Date(dateObj);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return String(dateObj);
    }
  };

  useEffect(() => {
    // Fetch mood history from API
    const fetchMoodHistory = async () => {
      try {
        const response = await fetch('http://192.168.8.140:5000/emotions');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching mood history:', error);
      }
    }
    fetchMoodHistory();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.moodTile}
            onPress={() => navigation.navigate('MoodDetailScreen', { moodData: item })}
          >
            <Image source={{ uri: item.image_url }} style={styles.moodImage} />
            <View style={styles.textContainer}>
              <Text style={styles.moodText}>{item.mood}</Text>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMood(item._id)}>
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  moodTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  moodText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
