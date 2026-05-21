import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface Field {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}

interface CreateEntityModalProps {
  visible: boolean;
  title: string;
  fields: Field[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}

export function CreateEntityModal({ visible, title, fields, onClose, onSubmit }: CreateEntityModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    onSubmit(values);
    setValues({});
  };

  const handleClose = () => {
    setValues({});
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          {fields.map(f => (
            <View key={f.key} style={styles.fieldContainer}>
              <Text style={styles.label}>
                {f.label} {f.required && <Text style={styles.required}>*</Text>}
              </Text>
              <TextInput
                style={styles.input}
                value={values[f.key] ?? ''}
                onChangeText={t => setValues(prev => ({ ...prev, [f.key]: t }))}
                placeholder={f.placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={f.type === 'tel' ? 'phone-pad' : f.type === 'email' ? 'email-address' : 'default'}
              />
            </View>
          ))}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: colors.bgAlt2, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.cardBorder },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 20 },
  fieldContainer: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textLabel, textTransform: 'uppercase', marginBottom: 6 },
  required: { color: colors.error },
  input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 10, padding: 14, color: colors.text, fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  cancelText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  submitBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
