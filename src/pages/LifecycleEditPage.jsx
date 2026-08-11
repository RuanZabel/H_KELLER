import { ArrowRight, BarChart3, Brain, Camera, Heart, Info, PawPrint, RefreshCw, Shield, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext.jsx';

const iconOptions = [RefreshCw, PawPrint, Heart, Brain, Shield, Users, Star];
const colors = [{ name: 'Verde sálvia', value: '#78ad7d' }, { name: 'Verde floresta', value: '#176232' }, { name: 'Azul sereno', value: '#4779ad' }, { name: 'Âmbar', value: '#c48b1e' }];

export default function LifecycleEditPage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { lifecycleCycles, updateLifecycleCycle, toggleLifecycleCycle } = useConfig();
  const cycle = lifecycleCycles.find((entry) => entry.id === cycleId);
  const position = lifecycleCycles.findIndex((entry) => entry.id === cycleId);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(() => cycle ? {
    ...cycle,
    description: cycle.description || `Período de ${cycle.name.toLowerCase()} do cão, com acompanhamento da equipe responsável.`,
    columnName: cycle.columnName || cycle.name,
    icon: cycle.icon ?? 5,
    color: cycle.color || '#78ad7d',
    duration: cycle.duration || 12,
    durationUnit: cycle.durationUnit || 'meses',
    entryRule: cycle.entryRule || (position > 0 ? `Ao concluir ${lifecycleCycles[position - 1].name}` : 'Ao cadastrar o cão'),
    nextCycle: cycle.nextCycle || lifecycleCycles[position + 1]?.id || '',
    showInRecord: cycle.showInRecord !== false,
    requireConfirmation: cycle.requireConfirmation !== false,
    alertPending: cycle.alertPending !== false
  } : null);

  if (!cycle || !form) return <section className="screen"><h2>Ciclo não encontrado</h2><button onClick={() => navigate('/config/ciclos')}>Voltar aos ciclos</button></section>;
  const update = (field, value) => { setSaved(false); setForm((current) => ({ ...current, [field]: value })); };
  const save = (event) => { event.preventDefault(); updateLifecycleCycle(cycle.id, form); setSaved(true); };

  return <form className="screen lifecycle-edit-screen animate-in" onSubmit={save}>
    <nav className="items-breadcrumb"><button type="button" onClick={() => navigate('/config/ciclos')}>← Configurações</button><span>/</span><button type="button" onClick={() => navigate('/config/ciclos')}>Ciclos do ciclo de vida</button><span>/</span><strong>{cycle.name}</strong><span>/</span><b>Editar</b></nav>
    <header className="lifecycle-edit-heading"><div><h2>Editar ciclo</h2><p>Atualize os dados da fase {cycle.name}.</p></div><button type="button" className="ghost-action" onClick={() => navigate('/config/ciclos')}>Cancelar</button></header>
    <section className="edit-cycle-summary"><div className="cycle-item-symbol" style={{ color: form.color, borderColor: form.color }}><Users size={34} /></div><div><h3>{form.name} <span className={`cycle-status ${form.active ? 'active' : 'inactive'}`}>{form.active ? 'Ativo' : 'Inativo'}</span><small>Posição {position + 1} no Kanban</small></h3><p>{form.description}</p><span>{form.items.length} itens configurados</span></div><button type="button" onClick={() => navigate(`/config/ciclos/${cycle.id}/itens`)}>Gerenciar itens ({form.items.length}) <ArrowRight size={18} /></button></section>
    <section className="lifecycle-edit-card">
      <fieldset><legend>Identificação</legend><div className="edit-identification"><label><span>Nome do ciclo/fase *</span><input required value={form.name} onChange={(e) => update('name', e.target.value)} /></label><label><span>Descrição</span><textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></label><div className="icon-color-field"><span>Ícone</span><div className="cycle-icon-options">{iconOptions.map((Icon, index) => <button type="button" className={form.icon === index ? 'active' : ''} onClick={() => update('icon', index)} key={index}><Icon size={18} /></button>)}</div><label><span>Cor de identificação</span><select value={form.color} onChange={(e) => update('color', e.target.value)}>{colors.map((color) => <option value={color.value} key={color.value}>{color.name}</option>)}</select></label></div></div></fieldset>
      <fieldset><legend>Comportamento no fluxo</legend><div className="edit-flow-grid"><label><span>Posição no Kanban *</span><select value={position} disabled><option>{position + 1} — posição atual</option></select><Toggle checked={form.usedInKanban} onChange={(value) => update('usedInKanban', value)} label="Exibir no Kanban" /></label><label><span>Nome da coluna no Kanban *</span><input required value={form.columnName} onChange={(e) => update('columnName', e.target.value)} /><Toggle checked={form.showInRecord} onChange={(value) => update('showInRecord', value)} label="Exibir no cadastro do cão" /></label><label><span>Responsável padrão *</span><input required value={form.responsible} onChange={(e) => update('responsible', e.target.value)} /></label><label><span>Prazo sugerido</span><div className="duration-input"><input type="number" min="1" value={form.duration} onChange={(e) => update('duration', e.target.value)} /><select value={form.durationUnit} onChange={(e) => update('durationUnit', e.target.value)}><option>dias</option><option>meses</option><option>anos</option></select></div></label></div></fieldset>
      <fieldset><legend>Regras de transição</legend><div className="transition-grid"><label><span>Entrada nesta fase</span><input value={form.entryRule} onChange={(e) => update('entryRule', e.target.value)} /></label><label><span>Próximo ciclo</span><select value={form.nextCycle} onChange={(e) => update('nextCycle', e.target.value)}><option value="">Encerrar ciclo de vida</option>{lifecycleCycles.filter((entry) => entry.id !== cycle.id).map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select></label><div><Check checked={form.requireConfirmation} onChange={(value) => update('requireConfirmation', value)} label="Exigir confirmação para avançar ao próximo ciclo" /><Check checked={form.alertPending} onChange={(value) => update('alertPending', value)} label="Alertar quando houver itens obrigatórios pendentes" /></div></div></fieldset>
      <fieldset className="mapping-fieldset"><legend>Informações do mapeamento <Info size={16} /></legend><p>Dados extraídos do mapeamento do ciclo de vida para esta fase.</p><div className="mapping-summary"><span><BarChart3 /> Dados gerados:<strong>rotina e comportamento</strong></span><span><Camera /> Evidências esperadas:<strong>relatórios e fotos</strong></span><span><Users /> Responsável:<strong>{form.responsible}</strong></span><span className="risk"><Info /> Risco de perda: <strong>Alto</strong></span></div><aside><Info size={19} /> Este ciclo está ativo e possui cães vinculados. Alterações de posição ou regras podem impactar o Kanban e exigirão confirmação ao salvar.</aside></fieldset>
      <footer className="lifecycle-edit-footer"><small>Última atualização: 05/08/2026 por Geisiane</small><div><button type="button" className="danger-action" onClick={() => { toggleLifecycleCycle(cycle.id); update('active', !form.active); }}>{form.active ? 'Desativar ciclo' : 'Ativar ciclo'}</button><button type="button" className="ghost-action" onClick={() => setForm({ ...cycle, description: cycle.description || '', columnName: cycle.name, icon: 5, color: '#78ad7d', duration: 12, durationUnit: 'meses', entryRule: '', nextCycle: '', showInRecord: true, requireConfirmation: true, alertPending: true })}>Descartar alterações</button><button type="submit" className="primary-action">{saved ? 'Alterações salvas' : 'Salvar alterações'}</button></div></footer>
    </section>
  </form>;
}

function Toggle({ checked, onChange, label }) { return <label className="switch-label"><button type="button" className={`switch${checked ? ' active' : ''}`} onClick={() => onChange(!checked)}><i /></button>{label}</label>; }
function Check({ checked, onChange, label }) { return <label className="edit-check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}<Info size={15} /></label>; }
