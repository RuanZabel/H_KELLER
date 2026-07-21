import { AlertTriangle, Check } from 'lucide-react';
import { groupForDog, phases } from '../../data/mockData.js';

export default function DogTable({ dogs, onOpenDog }) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Cão</th>
            <th>RGA</th>
            <th>Sexo</th>
            <th>Raça</th>
            <th>Fase de treinamento</th>
            <th>Responsável</th>
            <th>Saúde</th>
          </tr>
        </thead>
        <tbody>
          {dogs.map((dog) => {
            const group = groupForDog(dog);

            return (
              <tr key={dog.rga} onClick={() => onOpenDog(dog)}>
                <td><strong>{dog.name}</strong><small>{dog.code} · {dog.coat}</small></td>
                <td>{dog.rga}</td>
                <td>{dog.sex}</td>
                <td>{dog.breed}</td>
                <td>
                  <span className="phase-pill" style={{ '--pill': group.color }}>
                    Fase {dog.phase} · {phases[dog.phase - 1]}
                  </span>
                  <div className="mini-track"><span style={{ width: `${dog.progress}%`, background: group.color }} /></div>
                </td>
                <td>{dog.trainer}</td>
                <td>
                  {dog.alert ? (
                    <span className="health-alert"><AlertTriangle size={15} /> {dog.alert}</span>
                  ) : (
                    <span className="health-ok"><Check size={15} /> Sem alerta</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
