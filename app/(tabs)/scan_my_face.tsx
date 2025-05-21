import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Map emotions to images
const emotionImages = {
  Happy: require('@/assets/images/happyEmoji.png'),
  Surprise: require('@/assets/images/surpriseEmoji.png'),
  Neutral: require('@/assets/images/neutralEmoji.png'),
  Sad: require('@/assets/images/sadEmoji.png'),
  Stressed: require('@/assets/images/stressEmoji.png'),
  Angry: require('@/assets/images/angryEmoji.png'),
};

const emotionColors = {
  Happy: '#FFA500',
  Surprise: '#87CEEB',
  Neutral: '#FFD700',
  Sad: '#00CED1',
  Stressed: '#9370DB',
  Angry: '#FF6B6B'
};

// Helper functions for date manipulation
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// API URL - replace with your actual API base URL
const API_BASE_URL = 'http://192.168.8.140:5000';

const Calendar = ({ onMonthChange, emotions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    onMonthChange(newDate);
  };

  useEffect(() => {
    onMonthChange(currentDate);
  }, []);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Get days from previous month
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    const prevMonthDays = Array.from({ length: firstDay }, (_, i) => ({
      day: daysInPrevMonth - firstDay + i + 1,
      month: 'prev',
      full: new Date(year, month - 1, daysInPrevMonth - firstDay + i + 1)
    }));

    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      month: 'current',
      full: new Date(year, month, i + 1)
    }));

    // Calculate remaining days needed for next month
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays; // 6 rows × 7 days = 42

    // Next month days
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
      day: i + 1,
      month: 'next',
      full: new Date(year, month + 1, i + 1)
    }));

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const formatDateForEmotion = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getEmotionForDate = (date) => {
    const dateStr = formatDateForEmotion(date);
    if (!emotions || !emotions.length) return null;

    const emotionForDate = emotions.find(emotion => {
      // Handle MongoDB date format with $date field
      const emotionDate = emotion.createdAt.$date ?
        new Date(emotion.createdAt.$date) :
        new Date(emotion.createdAt);

      const emotionDateStr = formatDateForEmotion(emotionDate);
      return emotionDateStr === dateStr;
    });

    return emotionForDate ? emotionForDate.mood : null;
  };

  const getEmotionColor = (date) => {
    const emotion = getEmotionForDate(date);
    return emotion ? emotionColors[emotion] : '#F0F0F0';
  };

  const renderDay = (dayInfo) => {
    const isCurrentMonth = dayInfo.month === 'current';
    const emotion = getEmotionForDate(dayInfo.full);
    const dayStyle = [
      styles.dayButton,
      {
        backgroundColor: isCurrentMonth ? getEmotionColor(dayInfo.full) : '#F0F0F0',
        opacity: isCurrentMonth ? 1 : 0.3
      }
    ];

    return (
      <TouchableOpacity
        key={`${dayInfo.month}-${dayInfo.day}`}
        style={dayStyle}
        onPress={() => isCurrentMonth && setSelectedDate(dayInfo.full)}
      >
        <Text style={[styles.dayText, !isCurrentMonth && styles.dayTextFaded]}>
          {dayInfo.day}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Text style={styles.headerButton}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Text style={styles.headerButton}>&gt;</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {generateCalendarDays().map(dayInfo => renderDay(dayInfo))}
      </View>
    </View>
  );
};

const MoodCount = ({ currentDate, emotions }) => {
  const [counts, setCounts] = useState({
    Happy: 0,
    Surprise: 0,
    Neutral: 0,
    Sad: 0,
    Stressed: 0,
    Angry: 0
  });
  const navigation = useNavigation();
  const [totalMoods, setTotalMoods] = useState(0);

  useEffect(() => {
    if (!emotions || !emotions.length) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // Count emotions for the current month
    const monthCounts = emotions.reduce((acc, emotion) => {

      const emotionDate = new Date(emotion.createdAt.$date || emotion.createdAt);
      const emotionYear = emotionDate.getFullYear();
      const emotionMonth = emotionDate.getMonth() + 1;

      if (emotionYear === year && emotionMonth === month) {
        acc[emotion.mood] = (acc[emotion.mood] || 0) + 1;
      }
      return acc;
    }, {});

    // Update the counts state
    setCounts(prev => ({
      Happy: monthCounts.Happy || 0,
      Surprise: monthCounts.Surprise || 0,
      Neutral: monthCounts.Neutral || 0,
      Sad: monthCounts.Sad || 0,
      Stressed: monthCounts.Stressed || 0,
      Angry: monthCounts.Angry || 0
    }));

    // Calculate total moods
    const total = Object.values(monthCounts).reduce((sum, count) => sum + count, 0);
    setTotalMoods(total);
  }, [currentDate, emotions]);

  // Calculate width for a single emotion
  const calculateWidth = (emotion) => {
    return totalMoods > 0 ? `${(counts[emotion] / totalMoods) * 100}%` : '0%';
  };

  return (
    <View style={styles.moodCountContainer}>
      <View style={styles.moodCountHeader}>
        <Text style={styles.moodCountTitle}>Mood Count</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MoodHistory')}>
          <Text style={styles.historyButton}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gaugeContainer}>
        <View style={styles.gauge}>
          {Object.keys(emotionColors).map((emotion) => {
            const width = calculateWidth(emotion);
            return width !== '0%' ? (
              <View
                key={emotion}
                style={[
                  styles.gaugeSegment,
                  {
                    backgroundColor: emotionColors[emotion],
                    width: width
                  }
                ]}
              />
            ) : null;
          })}
        </View>
        <Text style={styles.gaugeNumber}>{totalMoods}</Text>
      </View>

      {/* Emotion Images */}
      <View style={styles.emotionsGrid}>
        {Object.entries(counts).map(([emotion, count]) => (
          <View key={emotion} style={styles.emotionItem}>
            <Image source={emotionImages[emotion]} style={styles.emotionImage} />
            <Text style={styles.emotionText}>{emotion} ({count})</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function MoodTrackerScreen() {
  const navigation = useNavigation();
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayEmotion, setTodayEmotion] = useState('Neutral');

  const fetchEmotions = async (year, month) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/emotions/month/${year}/${month}`);
      const data = await response.json();
      setEmotions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching emotions:', err);
      setError('Failed to load emotions');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      await fetchEmotions(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1);

      // Set today's emotio

      const todayEmotion = emotions.find(emotion => {
        const emotionDate = emotion.createdAt.$date ?
          new Date(emotion.createdAt.$date) :
          new Date(emotion.createdAt);

        const emotionDateStr = `${emotionDate.getFullYear()}-${String(emotionDate.getMonth() + 1).padStart(2, '0')}-${String(emotionDate.getDate()).padStart(2, '0')}`;
        return emotionDateStr === formattedToday;
      })?.mood || 'Neutral';

      setTodayEmotion(todayEmotion);
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchEmotions(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1);
  }, [currentViewDate]);

  const handleMonthChange = (date) => {
    setCurrentViewDate(date);
  };

  if (loading && emotions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5fddf3" />
        <Text>Loading your mood data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchEmotions(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Emotion Display with Dynamic Styling */}
      <View style={[styles.todayEmotionContainer, { backgroundColor: emotionColors[todayEmotion] || '#FFD700' }]}>
        <Text style={styles.todayEmotionText}>
          Today you're {todayEmotion} 😊
        </Text>
      </View>

      <Calendar
        onMonthChange={handleMonthChange}
        emotions={emotions}
      />

      <MoodCount
        currentDate={currentViewDate}
        emotions={emotions}
      />

      <TouchableOpacity
        style={styles.checkMoodButton}
        onPress={() => navigation.navigate('MoodCamera')}
      >
        <Text style={styles.checkMoodText}>Check my Mood</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayEmotionContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayEmotionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 12, // Reduced padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerButton: {
    fontSize: 18,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  weekDay: {
    color: '#666',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center items
    gap: 4, // Add spacing between days
    marginHorizontal: 4,
  },
  dayButton: {
    width: 27, // Decreased from 32
    height: 27, // Decreased from 32
    borderRadius: 20, // Keep circular
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2, // Reduce margin for tighter layout
  },

  dayText: {
    fontSize: 12, // Smaller text
  },

  dayTextFaded: {
    color: '#999',
  },
  moodCountContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodCountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  moodCountTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    color: '#2196F3',
  },
  gaugeContainer: {
    height: 48,
    marginBottom: 16,
    position: 'relative',
  },
  gauge: {
    flexDirection: 'row',
    height: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 24,
    overflow: 'hidden',
  },
  gaugeSegment: {
    height: '100%',
  },
  gaugeNumber: {
    position: 'absolute',
    alignSelf: 'center',
    top: '25%',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    marginBottom: 2,
  },
  emotionImage: {
    width: 35,  // Adjust image size
    height: 35, // Adjust image size
    marginRight: 2,
    resizeMode: 'contain',
  },
  emotionText: {
    fontSize: 12,
  },
  checkMoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5fddf3',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkMoodText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
