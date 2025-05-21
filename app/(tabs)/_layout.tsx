import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import AccountScreen from "./account";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from ".";
import SettingScreen from "./settings";
import AboutScreen from "./about";
import { createStackNavigator } from "@react-navigation/stack";
import BestBedTimeScreen from "./best_bed_time";
import MoodTrackerScreen from './scan_my_face';
import MySleepPredictionsScreen from "./my_sleep_preditions";
import SleepInterventionScreen from "./sleep_intervention";
import SleepInterventionHistoryScreen from "./sleep_intervention_history";
import HelpScreen from "./help";
import SleepRecommendationScreen from "./SleepRecommendationScreen";
import StakeSociety from "./StakeSociety";
import CameraScreen from "./CameraScreen";
import MoodDetailScreen from "./MoodDetailScreen";
import MoodHistory from "./MoodHistory";
import SleepRecordScreen from "./SleepRecordScreen";
import MoodCamera from "./MoodCamera";
import MoodIntevention from "./MoodIntevention";
import { useAuthContext } from "@/context/hooks/use-auth-context";
import { useRouter } from "expo-router";


const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();



const getIconName = (routeName: string): keyof typeof Ionicons.glyphMap => {
  switch (routeName) {
    case "Home":
      return "home";
    case "Account":
      return "person";
    case "Best Bed Time":
      return "bed";
    case "Scan My Face":
      return "camera";
    case "My Sleep Predictions":
      return "moon";
    case "Sleep Intervention":
      return "alarm";
    case "Settings":
      return "settings";
    case "About":
      return "information-circle";
    case "Help":
      return "help-circle";
    default:
      return "help-circle";
  }
};

function BottomTabs({ navigation }: any) {
  const route = useRoute();

  useEffect(() => {
    navigation.setOptions({ title: route.name });
  }, [route.name]);

  useEffect(() => {
    navigation.setOptions({ title: route.name });
  }, [route.name]);

  const hideTabs = [
    "Scan My Face",
    "My Sleep Predictions",
    "Sleep Intervention",
    "Best Bed Time",
    "Help",
  ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={getIconName(route.name)} size={size} color={color} />
        ),
        headerShown: false,
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "white",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Best Bed Time" component={BestBedTimeScreen} />
      <Tab.Screen
        name="Scan My Face"
        component={MoodTrackerScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="My Sleep Predictions"
        component={MySleepPredictionsScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="Record Sleep Time"
        component={SleepRecordScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="Stake Society"
        component={StakeSociety}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="SleepRecommendation"
        component={SleepRecommendationScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="Sleep Intervention"
        component={SleepInterventionScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="Sleep Intervention History"
        component={SleepInterventionHistoryScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen name="Settings" component={SettingScreen} />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="Help"
        component={HelpScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="MoodDetailScreen"
        component={MoodDetailScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="MoodHistory"
        component={MoodHistory}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
    </Tab.Navigator >
  );
}

const MoodTrackerStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MoodTracker"
        component={MoodTrackerScreen}
        options={{ headerTitle: "Scan My Face" }}
      />
      <Stack.Screen name="MoodCamera" component={MoodCamera} />
      <Stack.Screen name="MoodDetailScreen" component={MoodDetailScreen} />
      <Stack.Screen name="MoodHistory" component={MoodHistory} />
      <Stack.Screen name="MoodIntevention" component={MoodIntevention} />


    </Stack.Navigator>
  );
};

function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Home"
        component={BottomTabs}
        options={{
          drawerLabel: "Home",
        }}
      />
      <Drawer.Screen
        name="Account"
        component={BottomTabs}
        initialParams={{ screen: "Account" }}
        options={{
          drawerLabel: "Account",
        }}
      />
      <Drawer.Screen
        name="Best Bed Time"
        component={BottomTabs}
        initialParams={{ screen: "Best Bed Time" }}
        options={{
          drawerLabel: "Best Bed Time",
        }}
      />
      <Drawer.Screen
        name="Scan My Face"
        component={MoodTrackerStack}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="My Sleep Predictions"
        component={BottomTabs}
        initialParams={{ screen: "My Sleep Predictions" }}
        options={{
          drawerLabel: "My Sleep Predictions",
        }}
      />
      <Drawer.Screen
        name="Record Sleep Time"
        component={BottomTabs}
        initialParams={{ screen: "Record Sleep Time" }}
        options={{
          drawerLabel: "Record Sleep Time",
        }}
      />
      <Drawer.Screen
        name="Stake Society"
        component={BottomTabs}
        initialParams={{ screen: "Stake Society" }}
        options={{
          drawerLabel: "Stake Society",
        }}
      />
      <Drawer.Screen
        name="Sleep Intervention"
        component={BottomTabs}
        initialParams={{ screen: "Sleep Intervention" }}
        options={{
          drawerLabel: "Sleep Intervention",
        }}
      />
       <Drawer.Screen
        name="Sleep Intervention History"
        component={BottomTabs}
        initialParams={{ screen: "Sleep Intervention History" }}
        options={{
          drawerLabel: "Sleep Intervention History",
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={BottomTabs}
        initialParams={{ screen: "Settings" }}
        options={{
          drawerLabel: "Setting",
        }}
      />
      <Drawer.Screen
        name="About"
        component={BottomTabs}
        initialParams={{ screen: "About" }}
        options={{
          drawerLabel: "About",
        }}
      />
      <Drawer.Screen
        name="Help"
        component={BottomTabs}
        initialParams={{ screen: "Help" }}
        options={{
          drawerLabel: "Help",
        }}

      />
    </Drawer.Navigator>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  

  const {user} = useAuthContext()


    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={DrawerNavigator} />
        </Stack.Navigator>
      );

}
