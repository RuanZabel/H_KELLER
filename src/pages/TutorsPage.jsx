import { CalendarDays, CheckCircle2, CircleMinus, Dog, Info, MoreVertical, Pencil, Plus, Search, UserCheck, UserRound, UserX, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const initialTutors = [
  { id: 'ana', name: 'Ana Martins', phone: '(11) 99982-1040', email: 'ana@email.com', document: '123.456.789-00', dog: 'Lis', dogCode: 'HK-2024-0142', relationship: 'Tutora definitiva', status: 'Ativo', documents: 3, pendingDocuments: 0, active: true, dogHistory: [{ name: 'Lis', code: 'HK-2024-0142', period: '05/08/2026 — atual', relationship: 'Tutora definitiva', status: 'Vínculo ativo' }, { name: 'Estrela', code: 'HK-2024-0071', period: '02/2025 — 07/2026', relationship: 'Família socializadora', status: 'Vínculo encerrado' }, { name: 'Thor', code: 'HK-2024-0048', period: '03/2024 — 12/2024', relationship: 'Responsável temporária', status: 'Vínculo encerrado' }] },
  { id: 'roberto', name: 'Roberto Lima', phone: '(11) 99775-3920', email: 'roberto@email.com', document: '987.654.321-00', dog: 'Maggie', dogCode: 'HK-2023-0044', relationship: 'Tutor definitivo', status: 'Ativo', documents: 2, pendingDocuments: 0, active: true, dogHistory: [{ name: 'Maggie', code: 'HK-2023-0044', period: '10/2025 — atual', relationship: 'Tutor definitivo', status: 'Vínculo ativo' }, { name: 'Lua', code: 'HK-2022-0026', period: '08/2023 — 09/2025', relationship: 'Tutor temporário', status: 'Vínculo encerrado' }] },
  { id: 'rocha', name: 'Família Rocha', phone: '(11) 99631-8832', email: 'familia.rocha@email.com', document: '456.789.123-00', dog: 'Vasco', dogCode: 'HK-2025-0058', relationship: 'Família socializadora', status: 'Socialização', documents: 1, pendingDocuments: 1, active: true, dogHistory: [{ name: 'Vasco', code: 'HK-2025-0058', period: '06/2026 — atual', relationship: 'Família socializadora', status: 'Vínculo ativo' }, { name: 'Íris', code: 'HK-2025-0058-A', period: '01/2026 — 05/2026', relationship: 'Família socializadora', status: 'Vínculo encerrado' }] },
  { id: 'carlos', name: 'Carlos Mendes', phone: '(11) 99322-6107', email: 'carlos@email.com', document: '741.852.963-00', dog: '', dogCode: '', relationship: 'Ex-tutor', status: 'Desativado', documents: 2, pendingDocuments: 0, active: false }
];

function loadTutors() {
  try {
    const stored = JSON.parse(localStorage.getItem('hk-tutors'));
    if (!stored) return initialTutors;
    return stored.map((tutor) => ({ ...tutor, dogHistory: tutor.dogHistory || initialTutors.find((initial) => initial.id === tutor.id)?.dogHistory || (tutor.dog ? [{ name: tutor.dog, code: tutor.dogCode, period: 'Período não informado', relationship: tutor.relationship, status: tutor.active ? 'Vínculo ativo' : 'Vínculo encerrado' }] : []) }));
  } catch { return initialTutors; }
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState(loadTutors);
  const [query, setQuery] = useState('');
  const [relationship, setRelationship] = useState('all');
  const [status, setStatus] = useState('all');
  const [dialog, setDialog] = useState(null);
  const [historyTutor, setHistoryTutor] = useState(null);
  useEffect(() => { localStorage.setItem('hk-tutors', JSON.stringify(tutors)); }, [tutors]);
  const relationships = [...new Set(tutors.map((tutor) => tutor.relationship))];
  const filtered = useMemo(() => tutors.filter((tutor) => {
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || `${tutor.name} ${tutor.dog} ${tutor.document} ${tutor.phone}`.toLowerCase().includes(needle);
    return matchesQuery && (relationship === 'all' || tutor.relationship === relationship) && (status === 'all' || tutor.active === (status === 'active'));
  }), [tutors, query, relationship, status]);
  const activeCount = tutors.filter((tutor) => tutor.active).length;
  const pendingCount = tutors.reduce((total, tutor) => total + tutor.pendingDocuments, 0);

  function saveTutor(data) {
    if (dialog?.tutor) setTutors((current) => current.map((tutor) => {
      if (tutor.id !== dialog.tutor.id) return tutor;
      const history = [...(tutor.dogHistory || [])];
      if (data.dog && !history.some((dog) => dog.name === data.dog && dog.code === data.dogCode)) history.push({ name: data.dog, code: data.dogCode, period: 'Vínculo atual', relationship: data.relationship, status: 'Vínculo ativo' });
      return { ...tutor, ...data, dogHistory: history };
    }));
    else setTutors((current) => [...current, { ...data, id: `tutor-${Date.now()}`, active: true, status: 'Ativo', documents: 0, pendingDocuments: 0, dogHistory: data.dog ? [{ name: data.dog, code: data.dogCode, period: 'Vínculo atual', relationship: data.relationship, status: 'Vínculo ativo' }] : [] }]);
    setDialog(null);
  }

  function toggleTutor(tutor) {
    const action = tutor.active ? 'desativar' : 'reativar';
    if (!window.confirm(`Deseja realmente ${action} ${tutor.name}? O histórico e os documentos serão preservados.`)) return;
    setTutors((current) => current.map((entry) => entry.id === tutor.id ? { ...entry, active: !entry.active, status: entry.active ? 'Desativado' : 'Ativo' } : entry));
  }

  return <section className="screen tutors-management-screen animate-in">
    <header className="tutors-heading"><div><p className="eyebrow">Vínculo humano-animal</p><h2>Tutores e responsáveis</h2><p>Gerencie vínculos, documentos e disponibilidade para novos cadastros.</p></div><button className="primary-action" onClick={() => setDialog({ tutor: null })}><Plus size={18} /> Novo tutor</button></header>
    <section className="tutors-summary"><article><Users /><div><strong>{tutors.length}</strong><span>tutores cadastrados</span></div></article><article><UserCheck /><div><strong>{activeCount}</strong><span>ativos</span></div></article><article className="inactive"><UserX /><div><strong>{tutors.length - activeCount}</strong><span>desativados</span></div></article><article><Info /><div><strong>{pendingCount}</strong><span>documentos pendentes</span></div></article></section>
    <div className="tutors-filters"><label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tutor, cão, CPF ou telefone" /></label><select value={relationship} onChange={(event) => setRelationship(event.target.value)}><option value="all">Todos os vínculos</option>{relationships.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos os status</option><option value="active">Ativos</option><option value="inactive">Desativados</option></select></div>
    <div className="tutors-table-wrap"><table className="tutors-table"><thead><tr><th>Responsável</th><th>Contato</th><th>Cães vinculados</th><th>Tipo de vínculo</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtered.map((tutor) => <tr className={tutor.active ? '' : 'inactive'} key={tutor.id}><td><span className="tutor-person"><i><UserRound size={17} /></i><strong>{tutor.name}</strong></span></td><td><strong>{tutor.phone}</strong><small>{tutor.email}</small></td><td><button className="tutor-dogs-link" onClick={() => setHistoryTutor(tutor)}><Dog size={16} /><span><strong>{tutor.dogHistory?.length || 0} {(tutor.dogHistory?.length || 0) === 1 ? 'cão' : 'cães'}</strong><small>{tutor.dog ? `Atual: ${tutor.dog}` : 'Sem vínculo atual'}</small></span></button></td><td>{tutor.relationship}</td><td><span className={`tutor-status ${tutor.active ? 'active' : ''}`}>{tutor.active ? <CheckCircle2 size={14} /> : <CircleMinus size={14} />}{tutor.status}</span></td><td><div className="tutor-actions"><button onClick={() => setHistoryTutor(tutor)}><Dog size={15} /> Ver cães</button><button onClick={() => setDialog({ tutor })}><Pencil size={15} /> Editar</button><button className={tutor.active ? 'disable' : 'reactivate'} onClick={() => toggleTutor(tutor)}>{tutor.active ? <UserX size={15} /> : <UserCheck size={15} />}{tutor.active ? 'Desativar' : 'Reativar'}</button><button className="more" aria-label={`Mais opções para ${tutor.name}`}><MoreVertical size={17} /></button></div></td></tr>)}</tbody></table>{!filtered.length && <p className="tutors-empty">Nenhum tutor encontrado.</p>}</div>
    <aside className="tutors-note"><Info size={18} /> Desativar impede novos vínculos, mas preserva o histórico e os documentos do tutor.</aside>
    {dialog && <TutorDialog tutor={dialog.tutor} onClose={() => setDialog(null)} onSave={saveTutor} />}
    {historyTutor && <TutorDogsDialog tutor={historyTutor} onClose={() => setHistoryTutor(null)} />}
  </section>;
}

function TutorDogsDialog({ tutor, onClose }) {
  const dogs = tutor.dogHistory || [];
  return createPortal(<div className="cycle-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="cycle-dialog tutor-dogs-dialog" role="dialog" aria-modal="true" aria-labelledby="tutor-dogs-title"><header><div><p className="eyebrow">Histórico de vínculos</p><h2 id="tutor-dogs-title">Cães de {tutor.name}</h2></div><button type="button" onClick={onClose} aria-label="Fechar"><X /></button></header><div className="tutor-dogs-summary"><Users size={20} /><span><strong>{dogs.length}</strong> {dogs.length === 1 ? 'cão passou' : 'cães passaram'} por este responsável</span></div><div className="tutor-dogs-list">{dogs.map((dog, index) => <article key={`${dog.code}-${index}`}><div className="tutor-dog-avatar"><Dog size={22} /></div><div><h3>{dog.name}</h3><p>{dog.code || 'Código não informado'}</p></div><div><span>{dog.relationship}</span><small><CalendarDays size={14} /> {dog.period}</small></div><span className={`tutor-dog-link-status ${dog.status === 'Vínculo ativo' ? 'active' : ''}`}>{dog.status}</span></article>)}{!dogs.length && <p className="tutors-empty">Nenhum cão registrado no histórico deste tutor.</p>}</div><footer><button type="button" onClick={onClose}>Fechar</button></footer></section></div>, document.body);
}

function TutorDialog({ tutor, onClose, onSave }) {
  const [form, setForm] = useState(tutor || { name: '', phone: '', email: '', document: '', dog: '', dogCode: '', relationship: 'Tutor definitivo' });
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return createPortal(<div className="cycle-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="cycle-dialog tutor-dialog" onSubmit={(event) => { event.preventDefault(); onSave(form); }}><header><div><p className="eyebrow">Cadastro de responsáveis</p><h2>{tutor ? 'Editar tutor' : 'Novo tutor'}</h2></div><button type="button" onClick={onClose} aria-label="Fechar"><X /></button></header><section className="cycle-form-grid"><label><span>Nome completo *</span><input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label><span>CPF ou documento *</span><input required value={form.document} onChange={(event) => update('document', event.target.value)} /></label><label><span>Telefone *</span><input required value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label><label><span>E-mail</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label><label><span>Tipo de vínculo *</span><select value={form.relationship} onChange={(event) => update('relationship', event.target.value)}><option>Tutor definitivo</option><option>Tutora definitiva</option><option>Família socializadora</option><option>Responsável temporário</option></select></label><label><span>Cão vinculado</span><input value={form.dog} onChange={(event) => update('dog', event.target.value)} placeholder="Nome do cão" /></label></section><footer><button type="button" onClick={onClose}>Cancelar</button><button className="primary-action">Salvar tutor</button></footer></form></div>, document.body);
}
