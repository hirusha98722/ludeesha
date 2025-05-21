import { StyleSheet, View, Platform, Image } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import SleepPredictionScreen from './SleepPredictionScreen';

export default function MySleepPredictionsScreen() {
  return (
    <View style={styles.container}>
      <SleepPredictionScreen /> {/* Call the SleepPredictionScreen */}
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
