import { AlertTriangle } from 'lucide-react';
import { groupForDog, phases } from '../../data/mockData.js';

export default function DogCard({ dog, onClick }) {
  const group = groupForDog(dog);

  return (
    <button className="dog-card" onClick={onClick}>
      <div className="dog-card-top">
        <span className="avatar">🐾</span>
        <div>
          <strong>{dog.name}</strong>
          <small>{dog.code} · {dog.sex} · {dog.rga}</small>
        </div>
        {dog.alert && <AlertTriangle className="alert-icon" size={18} />}
      </div>
      <div className="phase-line">
        <span>Fase {dog.phase}</span>
        <strong>{phases[dog.phase - 1]}</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${dog.progress}%`, background: group.color }} />
      </div>
    </button>
  );
}
