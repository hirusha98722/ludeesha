import { SleepRecord } from "@/app/(tabs)/SleepPredictionScreen";

export const predictSleepDuration = (sleepRecords: SleepRecord[]): number[] => {
  // If we don't have at least 5 records, we can't predict
  if (sleepRecords.length < 5) {
    console.log("Not enough data to predict");
    return [];
  }

  // Step 1: Get the last 5 records
  const last5Days = sleepRecords.slice(0, 5);

  // Step 2: Prepare the data for linear regression
  const x = last5Days.map((_, index) => index); // [0, 1, 2, 3, 4]
  const y = last5Days.map((record) => record.sleepDuration); // Sleep durations of last 5 days

  // Step 3: Calculate the slope and intercept for the linear regression
  const { slope, intercept } = linearRegression(x, y);

  // Step 4: Predict the next 5 days using the linear regression model
  const predictions = [];
  for (let i = 5; i < 7; i++) {
    let predictedValue = slope * i + intercept;
    predictedValue = Math.abs(Math.round(predictedValue));
    predictions.push(Math.round(predictedValue)); // Round to the nearest integer
  }

  return predictions;
};

// Linear regression function to calculate slope and intercept
const linearRegression = (x: number[], y: number[]) => {
  const n = x.length;
  const xSum = x.reduce((acc, val) => acc + val, 0);
  const ySum = y.reduce((acc, val) => acc + val, 0);
  const xySum = x.reduce((acc, val, idx) => acc + val * y[idx], 0);
  const xSquaredSum = x.reduce((acc, val) => acc + val * val, 0);

  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  return { slope, intercept };
};
