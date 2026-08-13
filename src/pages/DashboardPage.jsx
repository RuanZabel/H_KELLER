import { ArrowRight, CircleAlert, Filter, Search, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DogDetailsModal from '../components/dashboard/DogDetailsModal.jsx';
import WorkQueue from '../components/dashboard/WorkQueue.jsx';
import DogCard from '../components/dogs/DogCard.jsx';
import { useDogs } from '../context/DogContext.jsx';
import { useConfig } from '../context/ConfigContext.jsx';
import { buildWorkQueue, LIFECYCLE_GROUPS } from '../data/dashboardData.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dogs, moveDogToGroup } = useDogs();
  const { lifecycleCycles } = useConfig();
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState(null);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [draggedDog, setDraggedDog] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [movementMessage, setMovementMessage] = useState('');
  const [pendingMove, setPendingMove] = useState(null);
  const workItems = useMemo(() => buildWorkQueue(dogs), [dogs]);
  const boardGroups = useMemo(() => lifecycleCycles.filter((cycle) => cycle.active && cycle.usedInKanban).map((cycle, index) => {
    const existing = LIFECYCLE_GROUPS.find((group) => group.id === cycle.id);
    return existing || { id: cycle.id, title: cycle.name, phases: 'configurável', firstPhase: index + 1, span: `${cycle.items.length} itens`, color: '#7f9186' };
  }), [lifecycleCycles]);
  const filteredDogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dogs.filter((dog) => {
      const matchesQuery = !needle || `${dog.name} ${dog.rga} ${dog.code}`.toLowerCase().includes(needle);
      return matchesQuery && (!showAlertsOnly || dog.workItems?.some((item) => item.isOverdue || item.blocksPhase || item.severity === 'critical'));
    });
  }, [dogs, query, showAlertsOnly]);
  const openDog = (dog, origin, trigger) => setSelection({ dog, origin, trigger });
  const closeModal = useCallback(() => setSelection(null), []);

  function requestMove(dog, targetGroup) {
    if (!dog || !targetGroup || dog.group === targetGroup.id) return;
    const currentIndex = boardGroups.findIndex((group) => group.id === dog.group);
    const targetIndex = boardGroups.findIndex((group) => group.id === targetGroup.id);
    const movingForward = targetIndex > currentIndex;
    const pendingCriteria = (dog.criteria || []).filter((criterion) => criterion.status !== 'Concluído');
    if (movingForward && pendingCriteria.length) {
      setMovementMessage(`${dog.name} não foi movido: conclua ${pendingCriteria.length} ${pendingCriteria.length === 1 ? 'critério pendente' : 'critérios pendentes'} da fase atual.`);
      return;
    }
    const currentGroup = boardGroups.find((group) => group.id === dog.group);
    setPendingMove({ dog, targetGroup, currentGroup });
  }

  function confirmMove() {
    if (!pendingMove) return;
    const { dog, targetGroup } = pendingMove;
    const targetCycle = lifecycleCycles.find((cycle) => cycle.id === targetGroup.id);
    const triggeredItems = (targetCycle?.items || []).filter((item) => typeof item === 'object' && item.active !== false && item.schedule?.mode === 'lane_entry' && (item.schedule.targetCycleId || targetCycle.id) === targetGroup.id).map((item) => ({ id: `lane-${dog.rga}-${item.id}`, sourceItemId: item.id, category: item.type?.toLowerCase() || 'outro', categoryLabel: item.type || 'Item do ciclo', title: item.name, displayDate: 'Ao entrar na raia', severity: item.required ? 'high' : 'medium', status: 'Pendente', responsible: item.responsible, required: item.required, blocksPhase: item.required }));
    moveDogToGroup(dog.rga, targetGroup.id, targetGroup.firstPhase, targetGroup.title, targetGroup.color, triggeredItems);
    setMovementMessage(`${dog.name} foi movido para ${targetGroup.title}.${triggeredItems.length ? ` ${triggeredItems.length} ${triggeredItems.length === 1 ? 'pendência foi criada' : 'pendências foram criadas'}.` : ''}`);
    setPendingMove(null);
  }

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
      {movementMessage && <div className="movement-message" role="status"><span>{movementMessage}</span><button onClick={() => setMovementMessage('')} aria-label="Fechar mensagem">×</button></div>}
      <div className="kanban-heading"><div><p className="eyebrow">Jornada</p><h3>Kanban do ciclo de vida</h3></div><span>Role horizontalmente para ver todas as fases</span></div>
      <div className="kanban-board lifecycle-board">
        {boardGroups.map((group) => {
          const groupDogs = filteredDogs.filter((dog) => dog.group === group.id);
          return (
            <article
              className={`lane ${dropTarget === group.id ? 'is-drop-target' : ''}`}
              key={group.id}
              style={{ '--lane': group.color }}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropTarget(group.id); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget(null); }}
              onDrop={(event) => {
                event.preventDefault();
                requestMove(draggedDog, group);
                setDraggedDog(null);
                setDropTarget(null);
              }}
            >
              <header className="lane-header"><strong>{group.title}</strong><span>{groupDogs.length}</span></header>
              <div className="phase-strip">Fases micro {group.phases} · {group.span}</div>
              <div className="dog-stack">
                {groupDogs.map((dog) => {
                  const groupIndex = boardGroups.findIndex((item) => item.id === group.id);
                  return <DogCard
                    key={dog.rga}
                    dog={dog}
                    onClick={() => navigate(`/caes/${dog.rga}`, { state: { initialTab: 'saude', fromLifecycle: true } })}
                    onDragStart={(event) => {
                      setDraggedDog(dog);
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', dog.rga);
                    }}
                    onDragEnd={() => { setDraggedDog(null); setDropTarget(null); }}
                    onMovePrevious={groupIndex > 0 ? () => requestMove(dog, boardGroups[groupIndex - 1]) : null}
                    onMoveNext={groupIndex < boardGroups.length - 1 ? () => requestMove(dog, boardGroups[groupIndex + 1]) : null}
                  />;
                })}
                {!groupDogs.length && <p className="lane-empty">{query || showAlertsOnly ? 'Nenhum cão encontrado nesta fase.' : 'Nenhum cão nesta fase.'}</p>}
              </div>
            </article>
          );
        })}
      </div>
      {selection && <DogDetailsModal {...selection} onClose={closeModal} />}
      {pendingMove && <div className="kanban-confirm-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setPendingMove(null)}>
        <section className="kanban-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="move-confirm-title" aria-describedby="move-confirm-description">
          <button className="kanban-confirm-close" onClick={() => setPendingMove(null)} aria-label="Fechar"><X size={20} /></button>
          <div className="kanban-confirm-icon"><CircleAlert size={27} /></div>
          <div><p className="eyebrow">Alteração no ciclo de vida</p><h2 id="move-confirm-title">Confirmar mudança de fase?</h2><p id="move-confirm-description">Você realmente deseja mover <strong>{pendingMove.dog.name}</strong> para outra posição no Kanban?</p></div>
          <div className="kanban-move-route"><span>{pendingMove.currentGroup?.title || 'Fase atual'}</span><ArrowRight size={19} /><strong>{pendingMove.targetGroup.title}</strong></div>
          <aside><CircleAlert size={17} /> Esta alteração atualizará a fase atual do cão no sistema.</aside>
          <footer><button onClick={() => setPendingMove(null)}>Cancelar</button><button className="primary-action" onClick={confirmMove}>Confirmar alteração</button></footer>
        </section>
      </div>}
    </section>
  );
}
