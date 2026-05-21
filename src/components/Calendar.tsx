import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, monthNames, weekDays } from '../theme';
import { Show, CalendarDay } from '../models';

interface CalendarProps {
  currentYear: number;
  currentMonth: number;
  days: CalendarDay[];
  selectedDate: string | null;
  onSelectDay: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function Calendar({
  currentYear, currentMonth, days, selectedDate,
  onSelectDay, onPrevMonth, onNextMonth, onToday,
}: CalendarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth - 1]} {currentYear}
        </Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onToday} style={styles.todayBtn}>
        <Text style={styles.todayText}>Hoje</Text>
      </TouchableOpacity>

      <View style={styles.weekRow}>
        {weekDays.map(d => (
          <View key={d} style={styles.weekCell}>
            <Text style={styles.weekText}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day, i) => {
          const isSelected = day.date === selectedDate;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellDim,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => onSelectDay(day.date)}
            >
              <View style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                <Text style={[styles.dayText, !day.isCurrentMonth && styles.dayTextDim]}>
                  {day.day}
                </Text>
              </View>
              {day.shows.length > 0 && (
                <View style={styles.eventsContainer}>
                  {day.shows.slice(0, 2).map((s, j) => (
                    <View key={j} style={styles.eventDot}>
                      <Text style={styles.eventDotText} numberOfLines={1}>
                        {s.contratanteNome}
                      </Text>
                    </View>
                  ))}
                  {day.shows.length > 2 && (
                    <Text style={styles.moreText}>+{day.shows.length - 2}</Text>
                  )}
                </View>
              )}
              {day.shows.length === 0 && day.isCurrentMonth && (
                <Text style={styles.livreText}>Livre</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, gap: 20,
  },
  navBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 28, color: colors.text, lineHeight: 30 },
  monthTitle: { fontSize: 17, fontWeight: '700', color: colors.text, minWidth: 180, textAlign: 'center' },
  todayBtn: { alignItems: 'center', marginBottom: 12 },
  todayText: { fontSize: 13, color: colors.primaryLight, fontWeight: '600' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  weekText: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%', aspectRatio: 0.9, padding: 2,
    borderWidth: 1, borderColor: 'transparent', borderRadius: 8,
  },
  dayCellDim: { opacity: 0.35 },
  dayCellSelected: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.08)' },
  dayNumber: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  dayNumberSelected: { backgroundColor: colors.primary },
  dayText: { fontSize: 12, fontWeight: '600', color: colors.text },
  dayTextDim: { color: colors.textMuted },
  eventsContainer: { gap: 1 },
  eventDot: {
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  eventDotText: { fontSize: 8, color: colors.primaryLight, fontWeight: '500' },
  moreText: { fontSize: 8, color: colors.textMuted, textAlign: 'center' },
  livreText: { fontSize: 8, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
});
