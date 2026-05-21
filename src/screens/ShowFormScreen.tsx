import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet, Alert,
} from 'react-native';
import { colors, FORMAS_PAGAMENTO, ESTILOS_MUSICAIS } from '../theme';
import { Contratante, Local, Show } from '../models';
import { showService } from '../services/showService';
import { contratanteService } from '../services/contratanteService';
import { localService } from '../services/localService';
import { AutocompleteField } from '../components/AutocompleteField';
import { CurrencyInput } from '../components/CurrencyInput';
import { CreateEntityModal } from '../components/CreateEntityModal';

export function ShowFormScreen({ navigation, route }: any) {
  const editId = route?.params?.id ? Number(route.params.id) : null;
  const queryData = route?.params?.data || '';

  const [contratante, setContratante] = useState<Contratante | null>(null);
  const [local, setLocal] = useState<Local | null>(null);
  const [data, setData] = useState(queryData);
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('');
  const [valor, setValor] = useState<number | null>(null);
  const [pago, setPago] = useState(false);
  const [dataPagamento, setDataPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [necessitaNF, setNecessitaNF] = useState(false);
  const [notaEmitida, setNotaEmitida] = useState(false);
  const [estilos, setEstilos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [entityType, setEntityType] = useState<'contratante' | 'local'>('contratante');
  const [entityTerm, setEntityTerm] = useState('');
  const [showPagamentoPicker, setShowPagamentoPicker] = useState(false);

  useEffect(() => {
    if (editId) {
      showService.getById(editId).then(s => {
        setContratante({ id: s.contratanteId, nome: s.contratanteNome, telefone: s.contratanteTelefone } as Contratante);
        setLocal({ id: s.localId, nome: s.localNome, endereco: s.localEndereco } as Local);
        setData(s.data);
        setHora(s.hora);
        setDuracao(s.duracao);
        setValor(s.valorCobrado);
        setPago(s.pago);
        setDataPagamento(s.dataPagamento || '');
        setFormaPagamento(s.formaPagamento);
        setNecessitaNF(s.necessitaNotaFiscal);
        setNotaEmitida(s.notaEmitida);
        setEstilos(s.estilosSolicitados);
      }).catch(e => alert(e.message));
    }
  }, [editId]);

  const validate = () => {
    if (!contratante) return 'Selecione um contratante';
    if (!local) return 'Selecione um local';
    if (!data) return 'Informe a data';
    if (!hora) return 'Informe o horário';
    if (!duracao) return 'Informe a duração';
    if (valor == null || valor < 0) return 'Informe um valor válido';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) { Alert.alert('Erro', error); return; }
    setSubmitting(true);
    try {
      const payload = {
        contratanteId: contratante!.id,
        contratanteNome: contratante!.nome,
        contratanteTelefone: contratante?.telefone,
        localId: local!.id,
        localNome: local!.nome,
        localEndereco: local?.endereco,
        data, hora, duracao,
        valorCobrado: valor!,
        pago,
        dataPagamento: pago ? dataPagamento || undefined : undefined,
        formaPagamento,
        estilosSolicitados: estilos,
        necessitaNotaFiscal: necessitaNF,
        notaEmitida: necessitaNF ? notaEmitida : false,
      } as any;

      if (editId) {
        await showService.update({ ...payload, id: editId } as Show);
      } else {
        await showService.create(payload);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEntityCreate = (type: 'contratante' | 'local', term: string) => {
    setEntityType(type);
    setEntityTerm(term);
    setShowEntityModal(true);
  };

  const handleEntityCreate = async (values: Record<string, string>) => {
    try {
      if (entityType === 'contratante') {
        const c = await contratanteService.create({ nome: values.nome, telefone: values.telefone, email: values.email });
        setContratante(c);
      } else {
        const l = await localService.create({ nome: values.nome, endereco: values.endereco, cidade: values.cidade });
        setLocal(l);
      }
      setShowEntityModal(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  const toggleEstilo = (e: string) => {
    setEstilos(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>{editId ? 'Editar Show' : 'Novo Show'}</Text>

          <AutocompleteField
            label="Contratante"
            placeholder="Buscar contratante..."
            searchFn={contratanteService.search}
            displayField="nome"
            selectedItem={contratante}
            onSelect={setContratante}
            onAddNew={t => openEntityCreate('contratante', t)}
            required
          />

          <AutocompleteField
            label="Local"
            placeholder="Buscar local..."
            searchFn={localService.search}
            displayField="nome"
            selectedItem={local}
            onSelect={setLocal}
            onAddNew={t => openEntityCreate('local', t)}
            required
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Data *</Text>
              <TextInput style={styles.input} value={data} onChangeText={setData} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Horário *</Text>
              <TextInput style={styles.input} value={hora} onChangeText={setHora} placeholder="HH:mm" placeholderTextColor={colors.textMuted} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Duração *</Text>
              <TextInput style={styles.input} value={duracao} onChangeText={setDuracao} placeholder="ex: 3h" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={styles.half}>
              <CurrencyInput label="Valor *" value={valor} onChange={setValor} />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Necessita Nota Fiscal</Text>
            <Switch value={necessitaNF} onValueChange={setNecessitaNF} trackColor={{ false: colors.textMuted, true: colors.primary }} />
          </View>
          {necessitaNF && (
            <View style={styles.switchRow}>
              <Text style={styles.label}>Nota Fiscal Emitida</Text>
              <Switch value={notaEmitida} onValueChange={setNotaEmitida} trackColor={{ false: colors.textMuted, true: colors.primary }} />
            </View>
          )}

          <View style={styles.switchRow}>
            <Text style={styles.label}>Show Pago</Text>
            <Switch value={pago} onValueChange={setPago} trackColor={{ false: colors.textMuted, true: colors.success }} />
          </View>
          {pago && (
            <View>
              <Text style={styles.label}>Data Pagamento</Text>
              <TextInput style={styles.input} value={dataPagamento} onChangeText={setDataPagamento} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textMuted} />
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Forma de Pagamento</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowPagamentoPicker(!showPagamentoPicker)}>
              <Text style={formaPagamento ? styles.pickerText : styles.pickerPlaceholder}>
                {formaPagamento || 'Selecione...'}
              </Text>
            </TouchableOpacity>
            {showPagamentoPicker && (
              <View style={styles.pickerDropdown}>
                {FORMAS_PAGAMENTO.map(f => (
                  <TouchableOpacity key={f} style={styles.pickerItem} onPress={() => { setFormaPagamento(f); setShowPagamentoPicker(false); }}>
                    <Text style={[styles.pickerItemText, f === formaPagamento && styles.pickerItemActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>Estilos Musicais</Text>
            <View style={styles.chipsRow}>
              {ESTILOS_MUSICAIS.map(e => (
                <TouchableOpacity key={e} style={[styles.chip, estilos.includes(e) && styles.chipActive]} onPress={() => toggleEstilo(e)}>
                  <Text style={[styles.chipText, estilos.includes(e) && styles.chipTextActive]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'Salvando...' : editId ? 'Salvar Alterações' : 'Cadastrar Show'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CreateEntityModal
        visible={showEntityModal}
        title={entityType === 'contratante' ? 'Novo Contratante' : 'Novo Local'}
        fields={
          entityType === 'contratante'
            ? [
              { key: 'nome', label: 'Nome', placeholder: 'Nome do contratante', required: true },
              { key: 'telefone', label: 'Telefone', placeholder: '(11) 99999-9999', type: 'tel' },
              { key: 'email', label: 'E-mail', placeholder: 'email@exemplo.com', type: 'email' },
            ]
            : [
              { key: 'nome', label: 'Nome', placeholder: 'Nome do local', required: true },
              { key: 'endereco', label: 'Endereço', placeholder: 'Rua, número, bairro' },
              { key: 'cidade', label: 'Cidade', placeholder: 'Cidade - UF' },
            ]
        }
        onClose={() => setShowEntityModal(false)}
        onSubmit={handleEntityCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: 16, padding: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 10, padding: 14, color: colors.text, fontSize: 16, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pickerBtn: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 10, padding: 14 },
  pickerText: { color: colors.text, fontSize: 16 },
  pickerPlaceholder: { color: colors.textMuted, fontSize: 16 },
  pickerDropdown: { backgroundColor: colors.bgAlt, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 10, marginTop: 4 },
  pickerItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  pickerItemText: { color: colors.textSecondary, fontSize: 15 },
  pickerItemActive: { color: colors.primaryLight, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.inputBorder },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  submitBtn: {
    backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
