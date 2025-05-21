import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios, { endpoints } from '@/utils/axios';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SleepInterventionHistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const userId = '12'; // Replace with dynamic userId if needed

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.post(endpoints.sleepIntervention.findByUserId, {
          userId,
        });

        if (response.status === 200) {
          setHistory(response.data);
        } else {
          throw new Error('Failed to fetch history');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', 'Failed to load sleep intervention history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isExpanded = expandedId === item._id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleExpand(item._id)}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="calendar-clock" size={24} color="#4a90e2" />
          <Text style={styles.dateText}>{new Date(item.dateAndTime).toLocaleString()}</Text>
        </View>

        <View style={styles.inlineRow}>
          <MaterialCommunityIcons
            name={getEmotionIcon(item.emotion)}
            size={20}
            color={getEmotionColor(item.emotion)}
          />
          <Text style={styles.label}>Emotion:</Text>
          <Text style={{ color: getEmotionColor(item.emotion), fontWeight: 'bold' }}>
            {item.emotion}
          </Text>
        </View>

        {isExpanded && (
          <>
            <View style={styles.inlineRow}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#e91e63" />
              <Text style={styles.label}>Stress Level:</Text>
              <View style={[styles.badge, getBadgeColor(item.stress_level)]}>
                <Text style={styles.badgeText}>{item.stress_level}</Text>
              </View>
            </View>
            <View style={styles.inlineRow}>
              <MaterialCommunityIcons name="meditation" size={20} color="#4caf50" />
              <Text style={styles.label}>Intervention:</Text>
              <Text style={{ flex: 1 }}>{item.intervention}</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const getBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return { backgroundColor: '#8bc34a' };
      case 'moderate':
        return { backgroundColor: '#ffb300' };
      case 'high':
        return { backgroundColor: '#f44336' };
      default:
        return { backgroundColor: '#9e9e9e' };
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return 'emoticon-happy-outline';
      case 'sad':
        return 'emoticon-sad-outline';
      case 'angry':
        return 'emoticon-angry-outline';
      case 'anxious':
        return 'emoticon-neutral-outline';
      case 'calm':
        return 'emoticon-cool-outline';
      default:
        return 'emoticon-outline';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return '#4caf50';
      case 'sad':
        return '#2196f3';
      case 'angry':
        return '#f44336';
      case 'anxious':
        return '#ff9800';
      case 'calm':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>No intervention history available.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 6,
    color: '#555',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 4,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default SleepInterventionHistoryScreen;
