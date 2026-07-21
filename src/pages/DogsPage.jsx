import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DogFilters from '../components/dogs/DogFilters.jsx';
import DogTable from '../components/dogs/DogTable.jsx';
import { useDogs } from '../context/DogContext.jsx';

export default function DogsPage() {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ group: 'Todos', sex: 'Todos', health: 'Todos' });

  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      const text = `${dog.name} ${dog.rga}`.toLowerCase();
      const bySearch = text.includes(query.toLowerCase());
      const byGroup = filters.group === 'Todos' || dog.group === filters.group;
      const bySex = filters.sex === 'Todos' || dog.sex === filters.sex;
      const byHealth = filters.health === 'Todos' || dog.health === filters.health;
      return bySearch && byGroup && bySex && byHealth;
    });
  }, [query, filters]);

  return (
    <section className="screen animate-in">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Cadastro e busca</p>
          <h2>Cães</h2>
        </div>
        <button className="primary-action" onClick={() => navigate('/caes/novo')}><Plus size={18} /> Cadastrar</button>
      </div>

      <DogFilters query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} />
      <DogTable dogs={filteredDogs} onOpenDog={(dog) => navigate(`/caes/${dog.rga}`)} />
    </section>
  );
}
