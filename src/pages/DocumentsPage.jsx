import { FileText, Plus } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';

const documents = [
  ['Laudo oftalmológico.pdf', 'Thor', 'Saúde', '11/07/2026'],
  ['Carteira de vacinação.jpg', 'Íris', 'Saúde', '10/07/2026'],
  ['Contrato família socializadora.pdf', 'Nobel', 'Socialização', '02/07/2026'],
  ['Avaliação anestésica.pdf', 'Estrela', 'Castração', '27/06/2026']
];

export default function DocumentsPage() {
  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Arquivos vinculados" title="Documentos">
        <button className="primary-action"><Plus size={18} /> Anexar</button>
      </PageHeader>
      <div className="documents-grid">
        {documents.map(([name, dog, module, date]) => (
          <article className="doc-card" key={name}>
            <FileText size={24} />
            <strong>{name}</strong>
            <span>{dog} · {module} · {date}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
