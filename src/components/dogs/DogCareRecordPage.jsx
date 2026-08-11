import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp,
  CircleAlert, ClipboardList, Clock3, Dog, FileText, HeartPulse, MoreVertical,
  Paperclip, PawPrint, Pill, Plus, Search, Share2, Soup, Syringe, UserRound, Worm, X
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { phases } from '../../data/mockData.js';
import { buildProtocolForDog } from '../../data/healthProtocol.js';

export default function DogCareRecordPage({ dog, group }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => location.state?.initialTab || 'dados');
  const [registration, setRegistration] = useState(null);
  const tabs = [
    ['dados', 'Dados do animal', Dog], ['saude', 'Saúde', HeartPulse],
    ['alimentacao', 'Alimentação', Soup], ['socializacao', 'Socialização', UserRound],
    ['treinamento', 'Treinamento', ClipboardList], ['documentos', 'Documentos', FileText]
  ];
  return <section className="screen dog-care-record animate-in">
    <div className="care-record-topline">
      <div className="care-record-hero" style={{ '--record': group.color }}>
        <div className="care-record-paw"><PawPrint size={32} /></div>
        <div className="care-record-identity"><span>{dog.rga}</span><h2>{dog.name}</h2><p>{dog.sex} <b>·</b> {dog.breed} <b>·</b> Fase {dog.phase}: {phases[dog.phase - 1] || 'Acompanhamento'}</p></div>
        {(dog.alert || dog.workItems?.length) && <span className="care-record-alert"><CircleAlert size={18} /> {dog.workItems?.filter((item) => item.isOverdue || item.severity === 'critical').length || 2} pendências de saúde</span>}
      </div>
      <div className="care-record-actions"><button><Share2 size={17} /> Compartilhar carteira <ChevronDown size={15} /></button><button className="primary-action" onClick={() => setRegistration({ type: 'medicine', name: 'Medicamento', status: 'Novo registro', date: '' })}><Plus size={18} /> Registrar evento</button></div>
    </div>
    <div className="care-record-tabs" role="tablist">{tabs.map(([id, label, Icon]) => <button role="tab" aria-selected={activeTab === id} key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={18} /> {label}</button>)}</div>
    {activeTab === 'saude' && <HealthCare dog={dog} onRegister={setRegistration} />}
    {activeTab === 'dados' && <AnimalFields dog={dog} />}
    {activeTab === 'alimentacao' && <FeedingFields dog={dog} />}
    {activeTab === 'socializacao' && <SimpleSection title="Socialização" fields={[['Família socializadora', dog.socializer], ['Responsável', dog.trainer], ['Status', 'Acompanhamento registrado'], ['Próxima visita', 'A programar']]} />}
    {activeTab === 'treinamento' && <SimpleSection title="Treinamento" fields={[['Fase atual', phases[dog.phase - 1]], ['Treinador', dog.trainer], ['Progresso', `${dog.progress}%`], ['Modalidade', dog.supportModality || 'Em definição']]} />}
    {activeTab === 'documentos' && <SimpleSection title="Documentos" fields={[['Carteira de vacinação', 'Anexada'], ['Laudos', 'Disponíveis no prontuário'], ['Microchip', dog.chip || 'Pendente'], ['RGA', dog.rga]]} />}
    {registration && <RegistrationModal dog={dog} item={registration} onClose={() => setRegistration(null)} onConfirm={() => setRegistration(null)} />}
  </section>;
}

function HealthCare({ dog, onRegister }) {
  const [openSection, setOpenSection] = useState('');
  const protocol = useMemo(() => buildProtocolForDog(dog), [dog]);
  const completed = protocol.filter((item) => item.doneDate).length || 16;
  const total = Math.max(protocol.length, 18);
  const percent = Math.round((completed / total) * 100);
  const groups = [
    { id: 'vaccines', title: 'Vacinas', Icon: Syringe, tone: 'green', summary: '5 de 6 realizadas', progress: 84 },
    { id: 'worms', title: 'Vermífugos', Icon: Worm, tone: 'teal', summary: '2 de 3 realizadas', progress: 67 },
    { id: 'exams', title: 'Exames', Icon: FileText, tone: 'blue', summary: '4 de 4 realizadas', progress: 100, detail: 'Último: Hemograma · 08/07/2026 · Sem alterações críticas' },
    { id: 'medicines', title: 'Medicamentos', Icon: ClipboardList, tone: 'amber', summary: '2 de 3 registros', progress: 67, detail: '1 tratamento ativo · Solução otológica · até 12/08/2026' }
  ];
  return <div className="health-care-page">
    <header className="health-care-heading"><h2>Saúde e cuidados</h2><p>Acompanhamento do protocolo e histórico de saúde de {dog.name}</p></header>
    <section className="health-summary-bar">
      <article><div className="completion-ring" style={{ '--progress': `${percent * 3.6}deg` }}><strong>{percent}%</strong></div><span><strong>{completed} de {total} realizados</strong><small>Protocolo por idade</small></span></article>
      <article><span className="summary-icon attention"><Clock3 /></span><span><strong>2 pendentes</strong><small>Precisam de atenção</small></span></article>
      <article><span className="summary-icon"><CalendarDays /></span><span><strong>Última atualização</strong><small>05/08/2026</small></span></article>
    </section>
    <section className="attention-care"><h3><AlertTriangle size={22} /> Cuidados que precisam de atenção</h3><div className="attention-care-grid"><CareAlert Icon={Syringe} title="Vacina V10" status="Atrasada há 5 dias" date="Prevista para 31/07/2026" action="Registrar aplicação" onRegister={() => onRegister({ type: 'vaccine', name: 'Vacina V10', status: 'Atrasada há 5 dias', date: '31/07/2026' })} /><CareAlert Icon={Worm} title="Vermífugo" status="Não realizado" date="Previsto para 15/07/2026" action="Registrar administração" onRegister={() => onRegister({ type: 'worm', name: 'Vermífugo', status: 'Não realizado', date: '15/07/2026' })} /></div></section>
    <section className="care-history"><div className="care-history-toolbar"><h3>Histórico de cuidados</h3><label><Search size={17} /><input placeholder="Buscar na carteira" /></label><select aria-label="Período"><option>Todos os períodos</option></select><select aria-label="Status"><option>Todos os status</option></select></div>
      <div className="care-accordion">{groups.map((item) => { const opened = openSection === item.id; return <article className={`care-group ${opened ? 'open' : ''}`} key={item.id}><button className="care-group-header" onClick={() => setOpenSection(opened ? '' : item.id)} aria-expanded={opened}>{opened ? <ChevronDown size={18} /> : <ChevronRight size={18} />}<span className={`care-type-icon ${item.tone}`}><item.Icon size={20} /></span><strong>{item.title}</strong><small>{item.summary}</small><span className={`care-progress ${item.tone}`}><i style={{ width: `${item.progress}%` }} /></span>{item.detail && <em>{item.detail}</em>}{opened ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>{opened && <VaccineRows />}</article>; })}</div>
    </section>
    <footer className="health-care-footer"><span><CheckCircle2 size={16} /> Registros organizados conforme o protocolo de saúde por idade</span><span>Microchip {dog.chip || 'pendente'}</span></footer>
  </div>;
}

function CareAlert({ Icon, title, status, date, action, onRegister }) { return <article className="care-alert"><span className="care-alert-icon"><Icon /></span><div><strong>{title}</strong><b><Clock3 size={13} /> {status}</b><small>{date}</small></div><button onClick={onRegister}>{action}</button></article>; }

const registrationTypes = {
  vaccine: { title: 'Registrar aplicação', noun: 'Vacina', action: 'Confirmar aplicação', Icon: Syringe, professional: 'Veterinário ou responsável', place: 'Local da aplicação', next: 'Próxima dose' },
  worm: { title: 'Registrar administração', noun: 'Vermífugo', action: 'Confirmar administração', Icon: Worm, professional: 'Veterinário ou responsável', place: 'Local da administração', next: 'Próxima dose' },
  medicine: { title: 'Registrar medicamento', noun: 'Medicamento', action: 'Confirmar medicamento', Icon: Pill, professional: 'Profissional ou responsável', place: 'Local da administração', next: 'Fim do tratamento' }
};

function RegistrationModal({ dog, item, onClose, onConfirm }) {
  const config = registrationTypes[item.type];
  const modalRef = useRef(null);
  const [form, setForm] = useState({ name: item.name === 'Medicamento' ? '' : item.name.replace('Vacina ', ''), date: '2026-08-05', batch: '', maker: '', professional: '', crmv: '', place: '', nextDate: '', notes: '', updateProtocol: true, proof: '' });
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    const keydown = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', keydown); };
  }, [onClose]);
  function submit(event) { event.preventDefault(); onConfirm(form); }
  return createPortal(<div className="registration-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="registration-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="registration-title" ref={modalRef} tabIndex="-1">
      <header><span className={`registration-type-icon ${item.type}`}><config.Icon /></span><div><h2 id="registration-title">{config.title}</h2><p><strong>{item.name}</strong><b>·</b> {item.date && `Prevista para ${item.date}`} {item.status && <em>{item.status}</em>}</p></div><button type="button" onClick={onClose} aria-label="Fechar"><X /></button></header>
      <p className="registration-info"><CircleAlert size={16} /> Ao concluir, a pendência será marcada como realizada e a carteira de {dog.name} será atualizada.</p>
      <section><h3>Dados da {item.type === 'vaccine' ? 'aplicação' : 'administração'}</h3><div className="registration-fields">
        <Field label={config.noun} required value={form.name} onChange={(value) => setField('name', value)} placeholder={item.type === 'vaccine' ? 'V10' : `Nome do ${config.noun.toLowerCase()}`} />
        <Field label={`Data da ${item.type === 'vaccine' ? 'aplicação' : 'administração'}`} required type="date" value={form.date} onChange={(value) => setField('date', value)} />
        <Field label="Lote" required value={form.batch} onChange={(value) => setField('batch', value)} placeholder="Ex.: V10-4487" />
        <Field label="Fabricante" value={form.maker} onChange={(value) => setField('maker', value)} placeholder="Nome do fabricante" />
        <Field label={config.professional} required value={form.professional} onChange={(value) => setField('professional', value)} placeholder="Nome do profissional" />
        <Field label="CRMV" value={form.crmv} onChange={(value) => setField('crmv', value)} placeholder="Ex.: CRMV 6090" />
        <Field label={config.place} value={form.place} onChange={(value) => setField('place', value)} placeholder="Clínica, instituição ou campanha" />
        <Field label={config.next} type="date" value={form.nextDate} onChange={(value) => setField('nextDate', value)} hint="Calculada pelo protocolo, quando aplicável" />
      </div></section>
      <section className="registration-evidence"><h3>Evidência e observações</h3><label className="registration-upload"><Paperclip size={20} /><strong>{form.proof || 'Anexar comprovante'}</strong><span>Carteira física, receita, nota ou foto · PDF, JPG ou PNG até 10 MB</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setField('proof', event.target.files?.[0]?.name || '')} /></label><label className="registration-notes"><span>Observações (opcional)</span><textarea value={form.notes} onChange={(event) => setField('notes', event.target.value)} placeholder="Registre reações, orientações ou informações relevantes" /></label><label className="registration-check"><input type="checkbox" checked={form.updateProtocol} onChange={(event) => setField('updateProtocol', event.target.checked)} /> Atualizar automaticamente o protocolo de saúde de {dog.name}</label></section>
      <footer><small>* Campos obrigatórios</small><div><button type="button" onClick={onClose}>Cancelar</button><button className="confirm-registration" type="submit"><CheckCircle2 size={17} /> {config.action}</button></div></footer>
    </form>
  </div>, document.body);
}

function Field({ label, required, hint, onChange, ...input }) { return <label className="registration-field"><span>{label}{required && <b> *</b>}</span><input {...input} required={required} onChange={(event) => onChange(event.target.value)} />{hint && <small>{hint}</small>}</label>; }
function VaccineRows() { const rows = [['V8', '10/07/2026', 'V10-4487'], ['Antirrábica', '15/06/2026', 'AR-2281'], ['Gripe canina', '20/05/2026', 'GC-9012']]; return <div className="vaccine-care-rows">{rows.map(([name, date, batch]) => <div key={name}><CheckCircle2 size={17} /><strong>{name}</strong><span>Realizada</span><time><CalendarDays size={15} /> {date}</time><span>{batch}</span><span>Dra. Helena CRMV 6090</span><span>Anexada</span><button aria-label={`Mais opções para ${name}`}><MoreVertical size={17} /></button></div>)}</div>; }
function AnimalFields({ dog }) { return <SimpleSection title="Dados do animal" fields={[["Nome", dog.name], ["RGA", dog.rga], ["Microchip", dog.chip || 'Pendente'], ["Sexo", dog.sex], ["Raça", dog.breed], ["Pelagem", dog.coat], ["Nascimento", dog.birth], ["Mãe", dog.mother], ["Pai", dog.father], ["Treinador", dog.trainer], ["Socializador", dog.socializer], ["Observações de saúde", dog.alert || 'Sem intercorrências registradas']]} />; }
function FeedingFields({ dog }) { const feeding = dog.feeding || {}; return <SimpleSection title="Alimentação" fields={[["Dieta atual", feeding.diet || 'Sem dieta cadastrada'], ["Quantidade", feeding.amount || '—'], ["Frequência", feeding.frequency || '—'], ["Peso atual", feeding.weight || '—'], ["Responsável", feeding.responsible || 'Equipe de manejo'], ["Atualização", feeding.updated || '—']]} />; }
function SimpleSection({ title, fields }) { return <section className="care-simple-section"><h2>{title}</h2><div>{fields.map(([label, value]) => <label key={label}><span>{label}</span><input value={value || '—'} readOnly /></label>)}</div></section>; }
