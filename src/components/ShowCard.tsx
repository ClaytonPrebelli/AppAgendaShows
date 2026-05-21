import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { Show } from '../models';

interface ShowCardProps {
  show: Show;
  onTogglePago: (id: number) => void;
  onPress: (show: Show) => void;
}

export function ShowCard({ show, onTogglePago, onPress }: ShowCardProps) {
  const formatBRL = (v: number) =>
    `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(show)} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.headerRow}>
            <Text style={styles.contratante}>{show.contratanteNome}</Text>
            <View style={[styles.badge, show.pago ? styles.badgePago : styles.badgePendente]}>
              <Text style={[styles.badgeText, { color: show.pago ? colors.success : colors.warning }]}>
                {show.pago ? 'PAGO' : show.dataPagamento ? 'RECEBER' : 'AGENDADO'}
              </Text>
            </View>
          </View>
          <Text style={styles.local}>{show.localNome}</Text>
          <Text style={styles.time}>{show.hora} · {show.duracao}</Text>
          <Text style={styles.value}>{formatBRL(show.valorCobrado)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, show.pago && styles.toggleBtnActive]}
          onPress={() => onTogglePago(show.id)}
        >
          <Text style={[styles.toggleIcon, show.pago && styles.toggleIconActive]}>
            {show.pago ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flex: 1, marginRight: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  contratante: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgePago: { backgroundColor: colors.successBg },
  badgePendente: { backgroundColor: 'rgba(251,191,36,0.15)' },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  local: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  time: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '700', color: colors.purple },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: { borderColor: colors.success },
  toggleIcon: { fontSize: 18, color: colors.textMuted },
  toggleIconActive: { color: colors.success },
});
