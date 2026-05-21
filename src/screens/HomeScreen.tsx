import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Image } from 'react-native';
import { colors, monthNames } from '../theme';
import { Show, CalendarDay, Stats, PeriodGroup } from '../models';
import { showService } from '../services/showService';
import { Calendar } from '../components/Calendar';
import { StatsCard } from '../components/StatsCard';
import { ShowCard } from '../components/ShowCard';
import { ShowModal } from '../components/ShowModal';

export function HomeScreen({ navigation }: any) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [showsByDate, setShowsByDate] = useState<Map<string, Show[]>>(new Map());
  const [selectedDayShows, setSelectedDayShows] = useState<Show[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view'>('add');
  const [modalDate, setModalDate] = useState<string | undefined>();
  const [modalShow, setModalShow] = useState<Show | null>(null);

  const formatDateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const getPeriod = (hora: string): string => {
    const h = parseInt(hora.split(':')[0], 10);
    if (h >= 6 && h < 12) return 'manha';
    if (h >= 12 && h < 18) return 'tarde';
    return 'noite';
  };

  const buildShowsByDate = (showsList: Show[]) => {
    const map = new Map<string, Show[]>();
    showsList.forEach(s => {
      const existing = map.get(s.data) || [];
      existing.push(s);
      map.set(s.data, existing);
    });
    setShowsByDate(map);
    return map;
  };

  const buildCalendar = (y: number, m: number, showsMap: Map<string, Show[]>) => {
    const today = new Date();
    const todayStr = formatDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const firstDay = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const prevMonth = m === 1 ? 12 : m - 1;
    const prevYear = m === 1 ? y - 1 : y;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

    const days: CalendarDay[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = formatDateKey(prevYear, prevMonth, d);
      days.push({ date, day: d, isCurrentMonth: false, isToday: false, shows: showsMap.get(date) || [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = formatDateKey(y, m, d);
      days.push({ date, day: d, isCurrentMonth: true, isToday: date === todayStr, shows: showsMap.get(date) || [] });
    }

    const remaining = 42 - days.length;
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? y + 1 : y;
    for (let d = 1; d <= remaining; d++) {
      const date = formatDateKey(nextYear, nextMonth, d);
      days.push({ date, day: d, isCurrentMonth: false, isToday: false, shows: showsMap.get(date) || [] });
    }

    setCalendarDays(days);

    if (!selectedDate || !days.some(d => d.date === selectedDate)) {
      setSelectedDate(todayStr);
    }
  };

  const load = useCallback(async (mes?: number, ano?: number) => {
    try {
      const data = await showService.list(mes ?? currentMonth, ano ?? currentYear);
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setShows(data);
      const map = buildShowsByDate(data);
      buildCalendar(ano ?? currentYear, mes ?? currentMonth, map);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentMonth, currentYear, selectedDate]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dayShows = showsByDate.get(selectedDate) || [];
      dayShows.sort((a, b) => a.hora.localeCompare(b.hora));
      setSelectedDayShows(dayShows);
    }
  }, [selectedDate, showsByDate]);

  const onRefresh = () => {
    setRefreshing(true);
    load(currentMonth, currentYear);
  };

  const goToPrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 1) { setCurrentYear(y => y - 1); return 12; }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 12) { setCurrentYear(y => y + 1); return 1; }
      return prev + 1;
    });
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  useEffect(() => {
    const map = buildShowsByDate(shows);
    buildCalendar(currentYear, currentMonth, map);
  }, [currentYear, currentMonth]);

  const stats: Stats = {
    total: shows.length,
    pagos: shows.filter(s => s.pago).length,
    pendentes: shows.filter(s => !s.pago).length,
    receita: shows.filter(s => s.pago).reduce((acc, s) => acc + s.valorCobrado, 0),
  };

  const monthShows = shows.filter(s => {
    const parts = s.data.split('-');
    return parseInt(parts[0], 10) === currentYear && parseInt(parts[1], 10) === currentMonth;
  });
  const receitaTotal = monthShows.reduce((a, s) => a + s.valorCobrado, 0);
  const receitaRecebida = monthShows.filter(s => s.pago).reduce((a, s) => a + s.valorCobrado, 0);

  const formatBRL = (v: number) =>
    `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  const formatDayHeader = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${weekDays[dt.getDay()]} - ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  };

  const buildDayGroups = (): PeriodGroup[] => {
    const groups: PeriodGroup[] = [
      { label: 'Manhã', shows: [] },
      { label: 'Tarde', shows: [] },
      { label: 'Noite', shows: [] },
    ];
    selectedDayShows.forEach(s => {
      const period = getPeriod(s.hora);
      if (period === 'manha') groups[0].shows.push(s);
      else if (period === 'tarde') groups[1].shows.push(s);
      else groups[2].shows.push(s);
    });
    return groups.filter(g => g.shows.length > 0);
  };

  const openAddShow = (date?: string) => {
    setModalMode('add');
    setModalDate(date);
    setModalShow(null);
    setModalVisible(true);
  };

  const openViewShow = (show: Show) => {
    setModalMode('view');
    setModalDate(undefined);
    setModalShow(show);
    setModalVisible(true);
  };

  const handleCellClick = (date: string) => {
    const dayShows = showsByDate.get(date) || [];
    setSelectedDate(date);
    if (dayShows.length === 0) {
      openAddShow(date);
    }
  };

  const handleSaved = () => {
    setModalVisible(false);
    load(currentMonth, currentYear);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryLight} />}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.hero}>
          <Image source={require('../../assets/logo.png')} style={styles.heroLogo} resizeMode="contain" />
          <Text style={styles.heroTitle}>Agenda de Shows</Text>
          <Text style={styles.heroSub}>Gerencie sua agenda de apresentações</Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => openAddShow(undefined)}>
            <Text style={styles.heroBtnText}>+ Cadastrar Novo Show</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatsCard label="Total" value={stats.total} color={colors.primaryLight} />
          <StatsCard label="Pagos" value={stats.pagos} color={colors.success} />
          <StatsCard label="Pendentes" value={stats.pendentes} color={colors.warning} />
        </View>

        <View style={styles.statsRow}>
          <StatsCard label="Receita Mês" value={formatBRL(receitaTotal)} color={colors.purple} />
          <StatsCard label="Recebido" value={formatBRL(receitaRecebida)} color={colors.success} />
          <StatsCard label="A Receber" value={formatBRL(receitaTotal - receitaRecebida)} color={colors.warning} />
        </View>

        <View style={styles.sectionCard}>
          <Calendar
            currentYear={currentYear}
            currentMonth={currentMonth}
            days={calendarDays}
            selectedDate={selectedDate}
            onSelectDay={handleCellClick}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            onToday={goToToday}
          />
        </View>

        {selectedDate && (
          <View style={styles.sectionCard}>
            <View style={styles.dayHeaderRow}>
              <Text style={styles.dayHeader}>{formatDayHeader(selectedDate)}</Text>
              <Text style={styles.dayCount}>{selectedDayShows.length} show(s)</Text>
            </View>
            <TouchableOpacity style={styles.addShowBtn} onPress={() => openAddShow(selectedDate)}>
              <Text style={styles.addShowText}>+ Novo Show neste dia</Text>
            </TouchableOpacity>

            {selectedDayShows.length === 0 && (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyTitle}>Esta data está livre!</Text>
                <Text style={styles.emptySub}>Clique acima para agendar um show</Text>
              </View>
            )}

            {buildDayGroups().map(group => (
              <View key={group.label}>
                <Text style={styles.periodTitle}>{group.label}</Text>
                {group.shows.map(s => (
                  <ShowCard
                    key={s.id}
                    show={s}
                    onTogglePago={async (id) => {
                      try {
                        await showService.togglePago(id);
                        load(currentMonth, currentYear);
                      } catch (e: any) { alert(e.message); }
                    }}
                    onPress={openViewShow}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ShowModal
        visible={modalVisible}
        mode={modalMode}
        date={modalDate}
        show={modalShow}
        onClose={() => setModalVisible(false)}
        onSaved={handleSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 32 },
  hero: { padding: 20, alignItems: 'center' },
  heroLogo: { width: 80, height: 80, marginBottom: 12, borderRadius: 20 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  heroSub: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  heroBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 12,
  },
  heroBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 12 },
  sectionCard: {
    marginHorizontal: 12, marginBottom: 16,
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: 16, padding: 16,
  },
  dayHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayHeader: { fontSize: 16, fontWeight: '700', color: colors.text },
  dayCount: { fontSize: 13, color: colors.textSecondary },
  addShowBtn: { alignSelf: 'flex-start', marginBottom: 12 },
  addShowText: { fontSize: 14, color: colors.primaryLight, fontWeight: '600' },
  emptyDay: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  periodTitle: { fontSize: 14, fontWeight: '700', color: colors.textLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
});
