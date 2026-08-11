import { ArrowDown, ArrowUp, CheckCircle2, ClipboardList, Eye, MoreVertical, Pencil, Plus, Search, Settings2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext.jsx';
import { useDogs } from '../context/DogContext.jsx';

const emptyCycle = { name: '', responsible: '', usedInKanban: true, active: true, items: [] };

export default function LifecycleConfigPage() {
  const { lifecycleCycles, addLifecycleCycle, updateLifecycleCycle, toggleLifecycleCycle, moveLifecycleCycle } = useConfig();
  const { dogs } = useDogs();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [reordering, setReordering] = useState(false);
  const [dialog, setDialog] = useState(null);
  const filteredCycles = useMemo(() => lifecycleCycles.filter((cycle) => cycle.name.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || (status === 'active' ? cycle.active : !cycle.active))), [lifecycleCycles, query, status]);
  const itemCount = lifecycleCycles.reduce((total, cycle) => total + cycle.items.length, 0);

  function saveCycle(data) {
    if (dialog?.cycle) updateLifecycleCycle(dialog.cycle.id, data);
    else addLifecycleCycle(data);
    setDialog(null);
  }

  return <section className="screen lifecycle-config-screen animate-in">
    <div className="lifecycle-config-heading"><div><p className="eyebrow">Configurações</p><h2>Ciclos do ciclo de vida</h2><p>Cadastre e ordene as fases que compõem a jornada do cão no Kanban e no cadastro.</p></div><button className="primary-action" onClick={() => setDialog({ mode: 'edit', cycle: null })}><Plus size={18} /> Novo ciclo</button></div>
    <section className="lifecycle-config-summary"><article><Settings2 /><span><strong>{lifecycleCycles.filter((cycle) => cycle.active).length}</strong> ciclos ativos</span></article><article><ClipboardList /><span><strong>{itemCount}</strong> itens configurados</span></article><article><CheckCircle2 /><span><strong>{dogs.length}</strong> cães em acompanhamento</span></article></section>
    <div className="lifecycle-config-toolbar"><label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ciclo" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos os status</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select><button className={reordering ? 'active' : ''} onClick={() => setReordering((value) => !value)}><ArrowUp size={16} /><ArrowDown size={16} /> {reordering ? 'Concluir ordenação' : 'Reordenar Kanban'}</button></div>
    <div className="lifecycle-cycle-table"><div className="lifecycle-cycle-row header"><span>Ordem</span><span>Ciclo/fase</span><span>Itens configurados</span><span>Responsável padrão</span><span>Utilizado no Kanban</span><span>Status</span><span>Ações</span></div>{filteredCycles.map((cycle) => {
      const realIndex = lifecycleCycles.findIndex((item) => item.id === cycle.id);
      return <article className="lifecycle-cycle-row" key={cycle.id}><div className="cycle-order"><span>{realIndex + 1}</span>{reordering && <div><button disabled={realIndex === 0} onClick={() => moveLifecycleCycle(cycle.id, -1)} aria-label={`Mover ${cycle.name} para cima`}><ArrowUp size={15} /></button><button disabled={realIndex === lifecycleCycles.length - 1} onClick={() => moveLifecycleCycle(cycle.id, 1)} aria-label={`Mover ${cycle.name} para baixo`}><ArrowDown size={15} /></button></div>}</div><strong>{cycle.name}</strong><span>{cycle.items.length} itens</span><span>{cycle.responsible || 'Não definido'}</span><span className="cycle-kanban"><CheckCircle2 size={16} /> {cycle.usedInKanban ? 'Sim' : 'Não'}</span><span className={`cycle-status ${cycle.active ? 'active' : 'inactive'}`}>{cycle.active ? 'Ativo' : 'Inativo'}</span><div className="cycle-actions"><button onClick={() => navigate(`/config/ciclos/${cycle.id}/itens`)}><Eye size={16} /> Ver itens</button><button onClick={() => navigate(`/config/ciclos/${cycle.id}/editar`)}><Pencil size={16} /> Editar</button><button className="more" onClick={() => toggleLifecycleCycle(cycle.id)} aria-label={`${cycle.active ? 'Desativar' : 'Ativar'} ${cycle.name}`}><MoreVertical size={17} /></button></div></article>;
    })}{!filteredCycles.length && <div className="lifecycle-config-empty">Nenhum ciclo encontrado.</div>}</div>
    <aside className="lifecycle-config-note"><span>ⓘ</span><p><strong>Ciclo/fase</strong> → coluna no Kanban<br /><strong>Itens do ciclo/fase</strong> → informações e controles no cadastro do cão</p></aside>
    {dialog && <CycleDialog {...dialog} onClose={() => setDialog(null)} onSave={saveCycle} />}
  </section>;
}

function CycleDialog({ mode, cycle, onClose, onSave }) {
  const [form, setForm] = useState(() => cycle ? { ...cycle } : emptyCycle);
  const readonly = mode === 'view';
  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function submit(event) { event.preventDefault(); onSave(form); }
  return createPortal(<div className="cycle-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="cycle-dialog" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="cycle-dialog-title"><header><div><p className="eyebrow">Configuração do Kanban</p><h2 id="cycle-dialog-title">{readonly ? form.name : cycle ? 'Editar ciclo' : 'Novo ciclo'}</h2></div><button type="button" onClick={onClose} aria-label="Fechar"><X /></button></header>{readonly ? <section className="cycle-items-view"><p>{form.responsible || 'Responsável não definido'} · {form.active ? 'Ativo' : 'Inativo'}</p><ol>{form.items.map((item) => <li key={item}>{item}</li>)}</ol>{!form.items.length && <p>Nenhum item configurado.</p>}</section> : <section className="cycle-form-grid"><label><span>Nome do ciclo *</span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex.: Socialização" required /></label><label><span>Responsável padrão *</span><input value={form.responsible} onChange={(event) => update('responsible', event.target.value)} placeholder="Ex.: Equipe de socialização" required /></label><label className="wide"><span>Itens configurados</span><textarea value={form.items.join('\n')} onChange={(event) => update('items', event.target.value.split('\n'))} placeholder={'Um item por linha\nEx.: Avaliação clínica\nProtocolo vacinal'} /></label><label className="cycle-checkbox"><input type="checkbox" checked={form.usedInKanban} onChange={(event) => update('usedInKanban', event.target.checked)} /> Utilizar como coluna no Kanban</label><label className="cycle-checkbox"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} /> Ciclo ativo</label></section>}<footer><button type="button" onClick={onClose}>{readonly ? 'Fechar' : 'Cancelar'}</button>{!readonly && <button className="primary-action" type="submit">Salvar ciclo</button>}</footer></form></div>, document.body);
}
