import { CheckCircle2, CircleMinus, Info, KeyRound, Pencil, Plus, Search, ShieldCheck, UserCog, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { hashPassword, loadSystemUsers, saveSystemUsers, USER_ROLES } from '../utils/userStorage.js';

export default function UsersConfigPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [dialog, setDialog] = useState(null);
  useEffect(() => { loadSystemUsers().then(setUsers); }, []);
  const filtered = useMemo(() => users.filter((user) => `${user.name} ${user.login}`.toLowerCase().includes(query.toLowerCase()) && (role === 'all' || user.role === role) && (status === 'all' || user.active === (status === 'active'))), [users, query, role, status]);
  const persist = (next) => { setUsers(next); saveSystemUsers(next); };

  async function createUser(data) {
    if (users.some((user) => user.login.toLowerCase() === data.login.toLowerCase())) return 'Este login já está cadastrado.';
    const passwordHash = await hashPassword(data.password);
    persist([...users, { id: `user-${Date.now()}`, name: data.name.trim(), login: data.login.trim(), role: data.role, active: true, passwordHash, createdAt: new Date().toLocaleDateString('pt-BR') }]);
    setDialog(null); return '';
  }
  function updateUser(id, data) { persist(users.map((user) => user.id === id ? { ...user, name: data.name.trim(), login: data.login.trim(), role: data.role } : user)); setDialog(null); }
  async function changePassword(id, password) { const passwordHash = await hashPassword(password); persist(users.map((user) => user.id === id ? { ...user, passwordHash } : user)); setDialog(null); }
  function toggleUser(user) { if (!window.confirm(`Deseja realmente ${user.active ? 'desativar' : 'ativar'} o usuário ${user.name}?`)) return; persist(users.map((entry) => entry.id === user.id ? { ...entry, active: !entry.active } : entry)); }
  const activeCount = users.filter((user) => user.active).length;

  return <section className="screen users-config-screen animate-in">
    <header className="users-config-heading"><div><p className="eyebrow">Configurações de acesso</p><h2>Cadastro de usuários</h2><p>Gerencie logins, perfis de acesso e disponibilidade dos usuários do sistema.</p></div><button className="primary-action" onClick={() => setDialog({ type: 'create' })}><Plus size={18} /> Novo usuário</button></header>
    <section className="users-config-summary"><article><Users /><div><strong>{users.length}</strong><span>usuários cadastrados</span></div></article><article><CheckCircle2 /><div><strong>{activeCount}</strong><span>ativos</span></div></article><article><CircleMinus /><div><strong>{users.length - activeCount}</strong><span>desativados</span></div></article><article><ShieldCheck /><div><strong>{new Set(users.map((user) => user.role)).size}</strong><span>perfis em uso</span></div></article></section>
    <div className="users-config-filters"><label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou login" /></label><select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">Todos os tipos de usuário</option>{USER_ROLES.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos os status</option><option value="active">Ativos</option><option value="inactive">Desativados</option></select></div>
    <div className="users-config-table"><div className="user-config-row header"><span>Usuário</span><span>Login</span><span>Tipo de usuário</span><span>Status</span><span>Criado em</span><span>Ações</span></div>{filtered.map((user) => <article className={`user-config-row${user.active ? '' : ' inactive'}`} key={user.id}><span className="user-config-person"><i><UserCog size={17} /></i><strong>{user.name}</strong></span><span>{user.login}</span><span className="user-role-badge">{user.role}</span><span className={`registry-status ${user.active ? 'active' : ''}`}>{user.active ? <CheckCircle2 size={14} /> : <CircleMinus size={14} />}{user.active ? 'Ativo' : 'Desativado'}</span><span>{user.createdAt}</span><div className="user-config-actions"><button onClick={() => setDialog({ type: 'edit', user })}><Pencil size={15} /> Editar</button><button onClick={() => setDialog({ type: 'password', user })}><KeyRound size={15} /> Alterar senha</button><button className={user.active ? 'disable' : ''} onClick={() => toggleUser(user)}>{user.active ? 'Desativar' : 'Ativar'}</button></div></article>)}{!filtered.length && <p className="tutors-empty">Nenhum usuário encontrado.</p>}</div>
    <aside className="users-security-note"><Info size={18} /> As senhas nunca são apresentadas na listagem ou nos dados do usuário. Para substituí-las, utilize “Alterar senha”.</aside>
    {dialog?.type === 'create' && <UserDialog onClose={() => setDialog(null)} onSave={createUser} />}
    {dialog?.type === 'edit' && <UserDialog user={dialog.user} onClose={() => setDialog(null)} onSave={(data) => updateUser(dialog.user.id, data)} />}
    {dialog?.type === 'password' && <PasswordDialog user={dialog.user} onClose={() => setDialog(null)} onSave={(password) => changePassword(dialog.user.id, password)} />}
  </section>;
}

function UserDialog({ user, onClose, onSave }) {
  const [form, setForm] = useState(user ? { name: user.name, login: user.login, role: user.role } : { name: '', login: '', role: 'Gestão', password: '', confirmation: '' });
  const [error, setError] = useState('');
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  async function submit(event) { event.preventDefault(); if (!user && form.password !== form.confirmation) { setError('A senha e a confirmação não são iguais.'); return; } if (!user && form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; } const result = await onSave(form); if (result) setError(result); }
  return createPortal(<div className="cycle-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="cycle-dialog user-config-dialog" onSubmit={submit}><header><div><p className="eyebrow">Controle de acesso</p><h2>{user ? 'Editar usuário' : 'Novo usuário'}</h2></div><button type="button" onClick={onClose} aria-label="Fechar"><X /></button></header><section className="cycle-form-grid"><label><span>Nome do usuário *</span><input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label><span>Login *</span><input required value={form.login} onChange={(event) => update('login', event.target.value)} placeholder="nome.usuario" /></label><label className="wide"><span>Tipo de usuário *</span><select value={form.role} onChange={(event) => update('role', event.target.value)}>{USER_ROLES.map((item) => <option key={item}>{item}</option>)}</select></label>{!user && <><label><span>Senha *</span><input type="password" autoComplete="new-password" required value={form.password} onChange={(event) => update('password', event.target.value)} /></label><label><span>Confirmar senha *</span><input type="password" autoComplete="new-password" required value={form.confirmation} onChange={(event) => update('confirmation', event.target.value)} /></label></>}{error && <p className="user-form-error">{error}</p>}<aside className="user-password-note"><ShieldCheck size={17} />A senha ficará protegida e não poderá ser consultada após o cadastro.</aside></section><footer><button type="button" onClick={onClose}>Cancelar</button><button className="primary-action">{user ? 'Salvar alterações' : 'Criar usuário'}</button></footer></form></div>, document.body);
}

function PasswordDialog({ user, onClose, onSave }) {
  const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState('');
  function submit(event) { event.preventDefault(); if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; } if (password !== confirmation) { setError('A senha e a confirmação não são iguais.'); return; } onSave(password); }
  return createPortal(<div className="cycle-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="cycle-dialog password-dialog" onSubmit={submit}><header><div><p className="eyebrow">Segurança da conta</p><h2>Alterar senha</h2><p>{user.name} · {user.login}</p></div><button type="button" onClick={onClose}><X /></button></header><section className="cycle-form-grid"><label className="wide"><span>Nova senha *</span><input type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="wide"><span>Confirmar nova senha *</span><input type="password" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>{error && <p className="user-form-error">{error}</p>}</section><footer><button type="button" onClick={onClose}>Cancelar</button><button className="primary-action"><KeyRound size={16} /> Alterar senha</button></footer></form></div>, document.body);
}
