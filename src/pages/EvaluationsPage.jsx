import { ClipboardCheck, Plus, Star } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import ModuleCard from '../components/common/ModuleCard.jsx';

export default function EvaluationsPage() {
  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Checklists e observações" title="Avaliações">
        <button className="primary-action"><Plus size={18} /> Nova avaliação</button>
      </PageHeader>
      <div className="module-grid">
        <ModuleCard icon={ClipboardCheck} title="Avaliações formais" description="Checklists por fase, performance e comportamentos observados." meta="14 registros" />
        <ModuleCard icon={Star} title="Performance média" description="Síntese das últimas avaliações de socialização e treino." meta="82%" tone="blue" />
      </div>
      <div className="timeline-panel">
        <h3>Registros recentes</h3>
        {['Lis · Pré-entrega · ótima resposta em escadas', 'Thor · Bateria completa · aprovado para próxima etapa', 'Nobel · Socialização · reforçar ruídos urbanos'].map((item) => (
          <article className="work-item" key={item}><ClipboardCheck size={18} /><div><strong>{item}</strong><p>Registrado na timeline permanente</p></div><span>Ver</span></article>
        ))}
      </div>
    </section>
  );
}
