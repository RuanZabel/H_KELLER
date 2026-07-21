import { Plus, Soup, Utensils } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import ModuleCard from '../components/common/ModuleCard.jsx';

const diets = [
  ['Lis', 'Super premium filhote', '180g · 3 refeições', 'Ativa desde 01/07/2026'],
  ['Nobel', 'Golden raças grandes', '150g · 3 refeições', 'Revisar em 10 dias'],
  ['Íris', 'Starter canil', '90g · 4 refeições', 'Transição gradual']
];

export default function FeedingPage() {
  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Receituário com vigência" title="Alimentação">
        <button className="primary-action"><Plus size={18} /> Nova dieta</button>
      </PageHeader>
      <div className="module-grid">
        <ModuleCard icon={Soup} title="Dietas ativas" description="Receituários vigentes com quantidade diária calculada." meta="8 cães" />
        <ModuleCard icon={Utensils} title="Revisões próximas" description="Mudanças programadas e dietas com vencimento." meta="3 revisões" tone="amber" />
      </div>
      <div className="table-shell">
        <table>
          <thead><tr><th>Cão</th><th>Ração</th><th>Quantidade</th><th>Status</th></tr></thead>
          <tbody>
            {diets.map(([dog, food, amount, status]) => (
              <tr key={dog}><td><strong>{dog}</strong></td><td>{food}</td><td>{amount}</td><td>{status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
