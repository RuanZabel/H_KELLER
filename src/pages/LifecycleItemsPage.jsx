import { ArrowDown, ArrowUp, CheckCircle2, ClipboardList, Info, MoreVertical, Pencil, Plus, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext.jsx';

const types = ['Vacina', 'Vermífugo', 'Exame', 'Medicamento', 'Outro'];

function inferType(name = '', savedType = '') {
  if (types.includes(savedType)) return savedType;
  const normalizedName = name.toLowerCase();
  if (/vacina|v8|v10|antirráb/.test(normalizedName)) return 'Vacina';
  if (/vermíf|vermi|parasita/.test(normalizedName)) return 'Vermífugo';
  if (/exame|hemograma|radiografia|avaliação clínica/.test(normalizedName)) return 'Exame';
  if (/medicamento|remédio|suplemento/.test(normalizedName)) return 'Medicamento';
  return 'Outro';
}

const normalize = (item, index, cycle) => typeof item === 'object'
  ? { active: true, required: true, timing: 'Durante a fase', responsible: cycle.responsible, ...item, type: inferType(item.name, item.type) }
  : { id: `item-${cycle.id}-${index}`, name: item, type: inferType(item), required: true, timing: 'Durante a fase', responsible: cycle.responsible, active: true };

export default function LifecycleItemsPage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { lifecycleCycles, updateLifecycleCycle } = useConfig();
  const cycle = lifecycleCycles.find((entry) => entry.id === cycleId);
  const items = useMemo(() => (cycle?.items || []).map((item, index) => normalize(item, index, cycle)), [cycle]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [requirement, setRequirement] = useState('all');
  const [reordering, setReordering] = useState(false);
  const [dialog, setDialog] = useState(null);

  if (!cycle) return <section className="screen"><h2>Ciclo não encontrado</h2><button onClick={() => navigate('/config/ciclos')}>Voltar aos ciclos</button></section>;
  const filtered = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && (type === 'all' || item.type === type) && (requirement === 'all' || item.required === (requirement === 'required')));
  const persist = (next) => updateLifecycleCycle(cycle.id, { ...cycle, items: next });
  const save = (data) => { persist(dialog.item ? items.map((item) => item.id === dialog.item.id ? { ...item, ...data } : item) : [...items, { ...data, id: `item-${Date.now()}` }]); setDialog(null); };
  const toggle = (id) => persist(items.map((item) => item.id === id ? { ...item, active: !item.active } : item));
  const move = (id, direction) => { const index = items.findIndex((item) => item.id === id); const target = index + direction; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; persist(next); };
  const requiredCount = items.filter((item) => item.required).length;

  return <section className="screen lifecycle-items-screen animate-in">
    <nav className="items-breadcrumb"><button onClick={() => navigate('/config/ciclos')}>← Configurações</button><span>/</span><button onClick={() => navigate('/config/ciclos')}>Ciclos do ciclo de vida</button><span>/</span><strong>{cycle.name}</strong><span>/</span><b>Itens</b></nav>
    <header className="lifecycle-items-heading"><div><h2>Itens do ciclo — {cycle.name}</h2><p>Gerencie as informações e controles exibidos no cadastro do cão durante esta fase.</p></div><div><button className="ghost-action" onClick={() => navigate('/config/ciclos')}><Pencil size={17} /> Editar ciclo</button><button className="primary-action" onClick={() => setDialog({ item: null })}><Plus size={18} /> Novo item</button></div></header>
    <section className="cycle-item-summary"><div className="cycle-item-symbol"><Users size={34} /></div><div><h3>{cycle.name} <span className="cycle-status active">Ativo</span></h3><p>{cycle.responsible}</p><small><ClipboardList size={15} /> {items.length} itens configurados</small></div><aside><Info size={22} /><span>Os itens abaixo aparecem no cadastro do cão<br />enquanto ele estiver nesta fase.</span></aside></section>
    <section className="lifecycle-items-panel">
      <div className="lifecycle-items-toolbar"><label><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar item" /></label><select value={type} onChange={(e) => setType(e.target.value)}><option value="all">Todos os tipos</option>{types.map((value) => <option key={value}>{value}</option>)}</select><select value={requirement} onChange={(e) => setRequirement(e.target.value)}><option value="all">Obrigatórios e opcionais</option><option value="required">Obrigatórios</option><option value="optional">Opcionais</option></select><button onClick={() => setReordering((value) => !value)}><ArrowUp size={15} /><ArrowDown size={15} /> {reordering ? 'Concluir' : 'Reordenar itens'}</button></div>
      <h3>Itens configurados</h3>
      <div className="lifecycle-items-table"><div className="lifecycle-item-row header"><span>Ordem</span><span>Item</span><span>Tipo</span><span>Obrigatoriedade</span><span>Quando exibir/solicitar</span><span>Responsável</span><span>Status</span><span>Ações</span></div>{filtered.map((item) => { const index = items.findIndex((entry) => entry.id === item.id); return <article className={`lifecycle-item-row${item.active ? '' : ' inactive'}`} key={item.id}><div className="item-order">{index + 1}{reordering && <span><button disabled={!index} onClick={() => move(item.id, -1)}><ArrowUp size={13} /></button><button disabled={index === items.length - 1} onClick={() => move(item.id, 1)}><ArrowDown size={13} /></button></span>}</div><strong>{item.name}</strong><span className="item-type"><ClipboardList size={14} /> {item.type}</span><span className="item-required"><CheckCircle2 size={16} /> {item.required ? 'Obrigatório' : 'Opcional'}</span><span>{item.timing}</span><span>{item.responsible}</span><span className={`cycle-status ${item.active ? 'active' : 'inactive'}`}>{item.active ? 'Ativo' : 'Inativo'}</span><div className="cycle-actions"><button onClick={() => setDialog({ item })}><Pencil size={15} /> Editar</button><button className="more" onClick={() => toggle(item.id)}><MoreVertical size={17} /></button></div></article>; })}{!filtered.length && <p className="lifecycle-config-empty">Nenhum item encontrado.</p>}</div>
      <footer className="items-panel-footer"><span><ClipboardList size={16} /> {items.length} itens configurados · {requiredCount} obrigatórios · {items.length - requiredCount} opcionais</span></footer>
      <aside className="items-warning"><Info size={19} /> Alterar ou desativar um item pode afetar registros de cães que já estão em {cycle.name}. O histórico existente será preservado.</aside>
    </section>
    {dialog && <FlexibleItemDialog item={dialog.item} cycle={cycle} lifecycleCycles={lifecycleCycles} onClose={() => setDialog(null)} onSave={save} />}
  </section>;
}

function ItemDialog({ item, cycle, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', type: 'Outro', required: true, timing: 'Durante a fase', responsible: cycle.responsible, active: true });
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return createPortal(<div className="cycle-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="cycle-dialog item-dialog" onSubmit={(event) => { event.preventDefault(); onSave(form); }}><header><div><p className="eyebrow">Item do ciclo · {cycle.name}</p><h2>{item ? 'Editar item' : 'Novo item'}</h2></div><button type="button" onClick={onClose}><X /></button></header><section className="cycle-form-grid"><label className="wide"><span>Nome do item *</span><input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ex.: Registro de comportamento" /></label><label><span>Tipo *</span><select value={form.type} onChange={(e) => update('type', e.target.value)}>{types.map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Quando exibir ou solicitar *</span><input required value={form.timing} onChange={(e) => update('timing', e.target.value)} /></label><label className="wide"><span>Responsável *</span><input required value={form.responsible} onChange={(e) => update('responsible', e.target.value)} /></label><label className="cycle-checkbox"><input type="checkbox" checked={form.required} onChange={(e) => update('required', e.target.checked)} /> Item obrigatório</label><label className="cycle-checkbox"><input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)} /> Item ativo</label></section><footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-action">Salvar item</button></footer></form></div>, document.body);
}

function FlexibleItemDialog({ item, cycle, lifecycleCycles, onClose, onSave }) {
  const defaultSchedule = item?.schedule || { mode: 'dog_age', ageDays: 20, delayDays: 10, referenceCycleId: '', referenceItemId: '' };
  const [form, setForm] = useState(item || { name: '', type: 'Outro', required: true, responsible: cycle.responsible, active: true });
  const [schedule, setSchedule] = useState(defaultSchedule);
  const currentCycleIndex = lifecycleCycles.findIndex((entry) => entry.id === cycle.id);
  const currentItemIndex = item ? cycle.items.findIndex((entry, index) => (typeof entry === 'object' ? entry.id : `item-${cycle.id}-${index}`) === item.id) : cycle.items.length;
  const referenceGroups = lifecycleCycles.slice(0, currentCycleIndex + 1).map((entry, cycleIndex) => {
    const availableItems = (entry.items || []).map((entryItem, index) => ({
      id: typeof entryItem === 'object' ? entryItem.id : `item-${entry.id}-${index}`,
      name: typeof entryItem === 'object' ? entryItem.name : entryItem
    })).filter((entryItem, index) => cycleIndex < currentCycleIndex || index < currentItemIndex);
    return { cycle: entry, items: availableItems };
  }).filter((group) => group.items.length);
  const selectedReference = referenceGroups.flatMap((group) => group.items.map((entryItem) => ({ ...entryItem, cycle: group.cycle }))).find((entryItem) => entryItem.id === schedule.referenceItemId && entryItem.cycle.id === schedule.referenceCycleId);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateSchedule = (field, value) => setSchedule((current) => ({ ...current, [field]: value }));

  function submit(event) {
    event.preventDefault();
    const timing = schedule.mode === 'dog_age'
      ? `Aos ${schedule.ageDays} dias de vida`
      : `${schedule.delayDays} dias após ${selectedReference?.name || 'a aplicação selecionada'}`;
    onSave({ ...form, timing, schedule: { ...schedule, ageDays: Number(schedule.ageDays), delayDays: Number(schedule.delayDays) } });
  }

  return createPortal(<div className="cycle-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="cycle-dialog item-dialog flexible-item-dialog" onSubmit={submit}>
      <header><div><p className="eyebrow">Item do ciclo · {cycle.name}</p><h2>{item ? 'Editar item' : 'Novo item'}</h2></div><button type="button" onClick={onClose}><X /></button></header>
      <section className="cycle-form-grid">
        <label className="wide"><span>Nome do item *</span><input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex.: Vacina V10" /></label>
        <label><span>Tipo *</span><select value={form.type} onChange={(event) => update('type', event.target.value)}>{types.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Quando solicitar *</span><select value={schedule.mode} onChange={(event) => updateSchedule('mode', event.target.value)}><option value="dog_age">Por idade do cão</option><option value="after_application">Depois de outra aplicação</option></select></label>
        {schedule.mode === 'dog_age' ? <label className="wide schedule-rule-field"><span>Idade do cão *</span><div><input type="number" min="0" required value={schedule.ageDays} onChange={(event) => updateSchedule('ageDays', event.target.value)} /><em>dias de vida</em></div><small>A notificação será gerada quando o cão atingir essa idade.</small></label> : <>
          <label className="wide"><span>Aplicação anterior de referência *</span><select required value={schedule.referenceItemId ? `${schedule.referenceCycleId}::${schedule.referenceItemId}` : ''} onChange={(event) => { const [referenceCycleId, referenceItemId] = event.target.value.split('::'); setSchedule((current) => ({ ...current, referenceCycleId, referenceItemId })); }}><option value="">Selecione uma aplicação já realizada</option>{referenceGroups.map((group) => <optgroup label={group.cycle.name} key={group.cycle.id}>{group.items.map((entryItem) => <option value={`${group.cycle.id}::${entryItem.id}`} key={entryItem.id}>{entryItem.name}</option>)}</optgroup>)}</select><small>A referência pode estar em outro ciclo, mas deve ser anterior ao item atual.</small></label>
          <label className="wide schedule-rule-field"><span>Intervalo após a aplicação *</span><div><input type="number" min="0" required value={schedule.delayDays} onChange={(event) => updateSchedule('delayDays', event.target.value)} /><em>dias depois</em></div></label>
        </>}
        <label className="wide"><span>Responsável *</span><input required value={form.responsible} onChange={(event) => update('responsible', event.target.value)} /></label>
        <label className="cycle-checkbox"><input type="checkbox" checked={form.required} onChange={(event) => update('required', event.target.checked)} /> Item obrigatório</label>
        <label className="cycle-checkbox"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} /> Item ativo</label>
      </section>
      <footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-action">Salvar item</button></footer>
    </form>
  </div>, document.body);
}
