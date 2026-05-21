import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface AutocompleteFieldProps<T> {
  label: string;
  placeholder: string;
  searchFn: (term: string) => Promise<T[]>;
  displayField: keyof T;
  selectedItem: T | null;
  onSelect: (item: T | null) => void;
  onAddNew: (term: string) => void;
  initialLabel?: string;
  required?: boolean;
}

export function AutocompleteField<T extends Record<string, any>>({
  label, placeholder, searchFn, displayField,
  selectedItem, onSelect, onAddNew, initialLabel, required,
}: AutocompleteFieldProps<T>) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const search = (q: string) => {
    setTerm(q);
    if (timer.current) clearTimeout(timer.current);
    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchFn(q);
        setResults(data);
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const select = (item: T) => {
    setTerm(item[displayField] ?? '');
    setShowDropdown(false);
    onSelect(item);
  };

  const clear = () => {
    setTerm('');
    onSelect(null);
    setResults([]);
    setShowDropdown(false);
  };

  const displayValue = selectedItem
    ? (selectedItem[displayField] ?? '')
    : initialLabel || '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={selectedItem ? displayValue : term}
          onChangeText={search}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
        />
        {selectedItem && (
          <TouchableOpacity onPress={clear} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading && <Text style={styles.loading}>Buscando...</Text>}
      {showDropdown && (
        <View style={styles.dropdown}>
          {results.length === 0 ? (
            <View style={styles.dropdownItem}>
              <Text style={styles.noResult}>Nenhum encontrado</Text>
              <TouchableOpacity onPress={() => { setShowDropdown(false); onAddNew(term); }}>
                <Text style={styles.addNew}>+ Adicionar novo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            results.map((item, i) => (
              <TouchableOpacity key={i} style={styles.dropdownItem} onPress={() => select(item)}>
                <Text style={styles.dropdownText}>{item[displayField]}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  required: { color: colors.error },
  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: 10, padding: 14, color: colors.text, fontSize: 16, paddingRight: 40,
  },
  clearBtn: { position: 'absolute', right: 12, top: 14 },
  clearText: { color: colors.textMuted, fontSize: 14 },
  loading: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  dropdown: {
    backgroundColor: colors.bgAlt2, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: 10, marginTop: 4, maxHeight: 200,
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  dropdownText: { color: colors.text, fontSize: 15 },
  noResult: { color: colors.textMuted, fontSize: 14, marginBottom: 4 },
  addNew: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
});
