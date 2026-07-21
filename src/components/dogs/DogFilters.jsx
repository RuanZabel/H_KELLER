import { Search, X } from 'lucide-react';
import SelectField from '../common/SelectField.jsx';
import { phaseGroups } from '../../data/mockData.js';

export default function DogFilters({ query, setQuery, filters, setFilters }) {
  function clearFilters() {
    setQuery('');
    setFilters({ group: 'Todos', sex: 'Todos', health: 'Todos' });
  }

  return (
    <div className="filters-bar">
      <label className="search-field">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou RGA" />
      </label>
      <SelectField
        label="Estágio"
        value={filters.group}
        onChange={(group) => setFilters({ ...filters, group })}
        options={['Todos', ...phaseGroups.map((group) => group.id)]}
        names={{ canil: 'Canil', socializacao: 'Socialização', aptidao: 'Aptidão', castracao: 'Castração', treino: 'Treino', entrega: 'Entrega' }}
      />
      <SelectField
        label="Sexo"
        value={filters.sex}
        onChange={(sex) => setFilters({ ...filters, sex })}
        options={['Todos', 'Macho', 'Fêmea']}
      />
      <SelectField
        label="Saúde"
        value={filters.health}
        onChange={(health) => setFilters({ ...filters, health })}
        options={['Todos', 'alert', 'ok']}
        names={{ alert: 'Com alerta', ok: 'Sem alerta' }}
      />
      <button className="ghost-action" onClick={clearFilters}><X size={17} /> Limpar filtros</button>
    </div>
  );
}
