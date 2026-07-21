import { BadgeCheck, Plus } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import { phases } from '../data/mockData.js';

export default function DevelopmentPage() {
  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Mudança de fase" title="Desenvolvimento">
        <button className="primary-action"><Plus size={18} /> Registrar fase</button>
      </PageHeader>
      <div className="phase-timeline full">
        {phases.map((phase, index) => {
          const done = index < 9;
          const current = index === 9;
          return (
            <article className={current ? 'current' : done ? 'done' : ''} key={phase}>
              <span>{done ? <BadgeCheck size={18} /> : index + 1}</span>
              <div>
                <strong>{phase}</strong>
                <p>{done ? 'Concluída' : current ? 'Fase atual · validações pendentes' : 'Pendente'} · documentos e eventos vinculados</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
