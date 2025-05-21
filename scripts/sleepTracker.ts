import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

const BACKGROUND_TASK_NAME = "sleep-tracking-task";

const isWithinSleepHours = () => {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 16 || hours < 10; // 4 PM to 10 AM
};

const trackAppState = async () => {
  let lastInactiveTime: string | null = await AsyncStorage.getItem(
    "lastInactiveTime"
  );

  AppState.addEventListener("change", async (nextAppState) => {
    if (!isWithinSleepHours()) return;

    if (nextAppState === "background") {
      lastInactiveTime = new Date().toISOString();
      await AsyncStorage.setItem("lastInactiveTime", lastInactiveTime);
    } else if (nextAppState === "active") {
      if (!lastInactiveTime) return;

      const lastInactive = new Date(lastInactiveTime);
      const now = new Date();
      const hoursSlept =
        (now.getTime() - lastInactive.getTime()) / (1000 * 60 * 60);

      if (hoursSlept > 2) {
        console.log(`Estimated Sleep: ${hoursSlept.toFixed(2)} hours`);
        await AsyncStorage.setItem("lastSleepDuration", hoursSlept.toFixed(2));
      }
    }
  });
};

TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
  console.log("error", error);
  if (!isWithinSleepHours()) {
    console.log("Skipping background task: Outside sleep tracking hours.");
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  console.log("Running background sleep tracking...");
  await trackAppState();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerSleepTracking() {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    console.log("Background fetch is disabled");
    return;
  }

  console.log("Background fetch status:", status);
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_TASK_NAME
  );
  if (isRegistered) {
    console.log(isRegistered);
    console.log("Sleep tracking is already registered.");
    return;
  }

  await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 5,
    stopOnTerminate: false,
    startOnBoot: true,
  })
    .then(() => {
      console.log("Sleep tracking registered successfully!");
    })
    .catch((error) => {
      console.error("Failed to register sleep tracking:", error);
    });
}
