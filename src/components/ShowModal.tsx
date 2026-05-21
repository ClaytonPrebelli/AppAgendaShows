import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Switch, StyleSheet,
} from 'react-native';
import { colors, FORMAS_PAGAMENTO, ESTILOS_MUSICAIS } from '../theme';
import { Show } from '../models';
import { showService } from '../services/showService';
import { Contratante } from '../models';
import { Local } from '../models';
import { contratanteService } from '../services/contratanteService';
import { localService } from '../services/localService';
import { AutocompleteField } from './AutocompleteField';
import { CurrencyInput } from './CurrencyInput';
import { CreateEntityModal } from './CreateEntityModal';

interface ShowModalProps {
  visible: boolean;
  mode: 'add' | 'view';
  date?: string;
  show?: Show | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ShowModal({ visible, mode, date, show, onClose, onSaved }: ShowModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [contratante, setContratante] = useState<Contratante | null>(null);
  const [local, setLocal] = useState<Local | null>(null);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('');
  const [valor, setValor] = useState<number | null>(null);
  const [pago, setPago] = useState(false);
  const [dataPagamento, setDataPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [necessitaNF, setNecessitaNF] = useState(false);
  const [notaEmitida, setNotaEmitida] = useState(false);
  const [estilos, setEstilos] = useState<string[]>([]);

  const [showEntityModal, setShowEntityModal] = useState(false);
  const [entityType, setEntityType] = useState<'contratante' | 'local'>('contratante');
  const [entityTerm, setEntityTerm] = useState('');

  const [showPagamentoPicker, setShowPagamentoPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === 'add' && date) {
        setData(date);
      }
      if (show && mode === 'view') {
        setContratante({ id: show.contratanteId, nome: show.contratanteNome, telefone: show.contratanteTelefone } as Contratante);
        setLocal({ id: show.localId, nome: show.localNome, endereco: show.localEndereco } as Local);
        setData(show.data);
        setHora(show.hora);
        setDuracao(show.duracao);
        setValor(show.valorCobrado);
        setPago(show.pago);
        setDataPagamento(show.dataPagamento || '');
        setFormaPagamento(show.formaPagamento);
        setNecessitaNF(show.necessitaNotaFiscal);
        setNotaEmitida(show.notaEmitida);
        setEstilos(show.estilosSolicitados);
      }
    }
  }, [visible]);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const validate = () => {
    if (!contratante) return 'Selecione um contratante';
    if (!local) return 'Selecione um local';
    if (!data) return 'Informe a data';
    if (!hora) return 'Informe o horário';
    if (!duracao) return 'Informe a duração';
    if (valor == null || valor < 0) return 'Informe um valor válido';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) { alert(error); return; }
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

      if (show) {
        await showService.update({ ...payload, id: show.id, createdAt: show.createdAt } as Show);
      } else {
        await showService.create(payload);
      }
      setIsEditing(false);
      onSaved();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePago = async () => {
    if (!show) return;
    try {
      await showService.togglePago(show.id);
      onSaved();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async () => {
    if (!show) return;
    try {
      await showService.delete(show.id);
      onSaved();
    } catch (e: any) {
      alert(e.message);
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
      alert(e.message);
    }
  };

  const toggleEstilo = (e: string) => {
    setEstilos(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  if (mode === 'view' && !isEditing && show) {
    const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <ScrollView style={styles.modal}>
            <View style={styles.modalContent}>
              <View style={styles.viewHeader}>
                <Text style={styles.viewTitle}>{show.contratanteNome}</Text>
                <View style={[styles.statusBadge, show.pago ? styles.bgSuccess : styles.bgWarning]}>
                  <Text style={[styles.statusText, { color: show.pago ? colors.success : colors.warning }]}>
                    {show.pago ? 'PAGO' : show.dataPagamento ? 'RECEBER' : 'AGENDADO'}
                  </Text>
                </View>
              </View>

              {[
                ['Contratante', show.contratanteNome],
                ['Local', show.localNome],
                ['Endereço', show.localEndereco],
                ['Telefone', show.contratanteTelefone],
                ['Data', show.data],
                ['Horário', show.hora],
                ['Duração', show.duracao],
                ['Valor', formatBRL(show.valorCobrado)],
                ['Data Pagamento', show.dataPagamento],
                ['Forma Pagamento', show.formaPagamento],
              ].map(([l, v]) => v ? (
                <View key={l} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{l}</Text>
                  <Text style={styles.detailValue}>{v}</Text>
                </View>
              ) : null)}

              {show.estilosSolicitados.length > 0 && (
                <View style={styles.tagsRow}>
                  {show.estilosSolicitados.map(e => (
                    <View key={e} style={styles.tag}><Text style={styles.tagText}>{e}</Text></View>
                  ))}
                </View>
              )}

              {show.necessitaNotaFiscal && (
                <Text style={styles.nfText}>
                  {show.notaEmitida ? '✓ Nota fiscal emitida' : '⏳ Nota fiscal pendente'}
                </Text>
              )}

              <View style={styles.viewActions}>
                <TouchableOpacity onPress={handleTogglePago} style={[styles.btn, show.pago ? styles.btnWarning : styles.btnSuccess]}>
                  <Text style={styles.btnText}>{show.pago ? 'Reverter Pagamento' : 'Marcar como Pago'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.btn, styles.btnPrimary]}>
                  <Text style={styles.btnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={[styles.btn, styles.btnDanger]}>
                  <Text style={styles.btnText}>Excluir</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClose} style={[styles.btn, styles.btnGhost]}>
                  <Text style={styles.ghostText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {mode === 'add' ? 'Novo Show' : 'Editar Show'}
            </Text>

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

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Estilos Musicais</Text>
              <View style={styles.chipsRow}>
                {ESTILOS_MUSICAIS.map(e => (
                  <TouchableOpacity key={e} style={[styles.chip, estilos.includes(e) && styles.chipActive]} onPress={() => toggleEstilo(e)}>
                    <Text style={[styles.chipText, estilos.includes(e) && styles.chipTextActive]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.viewActions}>
              <TouchableOpacity onPress={handleSave} style={[styles.btn, styles.btnPrimary]} disabled={submitting}>
                <Text style={styles.btnText}>{submitting ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.ghostText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: colors.bgAlt2, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, maxHeight: '90%' },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
  viewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  viewTitle: { fontSize: 20, fontWeight: '700', color: colors.text, flex: 1 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  bgSuccess: { backgroundColor: colors.successBg },
  bgWarning: { backgroundColor: 'rgba(251,191,36,0.15)' },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  detailLabel: { fontSize: 13, color: colors.textLabel },
  detailValue: { fontSize: 13, color: colors.text, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, marginBottom: 8 },
  tag: { backgroundColor: colors.purpleTag, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: colors.primaryLight },
  nfText: { fontSize: 13, color: colors.primaryLight, marginVertical: 8 },
  viewActions: { gap: 10, marginTop: 20 },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnSuccess: { backgroundColor: colors.successBg },
  btnWarning: { backgroundColor: 'rgba(251,191,36,0.15)' },
  btnDanger: { backgroundColor: colors.errorBg },
  btnGhost: { borderWidth: 1, borderColor: colors.cardBorder },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  ghostText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
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
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.inputBorder,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
