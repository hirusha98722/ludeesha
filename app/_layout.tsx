import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "../context/auth/index";
import Toast from "react-native-toast-message";
import LoadingScreen from "@/components/LoadingScreen";
import { createDrawerNavigator } from "@react-navigation/drawer"; // Import Drawer
import AsyncStorage from "@react-native-async-storage/async-storage";
import SleepRecommendationScreen from "./(tabs)/SleepRecommendationScreen";
import { useAuthContext } from "@/context/hooks/use-auth-context";
import { registerSleepTracking } from "@/scripts/sleepTracker";
import { PermissionsAndroid, Platform, } from 'react-native';

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner:true,
    shouldShowList:true
  }),
});

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

SplashScreen.preventAutoHideAsync();
const Drawer = createDrawerNavigator(); // Drawer instance

export default function RootLayout() {

  const colorScheme = useColorScheme();

  const [isReady, setIsReady] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [user, setUser] = useState<any>(null);

  
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const router = useRouter();

  const fetchUser = async () => {
      
    try {
      
      const userString = await AsyncStorage.getItem('user');
  
      if (userString !== null) {
        const user = JSON.parse(userString);
        setUser(user);
      }
      else{
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };



  useEffect(() => {
    
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // useEffect(() => {
  //   requestUsageStatsPermission()
  // }, [])
  

  useEffect(() => {
    
    if (loaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
      fetchUser();
    }
    registerSleepTracking();
  }, [loaded]);

  

  return (
    <AuthProvider>
      <AuthLayout  
        isReady={isReady} 
        router={router} 
        colorScheme={colorScheme} 
        />
      <Toast/>
    </AuthProvider>
  );
}

interface AuthLayoutProps {
  isReady: boolean;
  router: ReturnType<typeof useRouter>;
  colorScheme: any;
  // user:any
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ isReady, router, colorScheme}) => {
  const { loading, user, submitPushToken } = useAuthContext(); 

  const [expoPushToken, setExpoPushToken] = useState('');

  const [userState, setUserState] = useState<any>(null);
  const [usagePermissionGranted, setUsagePermissionGranted] = useState(false);
  const [tokenRegistered, setTokenRegistered] = useState<any>(false);

  const requestUsageStatsPermission = async () => {
  
    try {
      const granted = await PermissionsAndroid.request(
        'android.permission.READ_PHONE_STATE' as any, 
        {
          title: 'Usage Stats Permission',
          message: 'This app needs access to your usage stats to calculate screen time.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
  
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({type:'success',text1:'Usage stats permission granted',position:'bottom', swipeable:true})
          setUsagePermissionGranted(true);
      } else {
        console.log('Usage stats permission denied');
      }
    } catch (err) {
      console.error('Error requesting usage stats permission:', err);
    }
  };

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }
  
  async function registerForPushNotificationsAsync() {
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    // if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Project ID not found');
      }
      try {
        
        const pushTokenString = (await Notifications.getExpoPushTokenAsync({projectId:projectId})).data;
        console.log('===========Expo Push Token=========================');
        console.log(pushTokenString);
  
        if (Platform.OS === "android") {
          Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }
      
        setExpoPushToken(pushTokenString ?? '')
        return pushTokenString;
      } catch (e: unknown) {
  
        handleRegistrationError(`${e}`);
      }
    // } else {
    //   handleRegistrationError('Must use physical device for push notifications');
    // }
  }
  
  const saveExpoToken = async (user: any) => {
    try {
      // Only register if token hasn't been registered yet
      if (!tokenRegistered && !expoPushToken) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          AsyncStorage.setItem("expo_token", token);
          await submitPushToken?.(token, user._id);
          setTokenRegistered(true); // Mark as registered
          Toast.show({
            type: 'info',
            text1: 'App token secured',
            position: 'bottom',
            swipeable: true
          });
        }
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  useEffect(() => {

    if (isReady && !loading) {
      if (user) {
        setUserState(user)
        
        router.replace('/(tabs)')
          
      } else {
        setUserState(null)
        router.replace('/(auth)');
      }
    }
    else if(isReady && !user){
      router.replace('/(auth)')
    }
  }, [isReady, user, loading]);

  useEffect(() => {
    
    if(!usagePermissionGranted){
      requestUsageStatsPermission()
    }
    else if(usagePermissionGranted && user){
      saveExpoToken(user)
          .then((expoPushToken:any)=>{
            if(expoPushToken){
              Toast.show({type:'info',text1:'App token secured',position:'bottom', swipeable:true})
            }
            
          })
          .finally(()=>{
            router.replace('/(tabs)');
          })
    }
  }, [usagePermissionGranted,user])
  


  if (!isReady && loading) {
    return <LoadingScreen />;
  }
  if(isReady && !user){
    router.replace('/(auth)');
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='(auth)' options={{headerTitle:"AUthentication", headerTitleAlign:'center'}}/>
        <Stack.Screen name="(tabs)" options={{ headerShown:false}}/>
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
};
