import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface CurrencyInputProps {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
  placeholder?: string;
}

export function CurrencyInput({ value, onChange, label, placeholder }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const display = value != null
    ? `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
    : '';

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (!digits) { onChange(null); return; }
    const v = parseInt(digits, 10) / 100;
    onChange(v);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        value={focused && value != null ? value.toFixed(2).replace('.', ',') : display}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder || 'R$ 0,00'}
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    fontSize: 16,
  },
  inputFocused: { borderColor: colors.primary },
});
