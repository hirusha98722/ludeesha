import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const recommendations = [
  {
    id: 1,
    title: "Maintain a Consistent Sleep Schedule",
    points: [
      "Go to bed and wake up at the same time every day, even on weekends.",
      "A regular schedule helps regulate your body’s internal clock for better sleep quality.",
    ],
    details: "Maintaining a routine and avoiding stimulating activities before bed can enhance sleep quality.",
  },
  {
    id: 2,
    title: "Create a Sleep-Conducive Environment",
    points: [
      "Go to bed and wake up at the same time every day, even on weekends.",
      "A regular schedule helps regulate your body’s internal clock for better sleep quality.",
    ],
    details: "A peaceful sleep environment helps your body relax and fall asleep faster.",
  },
  {
    id: 3,
    title: "Limit Screen Time Before Bed",
    points: [
      "Go to bed and wake up at the same time every day, even on weekends.",
      "A regular schedule helps regulate your body’s internal clock for better sleep quality.",
    ],
    details: "A peaceful sleep environment helps your body relax and fall asleep faster.",
  },
  {
    id: 4,
    title: "Limit Caffeine and Heavy Meals Before Bed",
    points: [
      "Avoid consuming caffeine or heavy meals at least 3-4 hours before bedtime.",
      "Caffeine can stay in your system for hours, disrupting sleep.",
    ],
    details: "Eating a large meal or drinking caffeinated beverages can interfere with your body’s ability to relax and fall asleep.",
  },
  {
    id: 5,
    title: "Exercise Regularly but Not Right Before Bed",
    points: [
      "Aim for at least 30 minutes of physical activity during the day.",
      "Exercise can promote better sleep, but intense workouts right before bed may keep you awake.",
    ],
    details: "Exercise promotes deep sleep, but working out too late in the day can have the opposite effect by increasing energy levels.",
  },
  {
    id: 6,
    title: "Manage Stress and Anxiety",
    points: [
      "Practice relaxation techniques such as deep breathing or meditation before bed.",
      "Managing stress can help you unwind and improve sleep quality.",
    ],
    details: "Reducing stress levels before sleep allows your body and mind to relax, ensuring better rest throughout the night.",
  },
];

const SleepRecommendationScreen = () => {
  const [selectedTile, setSelectedTile] = useState(null);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView>
        {recommendations.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.tile}
            onPress={() => setSelectedTile(item)}
          >
            <Text style={styles.tileTitle}>{item.title}</Text>
            <View style={styles.des}>
              {item.points.map((point, index) => (
                <Text key={index} style={styles.bulletPoint}>
                  • {point}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={!!selectedTile}
        transparent
        animationType="fade"
      >
        <Pressable style={styles.modalBackground} onPress={() => setSelectedTile(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedTile?.title}</Text>
            <Text style={styles.modalDetails}>{selectedTile?.details}</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SleepRecommendationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  tile: {
    backgroundColor: '#4f6179',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  des: {
    marginTop: 10
  },
  bulletPoint: {
    fontSize: 14,
    color: 'white',
    marginLeft: 10,
    marginTop: 10
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDetails: {
    fontSize: 16,
  },
});