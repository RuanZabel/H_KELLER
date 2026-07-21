import { BookOpenCheck, Plus } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';

const checklists = [
  ['Checklist pré-família', 'Fase 5', 'Obrigatório', '12 itens'],
  ['Avaliação 6 meses', 'Fase 11', 'Obrigatório', '18 itens'],
  ['Socialização mensal', 'Fases 6-10', 'Recorrente', '22 itens']
];

export default function ChecklistsPage() {
  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Modelos configuráveis" title="Cadastro de checklists">
        <button className="primary-action"><Plus size={18} /> Novo checklist</button>
      </PageHeader>
      <div className="module-list">
        {checklists.map(([name, phase, status, items]) => (
          <article className="work-item checklist-row" key={name}>
            <BookOpenCheck size={20} />
            <div><strong>{name}</strong><p>{phase} · {status}</p></div>
            <span>{items}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
