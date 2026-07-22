import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Dog,
  FileText,
  FileUp,
  HeartPulse,
  Plus,
  Soup,
  Syringe,
  Upload,
  UserRound
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { commandGroups, groupForDog, healthEvents, phases } from '../data/mockData.js';
import { useDogs } from '../context/DogContext.jsx';
import { buildProtocolForDog } from '../data/healthProtocol.js';

export default function DogRecordPage() {
  const { rga } = useParams();
  const [activeTab, setActiveTab] = useState('dados');
  const { dogs, findDogByRga } = useDogs();
  const dog = findDogByRga(rga) || dogs[0];
  const group = groupForDog(dog);
  const tabs = [
    ['dados', 'Dados do animal', Dog],
    ['saude', 'Saúde', HeartPulse],
    ['alimentacao', 'Alimentação', Soup],
    ['socializacao', 'Socialização', UserRound],
    ['treinamento', 'Treinamento', ClipboardList],
    ['documentos', 'Documentos', FileText]
  ];

  return (
    <section className="screen animate-in">
      <div className="record-hero" style={{ '--record': group.color }}>
        <div className="avatar large">🐾</div>
        <div>
          <p className="eyebrow">{dog.rga}</p>
          <h2>{dog.name}</h2>
          <p>{dog.sex} · {dog.breed} · Fase {dog.phase}: {phases[dog.phase - 1]}</p>
        </div>
        {dog.alert && <span className="hero-alert"><AlertTriangle size={17} /> {dog.alert}</span>}
      </div>

      <div className="tabs" role="tablist">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
            <Icon size={17} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'dados' && <AnimalData dog={dog} />}
      {activeTab === 'saude' && <HealthTab dog={dog} />}
      {activeTab === 'alimentacao' && <FeedingTab dog={dog} />}
      {activeTab === 'socializacao' && <SocialTab />}
      {activeTab === 'treinamento' && <TrainingTab />}
      {activeTab === 'documentos' && <DocumentsTab />}
    </section>
  );
}

function AnimalData({ dog }) {
  const fields = [
    ['Nome', dog.name],
    ['RGA', dog.rga],
    ['Microchip', dog.chip || 'Pendente'],
    ['Sexo', dog.sex],
    ['Raça', dog.breed],
    ['Pelagem', dog.coat],
    ['Nascimento', dog.birth],
    ['Mãe', dog.mother],
    ['Pai', dog.father],
    ['Ninhada', 'N-2025-04'],
    ['Treinador', dog.trainer],
    ['Socializador', dog.socializer],
    ['Liberação família', '15/06/2026'],
    ['Retorno ao canil', 'A programar']
  ];

  return (
    <div className="content-grid">
      {fields.map(([label, value]) => (
        <label className="data-field" key={label}>
          <span>{label}</span>
          <input value={value} readOnly />
        </label>
      ))}
      <label className="data-field wide">
        <span>Observações de saúde</span>
        <textarea value={dog.alert || 'Sem intercorrências registradas no resumo atual.'} readOnly />
      </label>
    </div>
  );
}

function HealthTab({ dog }) {
  const [protocolEvents, setProtocolEvents] = useState(() => buildProtocolForDog(dog));
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [clinicalRecords, setClinicalRecords] = useState(() => buildInitialClinicalRecords(dog));
  const [recordForm, setRecordForm] = useState(() => buildEmptyRecordForm());
  const doneCount = protocolEvents.filter((event) => event.doneDate).length;
  const nextPending = protocolEvents.find((event) => !event.doneDate);
  const selectedEvent = protocolEvents.find((event) => event.id === selectedEventId);
  const dogEvents = useMemo(() => buildDogHealthEvents(dog), [dog]);

  function updateProtocolEvent(id, field, value) {
    setProtocolEvents((current) => current.map((event) => {
      if (event.id !== id) {
        return event;
      }

      return {
        ...event,
        [field]: value,
        status: field === 'doneDate' && value ? 'done' : event.status
      };
    }));
  }

  function updateRecordForm(field, value) {
    setRecordForm((current) => ({ ...current, [field]: value }));
  }

  function addClinicalRecord(event) {
    event.preventDefault();

    if (!recordForm.title.trim()) {
      return;
    }

    const newRecord = {
      id: `record-${Date.now()}`,
      type: recordForm.type,
      date: fromInputDate(recordForm.date),
      phase: recordForm.status,
      title: recordForm.title.trim(),
      desc: buildRecordDescription(recordForm),
      color: colorForRecordType(recordForm.type),
      attachment: recordForm.attachment
    };

    setClinicalRecords((current) => [newRecord, ...current]);
    setRecordForm((current) => ({
      ...buildEmptyRecordForm(),
      type: current.type,
      date: current.date
    }));
  }

  return (
    <div className="dog-health-stack">
      <section className={`dog-vaccine-passport ${isWalletOpen ? 'is-open' : 'is-closed'}`}>
        <div className="section-title">
          <div>
            <p className="eyebrow">Protocolo gerado ao nascer</p>
            <h3>Carteira e eventos padrão de {dog.name}</h3>
          </div>
          <div className="section-actions">
            <span>{doneCount}/{protocolEvents.length} eventos feitos</span>
            <button
              className="ghost-action"
              type="button"
              onClick={() => {
                setIsWalletOpen((current) => !current);
                setSelectedEventId(null);
              }}
            >
              {isWalletOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              {isWalletOpen ? 'Fechar carteira' : 'Abrir carteira'}
            </button>
          </div>
        </div>

        <div className="vaccine-summary-strip">
          <article><strong>{dog.rga}</strong><span>Identificação</span></article>
          <article><strong>{dog.chip || 'Pendente'}</strong><span>Microchip</span></article>
          <article><strong>{nextPending ? nextPending.ageLabel : 'Completo'}</strong><span>Próxima idade prevista</span></article>
        </div>

        {isWalletOpen && selectedEvent && (
          <section className="event-register-panel">
            <div>
              <p className="eyebrow">Cadastro do evento</p>
              <h3>{selectedEvent.name}</h3>
              <p>{selectedEvent.type} · {selectedEvent.dose} · previsto para {selectedEvent.dueDate}</p>
            </div>
            <div className="event-register-grid">
              <label className="data-field">
                <span>Data feita</span>
                <input
                  type="date"
                  value={toInputDate(selectedEvent.doneDate)}
                  onChange={(inputEvent) => updateProtocolEvent(selectedEvent.id, 'doneDate', fromInputDate(inputEvent.target.value))}
                />
              </label>
              <label className="data-field">
                <span>Lote</span>
                <input value={selectedEvent.batch} onChange={(inputEvent) => updateProtocolEvent(selectedEvent.id, 'batch', inputEvent.target.value)} />
              </label>
              <label className="data-field">
                <span>Fabricante</span>
                <input value={selectedEvent.maker} onChange={(inputEvent) => updateProtocolEvent(selectedEvent.id, 'maker', inputEvent.target.value)} />
              </label>
              <label className="data-field">
                <span>Usuário / responsável</span>
                <input value={selectedEvent.reportedBy} onChange={(inputEvent) => updateProtocolEvent(selectedEvent.id, 'reportedBy', inputEvent.target.value)} />
              </label>
              <label className="upload-field event-upload">
                <FileUp size={17} />
                <span>{selectedEvent.proof || 'Anexar evidência'}</span>
                <input type="file" accept="image/*,.pdf" onChange={(inputEvent) => updateProtocolEvent(selectedEvent.id, 'proof', inputEvent.target.files?.[0]?.name || '')} />
              </label>
            </div>
            <div className="event-register-actions">
              <button className="ghost-action" type="button" onClick={() => setSelectedEventId(null)}>Fechar</button>
              <button
                className="primary-action"
                type="button"
                onClick={() => updateProtocolEvent(selectedEvent.id, 'doneDate', selectedEvent.doneDate || new Intl.DateTimeFormat('pt-BR').format(new Date()))}
              >
                Confirmar registro
              </button>
            </div>
          </section>
        )}

        {isWalletOpen && (
        <div className="vaccination-table compact-card">
          <div className="vaccination-row header">
            <span>Evento padrão</span>
            <span>Prevista</span>
            <span>Feita em</span>
            <span>Lote e fabricante</span>
            <span>Registrado por</span>
            <span>Comprovante</span>
          </div>

          {protocolEvents.map((event) => (
            <article className={`vaccination-row ${event.status}`} key={event.id}>
              <div>
                <strong>{event.name}</strong>
                <p>{event.type} · {event.dose} · {event.ageLabel}</p>
                <em>{statusLabel(event.status)}</em>
                <button className="mini-action" type="button" onClick={() => setSelectedEventId(event.id)}>
                  Registrar
                </button>
              </div>
              <span>{event.dueDate}</span>
              <label>
                <input
                  type="date"
                  value={toInputDate(event.doneDate)}
                  onChange={(inputEvent) => updateProtocolEvent(event.id, 'doneDate', fromInputDate(inputEvent.target.value))}
                  aria-label={`Data realizada ${event.name}`}
                />
              </label>
              <div className="inline-fields">
                <input value={event.batch} onChange={(inputEvent) => updateProtocolEvent(event.id, 'batch', inputEvent.target.value)} placeholder="Lote" aria-label={`Lote ${event.name}`} />
                <input value={event.maker} onChange={(inputEvent) => updateProtocolEvent(event.id, 'maker', inputEvent.target.value)} placeholder="Fabricante" aria-label={`Fabricante ${event.name}`} />
              </div>
              <label>
                <input
                  value={event.reportedBy}
                  onChange={(inputEvent) => updateProtocolEvent(event.id, 'reportedBy', inputEvent.target.value)}
                  placeholder="Usuário / responsável"
                  aria-label={`Usuário que registrou ${event.name}`}
                />
              </label>
              <label className="upload-field">
                <FileUp size={17} />
                <span>{event.proof || 'Foto/PDF da evidência'}</span>
                <input type="file" accept="image/*,.pdf" onChange={(inputEvent) => updateProtocolEvent(event.id, 'proof', inputEvent.target.files?.[0]?.name || '')} />
              </label>
            </article>
          ))}
        </div>
        )}
      </section>

      <section className="medical-record-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Novo lançamento</p>
            <h3>Registro de prontuário</h3>
          </div>
        </div>

        <form className="medical-record-form" onSubmit={addClinicalRecord}>
          <label className="data-field">
            <span>Tipo</span>
            <select value={recordForm.type} onChange={(event) => updateRecordForm('type', event.target.value)}>
              <option>Medicação</option>
              <option>Vacina</option>
              <option>Pedido veterinário</option>
              <option>Exame / laudo</option>
              <option>Retorno</option>
              <option>Observação clínica</option>
            </select>
          </label>
          <label className="data-field">
            <span>Data</span>
            <input type="date" value={recordForm.date} onChange={(event) => updateRecordForm('date', event.target.value)} />
          </label>
          <label className="data-field">
            <span>Status</span>
            <select value={recordForm.status} onChange={(event) => updateRecordForm('status', event.target.value)}>
              <option>Aberto</option>
              <option>Solicitado</option>
              <option>Realizado</option>
              <option>Concluído</option>
            </select>
          </label>
          <label className="data-field">
            <span>Veterinário / responsável</span>
            <input value={recordForm.veterinarian} onChange={(event) => updateRecordForm('veterinarian', event.target.value)} placeholder="Nome ou equipe" />
          </label>
          <label className="data-field wide">
            <span>Título</span>
            <input value={recordForm.title} onChange={(event) => updateRecordForm('title', event.target.value)} placeholder="Ex.: Prescrever medicação por 5 dias" required />
          </label>
          <label className="data-field wide">
            <span>Descrição / pedido</span>
            <textarea value={recordForm.request} onChange={(event) => updateRecordForm('request', event.target.value)} placeholder="Dose, frequência, exame solicitado, orientação veterinária ou observação clínica." />
          </label>
          <label className="upload-field medical-record-upload">
            <FileUp size={17} />
            <span>{recordForm.attachment || 'Anexar receita, pedido, laudo ou imagem'}</span>
            <input type="file" accept="image/*,.pdf" onChange={(event) => updateRecordForm('attachment', event.target.files?.[0]?.name || '')} />
          </label>
          <button className="primary-action medical-record-submit" type="submit">
            <Plus size={17} /> Registrar no prontuário
          </button>
        </form>
      </section>

      <div className="split-layout">
        <section className="timeline-panel">
          <h3>Pendências e receituário</h3>
          {buildDogPendencies(dog).map((item) => (
            <article className="work-item" key={item.title}>
              <AlertTriangle size={18} />
              <div><strong>{item.title}</strong><p>{item.detail}</p></div>
              <span>{item.priority}</span>
            </article>
          ))}
          <article className="prescription-card">
            <div><strong>Receituário ativo</strong><span>Dra. Helena CRMV 0000</span></div>
            <p>{dog.alert ? 'Solução otológica · 4 gotas · 12/12h · 7 dias' : 'Sem medicação contínua registrada.'}</p>
            <button className="ghost-action"><Upload size={16} /> Anexar receita</button>
          </article>
        </section>

        <section className="timeline-panel">
          <h3>Eventos de saúde</h3>
          {clinicalRecords.map((event) => (
            <article className="health-event" key={event.id}>
              <span className={`event-pill ${event.color}`}>{event.type}</span>
              <time>{event.date} · {event.phase}</time>
              <strong>{event.title}</strong>
              <p>{event.desc}</p>
              {event.attachment && <small>Anexo: {event.attachment}</small>}
            </article>
          ))}
          {dogEvents.map((event) => (
            <article className="health-event" key={event.title}>
              <span className={`event-pill ${event.color}`}>{event.type}</span>
              <time>{event.date} · {event.phase}</time>
              <strong>{event.title}</strong>
              <p>{event.desc}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

function FeedingTab({ dog }) {
  const diet = buildDogDiet(dog);
  const total = diet.amount * diet.meals;

  return (
    <div className="feeding-stack">
      <section className="feeding-hero">
        <div>
          <p className="eyebrow">Receituário alimentar ativo</p>
          <h3>{diet.food}</h3>
          <p>{diet.amount}g por refeição · {diet.meals} refeições por dia · total {total}g/dia</p>
        </div>
        <span>{diet.status}</span>
      </section>

      <div className="feeding-grid">
        <article className="feeding-panel">
          <h3>Dieta atual</h3>
          <div className="content-grid">
            <label className="data-field"><span>Tipo de ração</span><input value={diet.food} readOnly /></label>
            <label className="data-field"><span>Quantidade por refeição</span><input value={`${diet.amount}g`} readOnly /></label>
            <label className="data-field"><span>Refeições por dia</span><input value={diet.meals} readOnly /></label>
            <label className="data-field"><span>Total diário</span><input value={`${total}g`} readOnly /></label>
            <label className="data-field"><span>Horários</span><input value={diet.times} readOnly /></label>
            <label className="data-field"><span>Água</span><input value={diet.water} readOnly /></label>
            <label className="data-field wide"><span>Restrições</span><textarea value={diet.restrictions} readOnly /></label>
            <label className="data-field wide"><span>Observações / suplementos</span><textarea value={diet.notes} readOnly /></label>
          </div>
        </article>

        <aside className="feeding-panel">
          <h3>Vigência</h3>
          <article className="feeding-metric"><strong>{diet.start}</strong><span>Início</span></article>
          <article className="feeding-metric"><strong>{diet.review}</strong><span>Próxima revisão</span></article>
          <article className="feeding-metric"><strong>{diet.responsible}</strong><span>Responsável</span></article>
          <button className="primary-action full-action"><Plus size={17} /> Nova dieta</button>
        </aside>
      </div>

      <section className="timeline-panel">
        <h3>Histórico alimentar</h3>
        {diet.history.map((item) => (
          <article className="work-item" key={item.title}>
            <Soup size={18} />
            <div><strong>{item.title}</strong><p>{item.description}</p></div>
            <span>{item.date}</span>
          </article>
        ))}
      </section>
    </div>
  );
}

function SocialTab() {
  const chips = ['Carros', 'Elevador', 'Aspirador', 'Crianças', 'Bicicletas', 'Ônibus'];

  return (
    <div className="social-form">
      <div className="form-row">
        <label><span>Data</span><input value="15/07/2026" readOnly /></label>
        <label><span>Nº da visita</span><input value="04" readOnly /></label>
        <label><span>Idade</span><input value="5 meses" readOnly /></label>
        <label><span>Dieta</span><input value="Ração super premium · 3x ao dia" readOnly /></label>
      </div>
      <section>
        <h3>Rotina e adaptação</h3>
        <div className="binary-grid">
          {['Dorme na caixa', 'Fica sozinho', 'Aceita manipulação', 'Usa guia sem tensão'].map((item, index) => (
            <button className={index === 1 ? '' : 'selected'} key={item}>{item}</button>
          ))}
        </div>
      </section>
      <section>
        <h3>Eletrodomésticos e estímulos</h3>
        <div className="chip-grid">
          {chips.map((chip, index) => <span className={index % 2 === 0 ? 'selected' : ''} key={chip}>{chip}</span>)}
        </div>
      </section>
      <label className="data-field wide">
        <span>Conclusão / progresso</span>
        <textarea value="Boa evolução em ambientes internos. Próxima visita deve reforçar exposição a ruídos urbanos e permanência calma em transporte." readOnly />
      </label>
    </div>
  );
}

function TrainingTab() {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  const rows = ['Rotina', 'Guia', 'Direita', 'Esquerda', 'Procura', 'Obstáculo', 'Ônibus', 'Distração'];
  const marks = ['X', '', 'X', 'V', '', 'D', 'F', 'N'];

  return (
    <div className="split-layout">
      <div className="training-table">
        <header>
          <h3>Grade mensal</h3>
          <div className="legend">
            <span className="mark x">X</span> Treinou
            <span className="mark v">V</span> Veterinário
            <span className="mark d">D</span> Doente
            <span className="mark f">F</span> Feriado
            <span className="mark n">N</span> Não treinou
          </div>
        </header>

        <div className="month-grid" style={{ '--days': days.length }}>
          <div className="corner">Comando</div>
          {days.map((day) => <div className={`day ${day % 7 === 0 || day % 7 === 6 ? 'weekend' : ''}`} key={day}>{day}</div>)}
          {rows.map((row, rowIndex) => (
            <React.Fragment key={row}>
              <div className="command-name">{row}</div>
              {days.map((day, dayIndex) => {
                const mark = marks[(rowIndex + dayIndex) % marks.length];
                return <button className={`cell ${mark.toLowerCase()}`} key={`${row}-${day}`}>{mark}</button>;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <aside className="progress-panel">
        <h3>Progresso por área</h3>
        {commandGroups.map((item) => (
          <div className="area-progress" key={item.label}>
            <div><span>{item.label}</span><strong>{item.value}%</strong></div>
            <div className="progress-track"><span style={{ width: `${item.value}%` }} /></div>
          </div>
        ))}
        <div className="route-log">
          <h3>Diário de trajetos</h3>
          <p>15/07 · Terminal central · boa resposta em escadas e fluxo moderado.</p>
          <p>12/07 · Praça acessível · reforço em distrações sonoras.</p>
        </div>
      </aside>
    </div>
  );
}

function DocumentsTab() {
  const docs = ['Laudo oftalmológico.pdf', 'Carteira de vacinação.jpg', 'Contrato família socializadora.pdf'];

  return (
    <div className="documents-grid">
      {docs.map((doc) => (
        <article className="doc-card" key={doc}>
          <FileText size={24} />
          <strong>{doc}</strong>
          <span>Vinculado ao prontuário</span>
        </article>
      ))}
      <button className="doc-card add"><Plus size={24} /><strong>Anexar documento</strong><span>PDF, imagem ou vídeo</span></button>
    </div>
  );
}

function buildInitialClinicalRecords(dog) {
  return [
    {
      id: `${dog.rga}-clinical-1`,
      type: 'Pedido veterinário',
      date: '12/07/2026',
      phase: 'Solicitado',
      title: 'Revisão de ouvido e retorno',
      desc: dog.alert
        ? 'Solicitado retorno para reavaliar otite, evolução do tratamento e necessidade de novo laudo.'
        : 'Acompanhamento preventivo registrado para manter histórico clínico atualizado.',
      color: 'amber',
      attachment: ''
    }
  ];
}

function buildEmptyRecordForm() {
  return {
    type: 'Medicação',
    date: new Date().toISOString().slice(0, 10),
    status: 'Aberto',
    veterinarian: '',
    title: '',
    request: '',
    attachment: ''
  };
}

function buildRecordDescription(record) {
  const parts = [];

  if (record.veterinarian.trim()) {
    parts.push(`Responsável: ${record.veterinarian.trim()}.`);
  }

  if (record.request.trim()) {
    parts.push(record.request.trim());
  }

  return parts.join(' ') || 'Registro criado no prontuário do cão.';
}

function colorForRecordType(type) {
  if (type === 'Vacina') {
    return 'blue';
  }

  if (type === 'Medicação') {
    return 'orange';
  }

  if (type === 'Pedido veterinário' || type === 'Exame / laudo') {
    return 'amber';
  }

  return 'green';
}

function buildDogDiet(dog) {
  const baseAmount = dog.phase <= 4 ? 90 : dog.phase <= 10 ? 150 : 180;

  return {
    food: dog.phase <= 4 ? 'Starter canil · filhote' : 'Super premium raças grandes',
    amount: baseAmount,
    meals: dog.phase <= 4 ? 4 : 3,
    times: dog.phase <= 4 ? '07h, 11h, 15h, 19h' : '07h, 12h, 18h',
    water: 'Livre',
    restrictions: dog.alert ? 'Evitar petiscos durante tratamento. Monitorar aceitação alimentar.' : 'Sem restrições alimentares registradas.',
    notes: 'Registrar mudanças como novo receituário para preservar histórico e vigência.',
    status: 'Ativa',
    start: '01/07/2026',
    review: dog.phase <= 4 ? 'Em 7 dias' : 'Em 30 dias',
    responsible: 'Equipe de manejo',
    history: [
      { title: 'Dieta atualizada', description: `${dog.name} iniciou dieta ${dog.phase <= 4 ? 'starter' : 'super premium'} com quantidade diária calculada.`, date: '01/07/2026' },
      { title: 'Peso conferido', description: 'Quantidade mantida após revisão de peso e escore corporal.', date: '25/06/2026' },
      { title: 'Receituário anterior encerrado', description: 'Histórico preservado na timeline do prontuário.', date: '10/06/2026' }
    ]
  };
}

function buildDogPendencies(dog) {
  const items = [];
  if (!dog.chip) {
    items.push({ title: 'Microchip pendente', detail: 'Obrigatório antes da socialização.', priority: 'Alta' });
  }
  if (dog.alert) {
    items.push({ title: dog.alert, detail: 'Acompanhar evolução e anexar receituário/comprovantes.', priority: 'Alta' });
  }
  items.push({ title: 'Conferir evidências', detail: 'Anexar carteira física, laudos ou comprovantes dos eventos feitos.', priority: 'Média' });
  items.push({ title: 'Eventos por idade', detail: 'Vacinas, vermífugos, exames e avaliações são gerados por dias de vida.', priority: 'Média' });
  return items;
}

function buildDogHealthEvents(dog) {
  if (dog.alert) {
    return healthEvents;
  }

  return healthEvents.filter((event) => event.type !== 'Intercorrência');
}

function statusLabel(status) {
  const labels = {
    done: 'Aplicada',
    late: 'Atrasada',
    pending: 'Pendente',
    scheduled: 'Agendada'
  };

  return labels[status] || status;
}

function toInputDate(value) {
  if (!value) {
    return '';
  }

  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

function fromInputDate(value) {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
