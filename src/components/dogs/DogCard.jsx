import { AlertTriangle } from 'lucide-react';
import { SUPPORT_MODALITIES } from '../../data/dashboardData.js';
import { groupForDog, phases } from '../../data/mockData.js';

export default function DogCard({ dog, onClick, onDragStart, onDragEnd, onMovePrevious, onMoveNext }) {
  const group = groupForDog(dog);
  const modality = SUPPORT_MODALITIES[dog.supportModality || 'UNDEFINED'];
  const nextItem = dog.workItems?.find((item) => !item.isOverdue);
  const alertCount = dog.workItems?.filter((item) => item.isOverdue || item.blocksPhase || item.severity === 'critical').length || 0;
  return (
    <article
      className="dog-card"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      tabIndex="0"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(event);
        }
      }}
      aria-label={`Abrir detalhes de ${dog.name}. Card movível entre fases.`}
    >
      <div className="dog-card-top">
        <span className="avatar">HK</span>
        <div><strong>{dog.name}</strong><small>{dog.sex} · {dog.rga}</small></div>
        {alertCount > 0 && <AlertTriangle className="alert-icon" size={18} aria-label={`${alertCount} alertas ativos`} />}
      </div>
      <div className="phase-line"><span>{group.title} · {dog.phase > 17 ? 'pós-entrega' : `fase micro ${dog.phase}`}</span><strong>{phases[dog.phase - 1] || 'Acompanhamento ativo'}</strong></div>
      {dog.supportModality && dog.supportModality !== 'UNDEFINED' && <span className="modality-chip">{modality.symbol} {modality.label}</span>}
      {nextItem && <div className="dog-next-event"><span>Próximo evento</span><strong>{nextItem.title} · {nextItem.displayDate}</strong></div>}
      <div className="progress-track"><span style={{ width: `${dog.progress}%`, background: group.color }} /></div>
      <div className="card-move-actions" aria-label={`Mover ${dog.name} entre fases`}>
        <button type="button" onClick={(event) => { event.stopPropagation(); onMovePrevious?.(); }} disabled={!onMovePrevious} aria-label={`Mover ${dog.name} para a fase anterior`}>←</button>
        <span>Arraste para mover</span>
        <button type="button" onClick={(event) => { event.stopPropagation(); onMoveNext?.(); }} disabled={!onMoveNext} aria-label={`Mover ${dog.name} para a próxima fase`}>→</button>
      </div>
    </article>
  );
}
