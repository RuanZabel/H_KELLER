import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, PawPrint, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '../context/DogContext.jsx';
import { groupForDog } from '../data/mockData.js';

const PAGE_SIZE = 12;

export default function FeedingPage() {
  const { dogs } = useDogs();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('priority');
  const [page, setPage] = useState(1);

  const preparedDogs = useMemo(() => dogs.map((dog) => ({ ...dog, feedingSummary: buildFeedingSummary(dog) })), [dogs]);
  const phaseOptions = useMemo(() => Array.from(new Map(preparedDogs.map((dog) => {
    const group = groupForDog(dog);
    return [group.id, group.title];
  })).entries()), [preparedDogs]);
  const counts = useMemo(() => ({
    active: preparedDogs.filter((dog) => dog.feedingSummary.status === 'active').length,
    review: preparedDogs.filter((dog) => dog.feedingSummary.status === 'review').length,
    transition: preparedDogs.filter((dog) => dog.feedingSummary.status === 'transition').length
  }), [preparedDogs]);

  const filteredDogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return preparedDogs.filter((dog) => {
      const feeding = dog.feeding || {};
      const searchable = `${dog.name} ${dog.rga} ${dog.code} ${feeding.diet || ''}`.toLowerCase();
      return (!needle || searchable.includes(needle)) && (phase === 'all' || dog.group === phase) && (status === 'all' || dog.feedingSummary.status === status);
    }).sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'pt-BR');
      if (sort === 'phase') return a.phase - b.phase || a.name.localeCompare(b.name, 'pt-BR');
      return a.feedingSummary.priority - b.feedingSummary.priority || a.name.localeCompare(b.name, 'pt-BR');
    });
  }, [preparedDogs, query, phase, status, sort]);

  useEffect(() => setPage(1), [query, phase, status, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredDogs.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleDogs = filteredDogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return <section className="screen feeding-directory animate-in">
    <header className="feeding-directory-heading"><div><p className="eyebrow">Receituário com vigência</p><h2>Planos de alimentação</h2><p>Selecione um cão para consultar ou atualizar sua dieta.</p></div><button className="primary-action"><Plus size={18} /> Nova dieta</button></header>
    <div className="feeding-directory-toolbar">
      <label className="feeding-directory-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cão, RGA, código ou dieta" /></label>
      <select value={phase} onChange={(event) => setPhase(event.target.value)} aria-label="Filtrar por fase"><option value="all">Todas as fases</option>{phaseOptions.map(([id, title]) => <option value={id} key={id}>{title}</option>)}</select>
      <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar cães"><option value="priority">Prioridade de revisão</option><option value="name">Nome do cão</option><option value="phase">Fase do ciclo</option></select>
    </div>
    <div className="feeding-status-filters" aria-label="Filtrar por situação alimentar"><button className={status === 'all' ? 'active' : ''} onClick={() => setStatus('all')}>Todos <span>{dogs.length}</span></button><button className={status === 'active' ? 'active' : ''} onClick={() => setStatus('active')}>Dietas ativas <span>{counts.active}</span></button><button className={status === 'review' ? 'active' : ''} onClick={() => setStatus('review')}>Revisões próximas <span>{counts.review}</span></button><button className={status === 'transition' ? 'active' : ''} onClick={() => setStatus('transition')}>Em transição <span>{counts.transition}</span></button></div>

    {visibleDogs.length ? <div className="feeding-dog-grid">{visibleDogs.map((dog) => {
      const feeding = dog.feeding || {};
      const summary = dog.feedingSummary;
      const StatusIcon = summary.status === 'active' ? CheckCircle2 : AlertTriangle;
      const group = groupForDog(dog);
      return <article className="feeding-dog-card" key={dog.rga}>
        <div className="feeding-dog-identity"><span className="feeding-dog-avatar"><PawPrint size={22} /></span><div><h3>{dog.name}</h3><small>{dog.rga}</small></div></div>
        <span className={`feeding-dog-status ${summary.status}`}><StatusIcon size={15} /> {summary.label}</span>
        <div className="feeding-diet-name"><small>Dieta atual</small><strong>{feeding.diet || 'Sem dieta cadastrada'}</strong></div>
        <div className="feeding-dog-details"><span>{feeding.amount || 'Quantidade não informada'}</span><span>{feeding.frequency || 'Frequência não informada'}</span></div>
        <small className="feeding-phase-label">{group.title} · {dog.phase > 17 ? 'Pós-entrega' : `Fase ${dog.phase}`}</small>
        <button onClick={() => navigate(`/caes/${dog.rga}`, { state: { initialTab: 'alimentacao', fromFeeding: true } })}>Abrir alimentação</button>
      </article>;
    })}</div> : <div className="feeding-directory-empty"><h3>Nenhum cão encontrado</h3><p>Altere a busca ou os filtros para visualizar outros cães.</p></div>}

    <footer className="feeding-directory-pagination"><span>{filteredDogs.length ? `Exibindo ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredDogs.length)} de ${filteredDogs.length} cães` : 'Nenhum cão para exibir'}</span>{pageCount > 1 && <div><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} aria-label="Página anterior"><ChevronLeft size={17} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={number === safePage ? 'active' : ''} onClick={() => setPage(number)} key={number}>{number}</button>)}<button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={safePage === pageCount} aria-label="Próxima página"><ChevronRight size={17} /></button></div>}</footer>
  </section>;
}

function buildFeedingSummary(dog) {
  if (!dog.feeding) return { status: 'review', priority: 0, label: 'Cadastrar dieta' };
  const feedingAlert = (dog.workItems || []).find((item) => item.category === 'alimentacao');
  if (feedingAlert) return { status: 'review', priority: 0, label: feedingAlert.title || 'Revisão necessária' };
  if (dog.phase <= 5) return { status: 'transition', priority: 1, label: 'Transição gradual' };
  return { status: 'active', priority: 2, label: 'Dieta ativa' };
}
