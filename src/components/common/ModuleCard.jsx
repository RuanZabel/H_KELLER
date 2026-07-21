export default function ModuleCard({ icon: Icon, title, description, meta, tone = 'green' }) {
  return (
    <article className={`module-card ${tone}`}>
      {Icon && <Icon size={24} />}
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {meta && <span>{meta}</span>}
    </article>
  );
}
