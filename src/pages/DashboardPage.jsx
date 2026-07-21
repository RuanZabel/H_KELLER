import { Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/common/KpiCard.jsx';
import DogCard from '../components/dogs/DogCard.jsx';
import { phaseGroups } from '../data/mockData.js';
import { useDogs } from '../context/DogContext.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [query, setQuery] = useState('');
  const filteredDogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return dogs;
    }

    return dogs.filter((dog) => {
      const searchableText = `${dog.name} ${dog.rga} ${dog.code}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  const active = dogs.filter((dog) => dog.phase < 17).length;
  const alerts = dogs.filter((dog) => dog.health === 'alert').length;
  const social = dogs.filter((dog) => dog.group === 'socializacao').length;
  const training = dogs.filter((dog) => ['aptidao', 'treino'].includes(dog.group)).length;

  return (
    <section className="screen animate-in">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Painel operacional</p>
          <h2>Visão geral do ciclo dos cães</h2>
        </div>
        <button className="primary-action" onClick={() => navigate('/caes/novo')}><Plus size={18} /> Novo cão</button>
      </div>

      <div className="panel-search">
        <label className="search-field">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar cão por nome, RGA ou código"
          />
        </label>
        {query && (
          <button className="ghost-action" onClick={() => setQuery('')}><X size={17} /> Limpar</button>
        )}
      </div>

      <div className="kpi-grid">
        <KpiCard label="Cães ativos" value={active} detail="em acompanhamento interno" tone="green" />
        <KpiCard label="Em socialização" value={social} detail="com família socializadora" tone="blue" />
        <KpiCard label="Em avaliação / treino" value={training} detail="aptidão e pré-entrega" tone="amber" />
        <KpiCard label="Eventos de saúde" value={alerts} detail="alertas visíveis no painel" tone="orange" />
      </div>

      <div className="kanban-board">
        {phaseGroups.map((group) => {
          const groupDogs = filteredDogs.filter((dog) => dog.group === group.id);

          return (
            <article className="lane" key={group.id} style={{ '--lane': group.color }}>
              <header className="lane-header">
                <div>
                  <span className="dot" />
                  <strong>{group.title}</strong>
                </div>
                <span>{groupDogs.length}</span>
              </header>
              <div className="phase-strip">Fases {group.phases} · {group.span}</div>
              <div className="dog-stack">
                {groupDogs.map((dog) => (
                  <DogCard key={dog.rga} dog={dog} onClick={() => navigate(`/caes/${dog.rga}`)} />
                ))}
                {query && groupDogs.length === 0 && <p className="lane-empty">Nenhum cão encontrado nesta fase.</p>}
              </div>
            </article>
          );
        })}
      </div>

      {query && filteredDogs.length === 0 && (
        <div className="empty-state compact">
          <h3>Nenhum cão encontrado</h3>
          <p>Revise o nome, RGA ou código informado na pesquisa.</p>
        </div>
      )}
    </section>
  );
}
