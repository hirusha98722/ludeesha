import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

// Props for StatBox
interface StatBoxProps {
  icon: ImageSourcePropType;
  value: string | number;
  label: string;
}

const StatBox: React.FC<StatBoxProps> = ({ icon, value, label }) => (
  <View style={styles.statBox}>
    <Image source={icon} style={styles.icon} />
    <View style={styles.textContainer}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  statBox: {
    width: '50%',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row', // Horizontal layout for image + text
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12, // Space between icon and text
  },
  textContainer: {
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // Dark text for visibility
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default StatBox;
