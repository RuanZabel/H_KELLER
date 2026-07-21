import { Plus, UserRound } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';

const tutors = [
  ['Ana Martins', 'Lis', 'Ativo', 'Contrato anexado'],
  ['Roberto Lima', 'Maggie', 'Ativo', 'Vínculo final'],
  ['Família Rocha', 'Vasco', 'Socialização', 'Termo assinado']
];

export default function TutorsPage() {
  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Vínculo humano-animal" title="Tutores e responsáveis">
        <button className="primary-action"><Plus size={18} /> Novo tutor</button>
      </PageHeader>
      <div className="table-shell">
        <table>
          <thead><tr><th>Responsável</th><th>Cão</th><th>Situação</th><th>Documentos</th></tr></thead>
          <tbody>
            {tutors.map(([name, dog, status, docs]) => (
              <tr key={`${name}-${dog}`}><td><strong>{name}</strong></td><td>{dog}</td><td>{status}</td><td><UserRound size={15} /> {docs}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
