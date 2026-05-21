import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: { label: string; onPress: () => void };
  rightAction?: { label: string; onPress: () => void };
}

export function Header({ title, subtitle, leftAction, rightAction }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {leftAction && (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.actionBtn}>
            <Text style={styles.actionText}>{leftAction.label}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.actionBtn}>
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { fontSize: 14, color: colors.primaryLight, fontWeight: '600' },
});
