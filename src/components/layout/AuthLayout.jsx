export default function AuthLayout({ children }) {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <p className="eyebrow">Escola Helen Keller</p>
        <h1>Prontuário Digital do Cão</h1>
        <p>Controle interno para saúde, fases, documentos e responsáveis durante o primeiro ano de vida.</p>
      </section>
      {children}
    </main>
  );
}
