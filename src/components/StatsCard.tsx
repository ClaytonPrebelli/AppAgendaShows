import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface StatsCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatsCard({ label, value, color = colors.primaryLight }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  value: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 11, color: colors.textLabel, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
});
