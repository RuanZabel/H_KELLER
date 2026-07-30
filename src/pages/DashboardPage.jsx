import { Filter, Search, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import DogDetailsModal from '../components/dashboard/DogDetailsModal.jsx';
import WorkQueue from '../components/dashboard/WorkQueue.jsx';
import DogCard from '../components/dogs/DogCard.jsx';
import { useDogs } from '../context/DogContext.jsx';
import { buildWorkQueue, LIFECYCLE_GROUPS } from '../data/dashboardData.js';

export default function DashboardPage() {
  const { dogs } = useDogs();
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState(null);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const workItems = useMemo(() => buildWorkQueue(dogs), [dogs]);
  const filteredDogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dogs.filter((dog) => {
      const matchesQuery = !needle || `${dog.name} ${dog.rga} ${dog.code}`.toLowerCase().includes(needle);
      return matchesQuery && (!showAlertsOnly || dog.workItems?.some((item) => item.isOverdue || item.blocksPhase || item.severity === 'critical'));
    });
  }, [dogs, query, showAlertsOnly]);
  const openDog = (dog, origin, trigger) => setSelection({ dog, origin, trigger });
  const closeModal = useCallback(() => setSelection(null), []);

  return (
    <section className="screen dashboard-experience animate-in">
      <div className="screen-heading">
        <div><p className="eyebrow">Visão operacional</p><h2>Ciclo de vida e acompanhamento</h2><p className="dashboard-intro">O que exige ação aparece primeiro; as fases mostram a jornada completa de cada cão.</p></div>
        <span className="operational-pill">Visão operacional</span>
      </div>
      <div className="panel-toolbar">
        <label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar cão por nome, RGA ou código" /></label>
        {query && <button className="toolbar-button" onClick={() => setQuery('')}><X size={16} /> Limpar</button>}
        <button className={`toolbar-button ${showAlertsOnly ? 'active' : ''}`} onClick={() => setShowAlertsOnly((value) => !value)} aria-pressed={showAlertsOnly}><Filter size={16} /> Filtros</button>
        <span className="alert-count">Alertas: {workItems.filter((item) => item.group === 'ATTENTION').length}</span>
      </div>
      <WorkQueue items={workItems} onOpen={(item, trigger) => openDog(dogs.find((dog) => dog.rga === item.dogId), item, trigger)} />
      <div className="kanban-heading"><div><p className="eyebrow">Jornada</p><h3>Kanban do ciclo de vida</h3></div><span>Role horizontalmente para ver todas as fases</span></div>
      <div className="kanban-board lifecycle-board">
        {LIFECYCLE_GROUPS.map((group) => {
          const groupDogs = filteredDogs.filter((dog) => dog.group === group.id);
          return (
            <article className="lane" key={group.id} style={{ '--lane': group.color }}>
              <header className="lane-header"><strong>{group.title}</strong><span>{groupDogs.length}</span></header>
              <div className="phase-strip">Fases micro {group.phases} · {group.span}</div>
              <div className="dog-stack">
                {groupDogs.map((dog) => <DogCard key={dog.rga} dog={dog} onClick={(event) => openDog(dog, null, event.currentTarget)} />)}
                {!groupDogs.length && <p className="lane-empty">{query || showAlertsOnly ? 'Nenhum cão encontrado nesta fase.' : 'Nenhum cão nesta fase.'}</p>}
              </div>
            </article>
          );
        })}
      </div>
      {selection && <DogDetailsModal {...selection} onClose={closeModal} />}
    </section>
  );
}
