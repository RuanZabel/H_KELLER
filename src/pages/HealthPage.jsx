import { AlertTriangle, CheckCircle2, FileUp, Plus, Stethoscope, Syringe, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import ModuleCard from '../components/common/ModuleCard.jsx';
import { useDogs } from '../context/DogContext.jsx';
import { buildProtocolForDog } from '../data/healthProtocol.js';

const prescriptions = [
  { dog: 'Lis', medicine: 'Solução otológica', dose: '4 gotas', frequency: '12/12h', duration: '7 dias', responsible: 'Dra. Helena CRMV 0000' },
  { dog: 'Nobel', medicine: 'Vermífugo conforme peso', dose: '15 mg/kg', frequency: 'Dose única', duration: 'Repetir em 30 dias', responsible: 'Dr. Rafael CRMV 0000' }
];

const recordChecklist = [
  'Identificação do animal: nome/código, espécie, sexo, raça, pelagem, peso e microchip quando houver.',
  'Identificação do responsável pelo animal, com nome e dados de contato/endereço.',
  'Data, hora, procedimento realizado, evolução e profissional responsável com número do CRMV.',
  'Carteira/atestado de vacinação com vacina, dose, lote, fabricante, data de aplicação e assinatura/responsável.',
  'Anexos comprobatórios: foto da carteira física, laudos, exames, RX, ECG, termos e receitas.',
  'Receituários legíveis com medicamento, concentração, quantidade, dose, via, frequência e duração.'
];

export default function HealthPage() {
  const { dogs } = useDogs();
  const initialEvents = useMemo(() => flattenProtocolEvents(dogs), [dogs]);
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  function updateEvent(rowId, field, value) {
    setEvents((current) => current.map((event) => {
      if (event.rowId !== rowId) {
        return event;
      }

      return {
        ...event,
        [field]: value,
        status: field === 'doneDate' && value ? 'done' : event.status
      };
    }));
  }

  const doneCount = events.filter((event) => event.doneDate).length;
  const lateItems = events.filter((event) => event.status === 'late');
  const pendingItems = events.filter((event) => event.status !== 'done').slice(0, 8);

  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Módulo de saúde" title="Carteira, pendências e receituários">
        <button className="primary-action"><Plus size={18} /> Registrar evento</button>
      </PageHeader>

      <div className="module-grid">
        <ModuleCard icon={Syringe} title="Eventos padrão" description="Vacinas, vermífugos e exames gerados por dias de vida." meta={`${doneCount}/${events.length} feitos`} tone="blue" />
        <ModuleCard icon={AlertTriangle} title="Pendências clínicas" description="Eventos atrasados ou ainda não registrados por cão." meta={`${lateItems.length} atrasados`} tone="orange" />
        <ModuleCard icon={Stethoscope} title="Receituários" description="Prescrições com dose, via, frequência, duração e médico-veterinário." meta={`${prescriptions.length} ativos`} tone="amber" />
      </div>

      <div className="health-layout">
        <section className="vaccination-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Protocolo automático</p>
              <h3>Carteira de saúde do primeiro ano</h3>
            </div>
            <span>{dogs.length} cães acompanhados</span>
          </div>

          <div className="vaccination-table">
            <div className="vaccination-row header">
              <span>Cão / evento</span>
              <span>Prevista</span>
              <span>Feita em</span>
              <span>Lote e fabricante</span>
              <span>Comprovante</span>
            </div>

            {events.slice(0, 14).map((event) => (
              <article className={`vaccination-row ${event.status}`} key={event.rowId}>
                <div>
                  <strong>{event.dogName}</strong>
                  <p>{event.name} · {event.type} · {event.ageLabel}</p>
                  <em>{statusLabel(event.status)}</em>
                </div>
                <span>{event.dueDate}</span>
                <label>
                  <input
                    type="date"
                    value={toInputDate(event.doneDate)}
                    onChange={(inputEvent) => updateEvent(event.rowId, 'doneDate', fromInputDate(inputEvent.target.value))}
                    aria-label={`Data realizada ${event.name} ${event.dogName}`}
                  />
                </label>
                <div className="inline-fields">
                  <input value={event.batch} onChange={(inputEvent) => updateEvent(event.rowId, 'batch', inputEvent.target.value)} placeholder="Lote" aria-label={`Lote ${event.name}`} />
                  <input value={event.maker} onChange={(inputEvent) => updateEvent(event.rowId, 'maker', inputEvent.target.value)} placeholder="Fabricante" aria-label={`Fabricante ${event.name}`} />
                </div>
                <label className="upload-field">
                  <FileUp size={17} />
                  <span>{event.proof || 'Enviar foto/PDF'}</span>
                  <input type="file" accept="image/*,.pdf" onChange={(inputEvent) => updateEvent(event.rowId, 'proof', inputEvent.target.files?.[0]?.name || '')} />
                </label>
              </article>
            ))}
          </div>
        </section>

        <aside className="timeline-panel">
          <h3>Pendências</h3>
          {pendingItems.map((item) => (
            <article className="work-item" key={`pending-${item.rowId}`}>
              <AlertTriangle size={18} />
              <div><strong>{item.name}</strong><p>{item.dogName} · {item.type} · previsto: {item.dueDate}</p></div>
              <span>{item.status === 'late' ? 'Alta' : 'Média'}</span>
            </article>
          ))}
          <button className="ghost-action full-action"><Plus size={17} /> Criar pendência</button>
        </aside>
      </div>

      <div className="split-layout health-secondary">
        <section className="timeline-panel">
          <h3>Receituários ativos</h3>
          {prescriptions.map((prescription) => (
            <article className="prescription-card" key={`${prescription.dog}-${prescription.medicine}`}>
              <div>
                <strong>{prescription.dog}</strong>
                <span>{prescription.responsible}</span>
              </div>
              <p>{prescription.medicine} · {prescription.dose} · {prescription.frequency} · {prescription.duration}</p>
              <button className="ghost-action"><Upload size={16} /> Anexar receita</button>
            </article>
          ))}
        </section>

        <section className="timeline-panel">
          <h3>Checklist do prontuário</h3>
          {recordChecklist.map((item) => (
            <article className="check-row" key={item}>
              <CheckCircle2 size={18} />
              <span>{item}</span>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}

function flattenProtocolEvents(dogs) {
  return dogs.flatMap((dog) => buildProtocolForDog(dog).map((event) => ({
    ...event,
    dogName: dog.name,
    dogRga: dog.rga,
    rowId: `${dog.rga}-${event.id}`
  })));
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
