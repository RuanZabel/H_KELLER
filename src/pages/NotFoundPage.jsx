import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="screen empty-state animate-in">
      <h2>Página não encontrada</h2>
      <p>O endereço informado não existe neste protótipo.</p>
      <Link className="primary-action" to="/painel">Voltar ao painel</Link>
    </section>
  );
}
