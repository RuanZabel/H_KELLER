import { ChevronRight, Plus } from 'lucide-react';
import { phases } from '../data/mockData.js';

const eventTypes = ['Vacinação', 'Exame / laudo', 'Vermifugação', 'Cirurgia / anestesia', 'Intercorrência', 'Avaliação clínica'];

export default function ConfigPage() {
  return (
    <section className="screen animate-in">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Configurações</p>
          <h2>Protocolos e tipos de evento</h2>
        </div>
        <button className="primary-action"><Plus size={18} /> Novo tipo</button>
      </div>

      <div className="config-layout">
        <div className="event-types">
          {eventTypes.map((type, index) => (
            <button key={type}><span className={`config-dot c${index}`} /> {type}<ChevronRight size={18} /></button>
          ))}
        </div>

        <div className="phase-timeline">
          {phases.map((phase, index) => {
            const done = index < 9;
            const current = index === 9;

            return (
              <article className={current ? 'current' : done ? 'done' : ''} key={phase}>
                <span>{index + 1}</span>
                <div>
                  <strong>{phase}</strong>
                  <p>{done ? 'Concluída' : current ? 'Fase atual · eventos em aberto' : 'Pendente'} · {index + 2} eventos registrados</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
