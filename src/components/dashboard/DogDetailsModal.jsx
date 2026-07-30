import { AlertCircle, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUPPORT_MODALITIES } from '../../data/dashboardData.js';
import { groupForDog, phases } from '../../data/mockData.js';

const sectionForCategory = {
  alimentacao: 'feeding', medicacao: 'medication', vacina: 'vaccines',
  exame: 'health', saude: 'health', bloqueio: 'phase',
  entrega: 'tutor', acompanhamento: 'tutor'
};

export default function DogDetailsModal({ dog, origin, trigger, onClose }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const target = origin ? sectionForCategory[origin.category] : null;
  const modality = SUPPORT_MODALITIES[dog.supportModality || 'UNDEFINED'];
  const group = groupForDog(dog);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const timer = target ? setTimeout(() => panelRef.current?.querySelector(`#detail-${target}`)?.scrollIntoView({ block: 'center' }), 80) : null;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      if (timer) clearTimeout(timer);
      trigger?.focus();
    };
  }, [onClose, target, trigger]);

  const contextual = (id) => target === id ? 'detail-section is-contextual' : 'detail-section';

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="dog-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex="-1" ref={panelRef}>
        <header className="modal-header">
          <div className="modal-identity"><span className="avatar">HK</span><div><h2 id={titleId}>{dog.name}</h2><p>{dog.sex} · {dog.rga} · {dog.age || 'idade não informada'}</p></div></div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar detalhamento"><X /></button>
          <div className="modal-tags">
            <span>{group.title} · fase {dog.phase}</span><span>Modalidade: {modality.label}</span>
            <span>Equipe: {dog.responsibleTeam || dog.trainer}</span>
            {origin && <strong>Aberto pela fila: {origin.title} · {origin.displayDate}</strong>}
          </div>
          <button className="record-link" onClick={() => navigate(`/caes/${dog.rga}`)}>Acompanhar cadastro</button>
        </header>

        <div className="modal-content">
          <div className="modal-column">
            <Section id="phase" className={contextual('phase')} title="Fase atual e critérios de avanço" note={`${dog.criteria?.filter((item) => item.status === 'Concluído').length || 0} de ${dog.criteria?.length || 0} critérios concluídos`}>
              <div className="detail-summary"><span>Fase macro<strong>{group.title}</strong></span><span>Fase micro<strong>{dog.phase} · {phases[dog.phase - 1]}</strong></span><span>Progresso<strong>{dog.progress}%</strong></span></div>
              <div className="record-list">{(dog.criteria || []).map((item) => <Record key={item.name} {...item} />)}</div>
            </Section>
            <Section id="medication" className={contextual('medication')} title="Medicação" note={`${dog.medications?.filter((item) => item.alert).length || 0} aviso ativo`}>
              <RecordList items={dog.medications} empty="Sem medicação cadastrada." />
            </Section>
            <Section id="timeline" className={contextual('timeline')} title="Timeline recente" note="Ver timeline completa">
              <div className="timeline-clean">{(dog.timeline || []).map((item) => <div key={`${item.date}-${item.title}`}><time>{item.date}</time><span /><p><strong>{item.title}</strong>{item.description}</p></div>)}</div>
              {!dog.timeline?.length && <Empty text="Sem acontecimentos na timeline." />}
            </Section>
          </div>
          <div className="modal-column">
            <Section id="feeding" className={contextual('feeding')} title="Alimentação" note={dog.feeding?.updated ? `Atualizado em ${dog.feeding.updated}` : ''}>
              {dog.feeding ? <div className="detail-summary feeding-summary"><span>Dieta atual<strong>{dog.feeding.diet}</strong></span><span>Quantidade<strong>{dog.feeding.amount}</strong></span><span>Frequência<strong>{dog.feeding.frequency}</strong></span><span>Peso atual<strong>{dog.feeding.weight}</strong></span></div> : <Empty text="Sem alimentação cadastrada." />}
            </Section>
            <Section id="modality" className="detail-section" title="Modalidade de atuação" note={dog.modalityDefinedAt ? `Definida em ${dog.modalityDefinedAt}` : 'Definida na transição para treinamento'}>
              <div className="modality-options">{Object.entries(SUPPORT_MODALITIES).filter(([key]) => key !== 'UNDEFINED').map(([key, item]) => <div className={key === dog.supportModality ? 'selected' : ''} key={key}><b aria-hidden="true">{item.symbol}</b><span><strong>{item.label}</strong><small>{item.description}</small></span></div>)}</div>
            </Section>
            <Section id="vaccines" className={contextual('vaccines')} title="Vacinas" note={`${dog.vaccines?.filter((item) => item.alert).length || 0} avisos ativos`}>
              <RecordList items={dog.vaccines} empty="Sem vacina cadastrada." />
            </Section>
            <Section id="health" className={contextual('health')} title="Outros avisos de saúde">
              <RecordList items={dog.healthEvents} empty="Sem avisos de saúde." />
            </Section>
            <Section id="tutor" className={contextual('tutor')} title="Entrega e acompanhamento do tutor">
              {dog.tutor ? <div className="record-list"><Record name={dog.tutor.name} detail={dog.tutor.detail} status={dog.tutor.status} date={dog.tutor.nextVisit} /></div> : <Empty text="Sem tutor ou acompanhamento cadastrado." />}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, className, title, note, children }) {
  return <section id={`detail-${id}`} className={className}><header><h3>{title}</h3>{note && <span>{note}</span>}</header>{children}</section>;
}
function RecordList({ items, empty }) {
  return items?.length ? <div className="record-list">{items.map((item) => <Record key={item.id || item.name} {...item} />)}</div> : <Empty text={empty} />;
}
function Record({ name, detail, status, date, alert }) {
  return <div className="detail-record">{alert && <AlertCircle size={18} aria-label="Atenção" />}<span><strong>{name}</strong>{detail && <small>{detail}</small>}</span>{status && <b>{status}</b>}{date && <time>{date}</time>}</div>;
}
function Empty({ text }) { return <p className="detail-empty">{text}</p>; }

