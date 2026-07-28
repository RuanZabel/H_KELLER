import { Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useConfig } from '../context/ConfigContext.jsx';
import { phases } from '../data/mockData.js';

const eventTypes = ['Vacina', 'Exame', 'Vermifugação', 'Cirurgia', 'Intercorrência', 'Avaliação clínica'];
const emptyEvent = { type: 'Vacina', name: '', dose: '', offsetDays: 0, phase: 1, required: true };

export default function ConfigPage() {
  const {
    activateEventList,
    addDogBreed,
    addEventList,
    addEventToList,
    createEventListFrom,
    deactivateEventList,
    dogBreeds,
    eventLists,
    removeEventFromList,
    toggleDogBreed,
    updateEventInList
  } = useConfig();
  const [breedName, setBreedName] = useState('');
  const [breedMessage, setBreedMessage] = useState('');
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState(eventLists[0]?.id || '');
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [eventPosition, setEventPosition] = useState(1);
  const selectedList = eventLists.find((list) => list.id === selectedListId) || eventLists[0];
  const hasAlternativeEventList = eventLists.some((list) => list.id !== selectedList.id);

  function handleBreedSubmit(event) {
    event.preventDefault();

    const created = addDogBreed(breedName);
    setBreedMessage(created ? 'Raça cadastrada.' : 'Informe uma raça nova para cadastrar.');
    if (created) {
      setBreedName('');
    }
  }

  function handleEventListSubmit(event) {
    event.preventDefault();
    if (addEventList(newListName)) {
      setNewListName('');
    }
  }

  function duplicateSelectedList() {
    const newId = createEventListFrom(selectedList.id);
    setSelectedListId(newId);
  }

  function handleAddEvent(event) {
    event.preventDefault();
    addEventToList(selectedList.id, eventForm, eventPosition);
    setEventForm(emptyEvent);
    setEventPosition((selectedList.events.length || 0) + 2);
  }

  function updateEventForm(field, value) {
    setEventForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="screen animate-in">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Configurações</p>
          <h2>Protocolos e tipos de evento</h2>
        </div>
      </div>

      <div className="config-layout">
        <div className="config-stack">
          <section className="config-panel">
            <h3>Cadastro de listas de evento</h3>
            <form className="breed-form" onSubmit={handleEventListSubmit}>
              <label className="data-field">
                <span>Nome da nova lista</span>
                <input value={newListName} onChange={(event) => setNewListName(event.target.value)} placeholder="Ex.: Protocolo filhotes 2027" />
              </label>
              <button className="primary-action" type="submit"><Plus size={17} /> Criar lista</button>
            </form>

            <div className="event-list-grid">
              {eventLists.map((list) => (
                <button
                  className={`${selectedList.id === list.id ? 'selected' : ''} ${list.active ? 'active' : 'inactive'}`}
                  key={list.id}
                  type="button"
                  onClick={() => setSelectedListId(list.id)}
                >
                  <strong>{list.name}</strong>
                  <span>{list.events.length} eventos · {list.active ? 'Ativa' : 'Desativada'}</span>
                </button>
              ))}
            </div>
          </section>

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
              {dogBreeds.map((breed) => (
                <article className={breed.active ? 'active' : 'inactive'} key={breed.name}>
                  <div>
                    <strong>{breed.name}</strong>
                    <span>{breed.active ? 'Disponível no cadastro' : 'Desativada para novos cadastros'}</span>
                  </div>
                  <button className="ghost-action" type="button" onClick={() => toggleDogBreed(breed.name)}>
                    {breed.active ? 'Desativar' : 'Reativar'}
                  </button>
                </article>
              ))}
            </div>
          </section>

        </div>

        <section className="config-panel event-editor-panel">
          <div className="event-editor-header">
            <div>
              <p className="eyebrow">Editor da lista</p>
              <h3>{selectedList.name}</h3>
              <span>{selectedList.active ? 'Lista ativa aplicada aos novos cães' : 'Lista desativada para novos cadastros'}</span>
            </div>
            <div className="event-editor-actions">
              <button className="ghost-action" type="button" onClick={duplicateSelectedList}><Copy size={16} /> Criar com base nesta</button>
              {selectedList.active ? (
                <button className="ghost-action" type="button" disabled={!hasAlternativeEventList} onClick={() => deactivateEventList(selectedList.id)}>Desativar</button>
              ) : (
                <button className="primary-action" type="button" onClick={() => activateEventList(selectedList.id)}>Ativar lista</button>
              )}
            </div>
          </div>
          {selectedList.active && !hasAlternativeEventList && (
            <p className="config-message">Crie ou duplique outra lista antes de desativar a lista ativa.</p>
          )}

          <form className="event-form" onSubmit={handleAddEvent}>
            <label className="data-field">
              <span>Tipo</span>
              <select value={eventForm.type} onChange={(event) => updateEventForm('type', event.target.value)}>
                {eventTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="data-field">
              <span>Nome do evento</span>
              <input value={eventForm.name} onChange={(event) => updateEventForm('name', event.target.value)} placeholder="Ex.: V10" required />
            </label>
            <label className="data-field">
              <span>Dose / descrição</span>
              <input value={eventForm.dose} onChange={(event) => updateEventForm('dose', event.target.value)} placeholder="Ex.: 1ª múltipla" />
            </label>
            <label className="data-field">
              <span>Dias de vida</span>
              <input type="number" min="0" value={eventForm.offsetDays} onChange={(event) => updateEventForm('offsetDays', event.target.value)} />
            </label>
            <label className="data-field">
              <span>Fase</span>
              <select value={eventForm.phase} onChange={(event) => updateEventForm('phase', event.target.value)}>
                {phases.map((phase, index) => <option key={phase} value={index + 1}>{index + 1} · {phase}</option>)}
              </select>
            </label>
            <label className="data-field">
              <span>Posição</span>
              <input type="number" min="1" max={selectedList.events.length + 1} value={eventPosition} onChange={(event) => setEventPosition(event.target.value)} />
            </label>
            <label className="toggle-field event-required">
              <span>Obrigatório</span>
              <button className={eventForm.required ? 'selected' : ''} type="button" onClick={() => updateEventForm('required', !eventForm.required)}>
                {eventForm.required ? 'Sim' : 'Não'}
              </button>
            </label>
            <button className="primary-action event-form-submit" type="submit"><Plus size={17} /> Inserir evento</button>
          </form>

          <div className="event-editor-list">
            {selectedList.events.map((event, index) => (
              <article key={event.id}>
                <span className="event-order">{index + 1}</span>
                <select value={event.type} onChange={(inputEvent) => updateEventInList(selectedList.id, event.id, 'type', inputEvent.target.value)}>
                  {eventTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
                <input value={event.name} onChange={(inputEvent) => updateEventInList(selectedList.id, event.id, 'name', inputEvent.target.value)} aria-label="Nome do evento" />
                <input value={event.dose} onChange={(inputEvent) => updateEventInList(selectedList.id, event.id, 'dose', inputEvent.target.value)} aria-label="Dose do evento" />
                <input type="number" min="0" value={event.offsetDays} onChange={(inputEvent) => updateEventInList(selectedList.id, event.id, 'offsetDays', inputEvent.target.value)} aria-label="Dias de vida" />
                <button className="icon-action" type="button" aria-label="Excluir evento" onClick={() => removeEventFromList(selectedList.id, event.id)}>
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
            {selectedList.events.length === 0 && <p className="config-message">Esta lista ainda não tem eventos.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}
