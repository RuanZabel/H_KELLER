import { ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { useConfig } from '../context/ConfigContext.jsx';
import { phases } from '../data/mockData.js';

const eventTypes = ['Vacinação', 'Exame / laudo', 'Vermifugação', 'Cirurgia / anestesia', 'Intercorrência', 'Avaliação clínica'];

export default function ConfigPage() {
  const { addDogBreed, dogBreeds } = useConfig();
  const [breedName, setBreedName] = useState('');
  const [breedMessage, setBreedMessage] = useState('');

  function handleBreedSubmit(event) {
    event.preventDefault();

    const created = addDogBreed(breedName);
    setBreedMessage(created ? 'Raça cadastrada.' : 'Informe uma raça nova para cadastrar.');
    if (created) {
      setBreedName('');
    }
  }

  return (
    <section className="screen animate-in">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Configurações</p>
          <h2>Protocolos e tipos de evento</h2>
        </div>
        <button className="primary-action"><Plus size={18} /> Novo tipo</button>
      </div>

      <div className="config-layout">
        <div className="config-stack">
          <section className="config-panel">
            <h3>Raças de cães</h3>
            <form className="breed-form" onSubmit={handleBreedSubmit}>
              <label className="data-field">
                <span>Nome da raça</span>
                <input value={breedName} onChange={(event) => setBreedName(event.target.value)} placeholder="Ex.: Labrador" />
              </label>
              <button className="primary-action" type="submit"><Plus size={17} /> Adicionar</button>
            </form>
            {breedMessage && <p className="config-message">{breedMessage}</p>}
            <div className="breed-list">
              {dogBreeds.map((breed) => <span key={breed}>{breed}</span>)}
            </div>
          </section>

          <section className="event-types">
            <h3>Tipos de evento</h3>
            {eventTypes.map((type, index) => (
              <button key={type}><span className={`config-dot c${index}`} /> {type}<ChevronRight size={18} /></button>
            ))}
          </section>
        </div>

        <div className="phase-timeline">
          {phases.map((phase, index) => {
            const done = index < 9;
            const current = index === 9;

            return (
              <article className={current ? 'current' : done ? 'done' : ''} key={phase}>
                <span>{index + 1}</span>
                <div>
                  <strong>{phase}</strong>
                  <p>{done ? 'Concluída' : current ? 'Fase atual · eventos em aberto' : 'Pendente'} · {index + 2} eventos registrados</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
