import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, PawPrint, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '../context/DogContext.jsx';
import { groupForDog, phases } from '../data/mockData.js';

const PAGE_SIZE = 12;

export default function DogsPage() {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [sex, setSex] = useState('all');
  const [health, setHealth] = useState('all');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);

  const groupOptions = useMemo(() => Array.from(new Map(dogs.map((dog) => {
    const phaseGroup = groupForDog(dog);
    return [phaseGroup.id, phaseGroup.title];
  })).entries()), [dogs]);

  const healthCounts = useMemo(() => ({ alert: dogs.filter(hasHealthAlert).length, ok: dogs.filter((dog) => !hasHealthAlert(dog)).length }), [dogs]);
  const filteredDogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dogs.filter((dog) => {
      const searchable = `${dog.name} ${dog.rga} ${dog.code} ${dog.breed}`.toLowerCase();
      const dogHealth = hasHealthAlert(dog) ? 'alert' : 'ok';
      return (!needle || searchable.includes(needle)) && (group === 'all' || dog.group === group) && (sex === 'all' || dog.sex === sex) && (health === 'all' || dogHealth === health);
    }).sort((a, b) => {
      if (sort === 'phase') return a.phase - b.phase || a.name.localeCompare(b.name, 'pt-BR');
      if (sort === 'health') return Number(hasHealthAlert(b)) - Number(hasHealthAlert(a)) || a.name.localeCompare(b.name, 'pt-BR');
      return a.name.localeCompare(b.name, 'pt-BR');
    });
  }, [dogs, query, group, sex, health, sort]);

  useEffect(() => setPage(1), [query, group, sex, health, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredDogs.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleDogs = filteredDogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return <section className="screen dogs-directory animate-in">
    <header className="dogs-directory-heading"><div><p className="eyebrow">Cadastro e acompanhamento</p><h2>Cães</h2><p>Consulte os cães cadastrados e acesse o prontuário completo.</p></div><button className="primary-action" onClick={() => navigate('/caes/novo')}><Plus size={18} /> Cadastrar cão</button></header>
    <div className="dogs-directory-toolbar">
      <label className="dogs-directory-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, RGA, código ou raça" /></label>
      <select value={group} onChange={(event) => setGroup(event.target.value)} aria-label="Filtrar por fase"><option value="all">Todas as fases</option>{groupOptions.map(([id, title]) => <option value={id} key={id}>{title}</option>)}</select>
      <select value={sex} onChange={(event) => setSex(event.target.value)} aria-label="Filtrar por sexo"><option value="all">Todos os sexos</option><option value="Macho">Macho</option><option value="Fêmea">Fêmea</option></select>
      <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar cães"><option value="name">Nome do cão</option><option value="phase">Fase do ciclo</option><option value="health">Prioridade de saúde</option></select>
    </div>
    <div className="dogs-health-filters" aria-label="Filtrar por situação de saúde"><button className={health === 'all' ? 'active' : ''} onClick={() => setHealth('all')}>Todos <span>{dogs.length}</span></button><button className={health === 'alert' ? 'active' : ''} onClick={() => setHealth('alert')}>Com alertas <span>{healthCounts.alert}</span></button><button className={health === 'ok' ? 'active' : ''} onClick={() => setHealth('ok')}>Sem alertas <span>{healthCounts.ok}</span></button></div>

    {visibleDogs.length ? <div className="dogs-directory-grid">{visibleDogs.map((dog) => {
      const phaseGroup = groupForDog(dog);
      const alert = hasHealthAlert(dog);
      return <article className="dogs-directory-card" key={dog.rga}>
        <div className="dogs-card-identity"><span className="dogs-card-avatar"><PawPrint size={22} /></span><div><h3>{dog.name}</h3><small>{dog.rga}</small></div></div>
        <span className={`dogs-card-health ${alert ? 'alert' : 'ok'}`}>{alert ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}{alert ? dog.alert || 'Requer atenção' : 'Sem alertas'}</span>
        <div className="dogs-card-facts"><span><small>Sexo</small><strong>{dog.sex}</strong></span><span><small>Raça</small><strong>{dog.breed}</strong></span></div>
        <div className="dogs-card-phase"><small>{phaseGroup.title}</small><strong>{dog.phase > 17 ? 'Pós-entrega' : `Fase ${dog.phase} · ${phases[dog.phase - 1] || 'Acompanhamento'}`}</strong><div><i style={{ width: `${dog.progress}%`, background: phaseGroup.color }} /></div></div>
        <small className="dogs-card-responsible">Responsável: {dog.trainer || dog.responsibleTeam || 'Não definido'}</small>
        <button onClick={() => navigate(`/caes/${dog.rga}`)}>Abrir prontuário</button>
      </article>;
    })}</div> : <div className="dogs-directory-empty"><h3>Nenhum cão encontrado</h3><p>Altere a busca ou os filtros para visualizar outros cães.</p></div>}

    <footer className="dogs-directory-pagination"><span>{filteredDogs.length ? `Exibindo ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredDogs.length)} de ${filteredDogs.length} cães` : 'Nenhum cão para exibir'}</span>{pageCount > 1 && <div><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} aria-label="Página anterior"><ChevronLeft size={17} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={number === safePage ? 'active' : ''} onClick={() => setPage(number)} key={number}>{number}</button>)}<button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={safePage === pageCount} aria-label="Próxima página"><ChevronRight size={17} /></button></div>}</footer>
  </section>;
}

function hasHealthAlert(dog) {
  return Boolean(dog.alert || (dog.workItems || []).some((item) => item.isOverdue || item.blocksPhase || ['critical', 'high'].includes(item.severity)));
}
