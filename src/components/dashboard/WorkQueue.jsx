import { AlertCircle } from 'lucide-react';
import { WORK_GROUPS } from '../../data/dashboardData.js';

export default function WorkQueue({ items, onOpen }) {
  return (
    <section className="work-queue" aria-labelledby="work-queue-title">
      <div className="queue-heading">
        <div><p className="eyebrow">Prioridades operacionais</p><h3 id="work-queue-title">Fila de trabalho</h3></div>
        <span>{items.length} {items.length === 1 ? 'atividade' : 'atividades'}</span>
      </div>
      <div className="queue-groups">
        {WORK_GROUPS.map((group) => {
          const groupItems = items.filter((item) => item.group === group.id);
          return (
            <article className={`queue-group queue-${group.id.toLowerCase()}`} key={group.id}>
              <header><strong>{group.title}</strong><span>{groupItems.length}</span></header>
              <div className="queue-items">
                {groupItems.length === 0 && <p className="queue-empty">{group.empty}</p>}
                {groupItems.map((item) => (
                  <button className="queue-card" key={item.id} onClick={(event) => onOpen(item, event.currentTarget)}>
                    <div className="queue-card-title">
                      {(item.group === 'ATTENTION' || item.severity === 'high') && <AlertCircle size={18} aria-label="Requer atenção" />}
                      <strong>{item.title}</strong>
                      <time>{item.displayDate}</time>
                    </div>
                    <p>{item.dogName} · {item.categoryLabel}</p>
                    <div className="queue-meta"><span>{item.status}</span>{item.responsible && <span>{item.responsible}</span>}</div>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

