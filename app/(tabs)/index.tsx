import { Image, StyleSheet, Platform, View } from 'react-native';
import HomePage from '../(tabs)/HomePage';
import React, { useEffect, useRef } from 'react';
// import * as Notifications from "expo-notifications";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner:true,
//     shouldShowList:true
//   }),
// });

export default function HomeScreen() {

  // const notificationListener = useRef<Notifications.EventSubscription>();
  // const responseListener = useRef<Notifications.EventSubscription>();

  // useEffect(() => {
      
  //     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
  //       // setNotification(notification);
  //     });
  
  //     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  //     });
  
  //     return () => {
  //       notificationListener.current &&
  //         Notifications.removeNotificationSubscription(notificationListener.current);
  //       responseListener.current &&
  //         Notifications.removeNotificationSubscription(responseListener.current);
  //     };
  //   }, []);

  return (
    <View style={styles.container}>
      <HomePage/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
