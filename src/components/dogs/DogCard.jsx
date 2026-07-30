import { AlertTriangle } from 'lucide-react';
import { SUPPORT_MODALITIES } from '../../data/dashboardData.js';
import { groupForDog, phases } from '../../data/mockData.js';

export default function DogCard({ dog, onClick }) {
  const group = groupForDog(dog);
  const modality = SUPPORT_MODALITIES[dog.supportModality || 'UNDEFINED'];
  const nextItem = dog.workItems?.find((item) => !item.isOverdue);
  const alertCount = dog.workItems?.filter((item) => item.isOverdue || item.blocksPhase || item.severity === 'critical').length || 0;
  return (
    <button className="dog-card" onClick={onClick} aria-label={`Abrir detalhes de ${dog.name}`}>
      <div className="dog-card-top">
        <span className="avatar">HK</span>
        <div><strong>{dog.name}</strong><small>{dog.sex} · {dog.rga}</small></div>
        {alertCount > 0 && <AlertTriangle className="alert-icon" size={18} aria-label={`${alertCount} alertas ativos`} />}
      </div>
      <div className="phase-line"><span>{group.title} · fase micro {dog.phase}</span><strong>{phases[dog.phase - 1]}</strong></div>
      {dog.supportModality && dog.supportModality !== 'UNDEFINED' && <span className="modality-chip">{modality.symbol} {modality.label}</span>}
      {nextItem && <div className="dog-next-event"><span>Próximo evento</span><strong>{nextItem.title} · {nextItem.displayDate}</strong></div>}
      <div className="progress-track"><span style={{ width: `${dog.progress}%`, background: group.color }} /></div>
    </button>
  );
}
