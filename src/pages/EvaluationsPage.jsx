import { ClipboardCheck, Clock3, Construction } from 'lucide-react';

export default function EvaluationsPage() {
  return (
    <section className="screen evaluations-construction animate-in">
      <div className="construction-icon"><Construction size={38} /></div>
      <p className="eyebrow">Módulo de avaliações</p>
      <h2>Página em construção</h2>
      <p className="construction-description">Estamos preparando uma nova experiência para registrar, acompanhar e consultar as avaliações dos cães.</p>
      <div className="construction-status"><Clock3 size={18} /><span>Disponível em breve</span></div>
      <aside><ClipboardCheck size={19} /><span>Os registros existentes permanecerão preservados durante a atualização.</span></aside>
    </section>
  );
}
