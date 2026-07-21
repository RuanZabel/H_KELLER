export default function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="screen-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
