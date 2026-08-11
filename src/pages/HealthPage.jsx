import { AlertTriangle, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, PawPrint, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '../context/DogContext.jsx';
import { groupForDog, phases } from '../data/mockData.js';

const PAGE_SIZE = 12;

export default function HealthPage() {
  const { dogs } = useDogs();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [phase, setPhase] = useState('all');
  const [sort, setSort] = useState('priority');
  const [page, setPage] = useState(1);

  const preparedDogs = useMemo(() => dogs.map((dog) => ({
    ...dog,
    healthSummary: buildHealthSummary(dog)
  })), [dogs]);

  const phaseOptions = useMemo(() => Array.from(new Map(preparedDogs.map((dog) => {
    const group = groupForDog(dog);
    return [group.id, group.title];
  })).entries()), [preparedDogs]);

  const counts = useMemo(() => ({
    attention: preparedDogs.filter((dog) => dog.healthSummary.status === 'attention').length,
    upcoming: preparedDogs.filter((dog) => dog.healthSummary.status === 'upcoming').length,
    current: preparedDogs.filter((dog) => dog.healthSummary.status === 'current').length
  }), [preparedDogs]);

  const filteredDogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = preparedDogs.filter((dog) => {
      const searchable = `${dog.name} ${dog.rga} ${dog.code}`.toLowerCase();
      return (!needle || searchable.includes(needle))
        && (status === 'all' || dog.healthSummary.status === status)
        && (phase === 'all' || dog.group === phase);
    });
    return [...result].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'pt-BR');
      if (sort === 'phase') return a.phase - b.phase || a.name.localeCompare(b.name, 'pt-BR');
      return a.healthSummary.priority - b.healthSummary.priority || a.name.localeCompare(b.name, 'pt-BR');
    });
  }, [preparedDogs, query, status, phase, sort]);

  useEffect(() => setPage(1), [query, status, phase, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredDogs.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleDogs = filteredDogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function openDogHealth(dog) {
    navigate(`/caes/${dog.rga}`, { state: { initialTab: 'saude', fromHealth: true } });
  }

  return <section className="screen health-dog-directory animate-in">
    <header className="health-directory-heading">
      <div><p className="eyebrow">Módulo de saúde</p><h2>Carteiras de saúde</h2><p>Selecione um cão para acessar protocolo, cuidados e histórico.</p></div>
      <span><strong>{dogs.length}</strong> {dogs.length === 1 ? 'cão cadastrado' : 'cães cadastrados'}</span>
    </header>

    <div className="health-directory-toolbar">
      <label className="health-directory-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, RGA ou código" /></label>
      <select value={phase} onChange={(event) => setPhase(event.target.value)} aria-label="Filtrar por fase"><option value="all">Todas as fases</option>{phaseOptions.map(([id, title]) => <option value={id} key={id}>{title}</option>)}</select>
      <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar cães"><option value="priority">Prioridade de saúde</option><option value="name">Nome do cão</option><option value="phase">Fase do ciclo</option></select>
    </div>

    <div className="health-status-filters" aria-label="Filtrar por situação de saúde">
      <button className={status === 'all' ? 'active' : ''} onClick={() => setStatus('all')}>Todos <span>{dogs.length}</span></button>
      <button className={status === 'attention' ? 'active' : ''} onClick={() => setStatus('attention')}>Com pendências <span>{counts.attention}</span></button>
      <button className={status === 'upcoming' ? 'active' : ''} onClick={() => setStatus('upcoming')}>Próximos eventos <span>{counts.upcoming}</span></button>
      <button className={status === 'current' ? 'active' : ''} onClick={() => setStatus('current')}>Em dia <span>{counts.current}</span></button>
    </div>

    {visibleDogs.length ? <div className="health-dog-grid">{visibleDogs.map((dog) => {
      const group = groupForDog(dog);
      const summary = dog.healthSummary;
      const StatusIcon = summary.status === 'attention' ? AlertTriangle : summary.status === 'upcoming' ? CalendarClock : CheckCircle2;
      return <article className="health-dog-card" key={dog.rga}>
        <div className="health-dog-identity"><span className="health-dog-avatar"><PawPrint size={22} /></span><div><h3>{dog.name}</h3><small>{dog.rga}</small></div></div>
        <span className={`health-dog-status ${summary.status}`}><StatusIcon size={15} /> {summary.label}</span>
        <p>{group.title} · {dog.phase > 17 ? 'Pós-entrega' : `Fase ${dog.phase}`}</p>
        <div className="health-protocol-progress"><span><small>Protocolo</small><strong>{summary.progress}% realizado</strong></span><div><i style={{ width: `${summary.progress}%` }} /></div></div>
        <button onClick={() => openDogHealth(dog)}>Acessar página de saúde</button>
      </article>;
    })}</div> : <div className="health-directory-empty"><h3>Nenhum cão encontrado</h3><p>Altere a busca ou os filtros para visualizar outros cães.</p></div>}

    <footer className="health-directory-pagination">
      <span>{filteredDogs.length ? `Exibindo ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredDogs.length)} de ${filteredDogs.length} cães` : 'Nenhum cão para exibir'}</span>
      {pageCount > 1 && <div><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} aria-label="Página anterior"><ChevronLeft size={17} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={number === safePage ? 'active' : ''} onClick={() => setPage(number)} key={number} aria-label={`Página ${number}`}>{number}</button>)}<button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={safePage === pageCount} aria-label="Próxima página"><ChevronRight size={17} /></button></div>}
    </footer>
  </section>;
}

function buildHealthSummary(dog) {
  const workItems = dog.workItems || [];
  const attentionItems = workItems.filter((item) => item.isOverdue || item.blocksPhase || ['critical', 'high'].includes(item.severity));
  const upcomingItems = workItems.filter((item) => !item.isOverdue && !item.blocksPhase && item.dueDate);
  const progress = Math.max(48, Math.min(100, 100 - attentionItems.length * 11 - upcomingItems.length * 5));
  if (attentionItems.length || dog.alert) return { status: 'attention', priority: 0, progress, label: `${Math.max(attentionItems.length, 1)} ${Math.max(attentionItems.length, 1) === 1 ? 'pendência' : 'pendências'}` };
  if (upcomingItems.length) return { status: 'upcoming', priority: 1, progress, label: upcomingItems[0].displayDate ? `Evento ${upcomingItems[0].displayDate}` : 'Próximo evento' };
  return { status: 'current', priority: 2, progress: 100, label: 'Saúde em dia' };
}
