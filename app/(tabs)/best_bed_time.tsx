import { StyleSheet, Image, Platform, View, PermissionsAndroid } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuthContext } from '@/context/hooks/use-auth-context';
import Toast from 'react-native-toast-message';
import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export default function BestBedTimeScreen() {

  const {bedtime_predicted_data, get_bedtime_predict_data, user} = useAuthContext();

  const [predictData, setPredictData] = useState<any>(null)
  const [bedTime, setBedtime] = useState<any>(null)

  const [screenTime, setScreenTime] = useState<any>(null);
  const [wakeUpTime, setWakeUpTime] = useState<string>('');
  const [stepCount, setStepCount] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>("");
  
  
  const getCurrentDate = () => {
    // Get the current date formatted as YYYY-MM-DD to persist the count for the current day
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  };

  const getStoredStepCount = async () => {
    try {
      const storedCount = await AsyncStorage.getItem(currentDate);
      if (storedCount !== null) {
        setStepCount(parseInt(storedCount));
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to get stored step count', position: 'bottom', swipeable: true });
    }
  };

  const storeStepCount = async (steps: number) => {
    try {
      await AsyncStorage.setItem(currentDate, steps.toString());
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to store step count', position: 'bottom', swipeable: true });
    }
  };

  // Function to get step count
  const getStepCount = async () => {
    try {
      // Start watching the step count
      const subscription = Pedometer.watchStepCount(result => {
        setStepCount(result.steps);
        storeStepCount(result.steps); // Store the updated step count
      });

      // Stop watching after a certain period if needed (optional)
      // Example: stop watching after 10 seconds
      setTimeout(() => {
        subscription.remove();
      }, 10000); // Adjust this duration if necessary

    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to get step count', position: 'bottom', swipeable: true });
    }
  };


  const getBedtimeData = async () => {

    getCurrentDate(); // Set the current date on page load
    getStoredStepCount(); 
    getStepCount(); 
  
      try{

        const {_id} = user;
  
        await get_bedtime_predict_data?.(_id,stepCount);
  
      } catch (error) {
        Toast.show({type:'error',text1:'Failed to get bedtime data',position:'bottom', swipeable:true})
  
      } finally {
        
      }
  };

  const calculateBedtime = (sleepDuration:any, wakeUpTime:any) => {
  
    const timeParts = wakeUpTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeParts) {
      console.error("Invalid time format");
      return;
    }

    let hour = parseInt(timeParts[1]);
    const minute = parseInt(timeParts[2]);
    const period = timeParts[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const wakeHour = hour;
    const wakeMinute = minute;

    // Convert sleep duration to hours and minutes
    const sleepHours = Math.floor(sleepDuration);
    const sleepMinutes = Math.round((sleepDuration - sleepHours) * 60);

    // Calculate bedtime
    let bedtimeHour = wakeHour - sleepHours;
    let bedtimeMinute = wakeMinute - sleepMinutes;
    // Handle negative minutes
    if (bedtimeMinute < 0) {
      bedtimeMinute += 60;
      bedtimeHour -= 1;
    }

    // Handle negative hours (e.g., if bedtime is before midnight)
    if (bedtimeHour < 0) {
      bedtimeHour += 24;
    }

    // Format the bedtime
    const formattedBedtime = `${String(bedtimeHour).padStart(2, '0')}:${String(bedtimeMinute).padStart(2, '0')}`;
    return formattedBedtime;
  };


  useEffect(() => {

    // getScreenTime()
    
    getBedtimeData()

  }, [])
    

  useEffect(() => {
    
    if(bedtime_predicted_data && bedtime_predicted_data.success){
      setPredictData(bedtime_predicted_data.data)
      
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      const wakeupEntry = user.wakeup_time.find((entry:any) => entry.day === today);

      const wakeupTime = wakeupEntry ? `${wakeupEntry.time.padStart(2, '0')}` : "05:00";

      const sleepDuration = parseFloat(bedtime_predicted_data.data.trim());
      const bedtime = calculateBedtime(sleepDuration,wakeupTime);
      setBedtime(bedtime);

    }

  }, [bedtime_predicted_data])
    
  const formatSleepDuration = (duration: string) => {
    const hours = Math.floor(parseFloat(duration)); // Get whole hours
    const minutes = Math.round((parseFloat(duration) - hours) * 60); // Get remaining minutes
    
    return `${hours}h ${minutes}m`; // Format as "Xh Ym"
  };

  const getCurrentDayWakeUpTime = () => {
    if (user?.wakeup_time) {
      const currentDay = new Date().toLocaleString('en-us', { weekday: 'long' }); // Get current day name (e.g., 'Monday')
      const todayWakeUp = user.wakeup_time.find((item: any) => item.day === currentDay);
      if (todayWakeUp) {
        setWakeUpTime(todayWakeUp.time);
      }
    }
  };

  useEffect(() => {
    getCurrentDayWakeUpTime();
  }, [user]); // Call when user data changes
  return (
    <View>

      <ThemedView style={styles.contentContainer}>

        <View style={styles.resultContainer}>

          <ThemedText type="subtitle" style={styles.subtitle}>
            Your Bedtime is
          </ThemedText>

          <ThemedText type='defaultSemiBold' style={styles.heading}>
            {bedTime || ''}
          </ThemedText>

        </View>

        <ThemedView style={styles.suggestionContainer}>
          <ThemedText type="subtitle" style={styles.suggestionTitle}>
            Suggestions:
          </ThemedText>
          <ThemedText style={styles.suggestionText}>
          Bed time duration: {predictData ? `${formatSleepDuration(predictData)} hours` : 'Loading...'}
          </ThemedText>
          <ThemedText style={styles.suggestionText}>
          Wake up time: {wakeUpTime ? `${wakeUpTime}:00` : 'Loading...'}
          </ThemedText>
          <ThemedText style={styles.suggestionText}>
            Avg Mental health: Good
          </ThemedText>
          <ThemedText style={styles.suggestionText}>
            Steps today: {stepCount} steps
          </ThemedText>
        </ThemedView>
      </ThemedView>
      </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  heading: {
    // fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  suggestionContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  resultContainer:{
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '#ffec88',
    borderRadius: 12,
    padding: 16,
    marginTop:40,
    marginBottom:10
  }
});