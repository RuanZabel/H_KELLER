import { createContext, useContext, useMemo, useState } from 'react';
import { standardHealthProtocol } from '../data/healthProtocol.js';

const initialDogBreeds = [
  { name: 'Labrador', active: true },
  { name: 'Golden Retriever', active: true },
  { name: 'Pastor Alemão', active: true },
  { name: 'Poodle', active: true },
  { name: 'Outra', active: true }
];
const initialAnimalTypes = [{ name: 'Cão', active: true }];
const ConfigContext = createContext(null);
const initialEventLists = [
  {
    id: 'default-first-year',
    name: 'Protocolo padrão do primeiro ano',
    active: true,
    events: standardHealthProtocol
  }
];
const initialLifecycleCycles = [
  { id: 'canil', name: 'Canil e neonatal', responsible: 'Administrativo / criador', usedInKanban: true, active: true, items: ['Avaliações iniciais', 'Vermifugação', 'Primeiras vacinas', 'Exames', 'Liberação para socialização'] },
  { id: 'socializacao', name: 'Socialização', responsible: 'Equipe de socialização', usedInKanban: true, active: true, items: ['Família socializadora', 'Protocolo vacinal', 'Desenvolvimento', 'Alimentação', 'Avaliações periódicas'] },
  { id: 'aptidao', name: 'Avaliação de aptidão', responsible: 'Equipe técnica', usedInKanban: true, active: true, items: ['Avaliação clínica', 'Exames oftalmológicos', 'PennHIP', 'Radiografias', 'Avaliação comportamental'] },
  { id: 'castracao', name: 'Transição para treinamento', responsible: 'Veterinário', usedInKanban: true, active: true, items: ['Avaliação clínica', 'Avaliação anestésica', 'Castração', 'Definição da modalidade', 'Liberação para treinamento'] },
  { id: 'treino', name: 'Treinamento e pré-entrega', responsible: 'Treinador', usedInKanban: true, active: true, items: ['Treinamento formal', 'Treinamento especializado', 'Avaliação pré-entrega', 'Laudo de aptidão'] },
  { id: 'entrega', name: 'Entrega ao tutor', responsible: 'Equipe técnica', usedInKanban: true, active: true, items: ['Pareamento', 'Adaptação', 'Treinamento conjunto', 'Entrega oficial', 'Plano de acompanhamento'] },
  { id: 'acompanhamento', name: 'Acompanhamento do tutor', responsible: 'Equipe de acompanhamento', usedInKanban: true, active: true, items: ['Visitas', 'Saúde do cão', 'Desempenho', 'Bem-estar', 'Reavaliações'] }
];

function normalizeBreeds(breeds) {
  return breeds.map((breed) => {
    if (typeof breed === 'string') {
      return { name: breed, active: true };
    }

    return {
      ...breed,
      name: breed.name,
      active: breed.active !== false
    };
  }).filter((breed) => breed.name);
}

function loadBreeds() {
  try {
    const stored = localStorage.getItem('hk-dog-breeds');
    return stored ? normalizeBreeds(JSON.parse(stored)) : initialDogBreeds;
  } catch {
    return initialDogBreeds;
  }
}

function loadAnimalTypes() {
  try {
    const stored = localStorage.getItem('hk-animal-types');
    return stored ? normalizeBreeds(JSON.parse(stored)) : initialAnimalTypes;
  } catch {
    return initialAnimalTypes;
  }
}

function normalizeEventLists(lists) {
  return lists.map((list, listIndex) => ({
    id: list.id || `event-list-${listIndex + 1}`,
    name: list.name || `Lista de eventos ${listIndex + 1}`,
    active: Boolean(list.active),
    events: (list.events || []).map((event, eventIndex) => ({
      id: event.id || `event-${Date.now()}-${eventIndex}`,
      type: event.type || 'Avaliação clínica',
      name: event.name || 'Novo evento',
      dose: event.dose || '',
      offsetDays: Number(event.offsetDays) || 0,
      phase: Number(event.phase) || 1,
      required: event.required !== false
    }))
  }));
}

function loadEventLists() {
  try {
    const stored = localStorage.getItem('hk-event-lists');
    const lists = stored ? normalizeEventLists(JSON.parse(stored)) : initialEventLists;
    return ensureOneActiveList(lists);
  } catch {
    return initialEventLists;
  }
}

function ensureOneActiveList(lists) {
  if (!lists.some((list) => list.active)) {
    return lists.map((list, index) => ({ ...list, active: index === 0 }));
  }

  let activeFound = false;
  return lists.map((list) => {
    if (!list.active || activeFound) {
      return { ...list, active: false };
    }

    activeFound = true;
    return { ...list, active: true };
  });
}

function loadLifecycleCycles() {
  try {
    const stored = localStorage.getItem('hk-lifecycle-cycles');
    return stored ? JSON.parse(stored) : initialLifecycleCycles;
  } catch {
    return initialLifecycleCycles;
  }
}

export function ConfigProvider({ children }) {
  const [dogBreeds, setDogBreeds] = useState(loadBreeds);
  const [animalTypes, setAnimalTypes] = useState(loadAnimalTypes);
  const [eventLists, setEventLists] = useState(loadEventLists);
  const [lifecycleCycles, setLifecycleCycles] = useState(loadLifecycleCycles);

  function persistLifecycleCycles(nextCycles) {
    setLifecycleCycles(nextCycles);
    localStorage.setItem('hk-lifecycle-cycles', JSON.stringify(nextCycles));
  }

  function addLifecycleCycle(data) {
    const cycle = { id: `cycle-${Date.now()}`, name: data.name.trim(), responsible: data.responsible.trim(), usedInKanban: data.usedInKanban !== false, active: data.active !== false, items: data.items.filter(Boolean) };
    if (!cycle.name) return false;
    persistLifecycleCycles([...lifecycleCycles, cycle]);
    return true;
  }

  function updateLifecycleCycle(id, data) {
    persistLifecycleCycles(lifecycleCycles.map((cycle) => cycle.id === id ? { ...cycle, ...data, name: data.name.trim(), responsible: data.responsible.trim(), items: data.items.filter(Boolean) } : cycle));
  }

  function toggleLifecycleCycle(id) {
    persistLifecycleCycles(lifecycleCycles.map((cycle) => cycle.id === id ? { ...cycle, active: !cycle.active } : cycle));
  }

  function moveLifecycleCycle(id, direction) {
    const index = lifecycleCycles.findIndex((cycle) => cycle.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= lifecycleCycles.length) return;
    const next = [...lifecycleCycles];
    [next[index], next[target]] = [next[target], next[index]];
    persistLifecycleCycles(next);
  }

  function addDogBreed(data) {
    const values = typeof data === 'string' ? { name: data } : data;
    const normalizedName = values.name.trim();
    if (!normalizedName) {
      return false;
    }

    const alreadyExists = dogBreeds.some((breed) => breed.name.toLowerCase() === normalizedName.toLowerCase());
    if (alreadyExists) {
      return false;
    }

    persistBreeds([...dogBreeds, { ...values, name: normalizedName, animalType: values.animalType || 'Cão', available: values.available !== false, active: true }]);
    return true;
  }

  function toggleDogBreed(name) {
    const nextBreeds = dogBreeds.map((breed) => (
      breed.name === name ? { ...breed, active: !breed.active } : breed
    ));
    persistBreeds(nextBreeds);
  }

  function updateDogBreed(name, data) {
    const normalizedName = data.name.trim();
    if (!normalizedName) return false;
    persistBreeds(dogBreeds.map((breed) => breed.name === name ? { ...breed, ...data, name: normalizedName } : breed));
    return true;
  }

  function persistBreeds(nextBreeds) {
    const sortedBreeds = nextBreeds.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    setDogBreeds(sortedBreeds);
    localStorage.setItem('hk-dog-breeds', JSON.stringify(sortedBreeds));
  }

  function addAnimalType(data) {
    const values = typeof data === 'string' ? { name: data } : data;
    const normalizedName = values.name.trim();
    if (!normalizedName || animalTypes.some((type) => type.name.toLowerCase() === normalizedName.toLowerCase())) return false;
    persistAnimalTypes([...animalTypes, { ...values, name: normalizedName, label: values.label || normalizedName, plural: values.plural || `${normalizedName}s`, active: true }]);
    return true;
  }

  function toggleAnimalType(name) {
    persistAnimalTypes(animalTypes.map((type) => type.name === name ? { ...type, active: !type.active } : type));
  }

  function updateAnimalType(name, data) {
    const normalizedName = data.name.trim();
    if (!normalizedName) return false;
    persistAnimalTypes(animalTypes.map((type) => type.name === name ? { ...type, ...data, name: normalizedName } : type));
    return true;
  }

  function persistAnimalTypes(nextTypes) {
    const sorted = [...nextTypes].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    setAnimalTypes(sorted);
    localStorage.setItem('hk-animal-types', JSON.stringify(sorted));
  }

  function createEventListFrom(sourceListId) {
    const sourceList = eventLists.find((list) => list.id === sourceListId) || activeEventList;
    const nextList = {
      id: `event-list-${Date.now()}`,
      name: `${sourceList.name} - cópia`,
      active: false,
      events: sourceList.events.map((event, index) => ({
        ...event,
        id: `${event.id}-copy-${Date.now()}-${index}`
      }))
    };

    persistEventLists([...eventLists, nextList]);
    return nextList.id;
  }

  function addEventList(name) {
    const normalizedName = name.trim();
    if (!normalizedName) {
      return false;
    }

    persistEventLists([
      ...eventLists,
      {
        id: `event-list-${Date.now()}`,
        name: normalizedName,
        active: false,
        events: []
      }
    ]);
    return true;
  }

  function activateEventList(id) {
    persistEventLists(eventLists.map((list) => ({ ...list, active: list.id === id })));
  }

  function deactivateEventList(id) {
    const list = eventLists.find((item) => item.id === id);
    const fallbackList = eventLists.find((item) => item.id !== id);

    if (list?.active && !fallbackList) {
      return false;
    }

    persistEventLists(eventLists.map((item) => {
      if (item.id === id) {
        return { ...item, active: false };
      }

      if (list?.active && item.id === fallbackList.id) {
        return { ...item, active: true };
      }

      return item;
    }));
    return true;
  }

  function removeEventFromList(listId, eventId) {
    persistEventLists(eventLists.map((list) => (
      list.id === listId
        ? { ...list, events: list.events.filter((event) => event.id !== eventId) }
        : list
    )));
  }

  function addEventToList(listId, eventData, position) {
    persistEventLists(eventLists.map((list) => {
      if (list.id !== listId) {
        return list;
      }

      const nextEvents = [...list.events];
      const requestedPosition = Number.parseInt(position, 10);
      const insertIndex = Number.isFinite(requestedPosition)
        ? Math.max(0, Math.min(requestedPosition - 1, nextEvents.length))
        : nextEvents.length;
      nextEvents.splice(insertIndex, 0, {
        id: `event-${Date.now()}`,
        ...eventData,
        offsetDays: Number(eventData.offsetDays) || 0,
        phase: Number(eventData.phase) || 1,
        required: Boolean(eventData.required)
      });

      return { ...list, events: nextEvents };
    }));
  }

  function updateEventInList(listId, eventId, field, value) {
    persistEventLists(eventLists.map((list) => (
      list.id === listId
        ? {
            ...list,
            events: list.events.map((event) => (
              event.id === eventId
                ? { ...event, [field]: field === 'offsetDays' || field === 'phase' ? Number(value) : value }
                : event
            ))
          }
        : list
    )));
  }

  function persistEventLists(nextLists) {
    const normalizedLists = ensureOneActiveList(nextLists);
    setEventLists(normalizedLists);
    localStorage.setItem('hk-event-lists', JSON.stringify(normalizedLists));
  }

  const activeDogBreeds = useMemo(() => (
    dogBreeds.filter((breed) => breed.active).map((breed) => breed.name)
  ), [dogBreeds]);

  const activeEventList = useMemo(() => (
    eventLists.find((list) => list.active) || eventLists[0]
  ), [eventLists]);

  const value = useMemo(() => ({
    activateEventList,
    activeEventList,
    addAnimalType,
    addLifecycleCycle,
    addDogBreed,
    addEventList,
    addEventToList,
    activeDogBreeds,
    animalTypes,
    createEventListFrom,
    deactivateEventList,
    dogBreeds,
    eventLists,
    lifecycleCycles,
    moveLifecycleCycle,
    removeEventFromList,
    toggleDogBreed,
    toggleAnimalType,
    toggleLifecycleCycle,
    updateLifecycleCycle,
    updateDogBreed,
    updateAnimalType,
    updateEventInList
  }), [activeDogBreeds, activeEventList, animalTypes, dogBreeds, eventLists, lifecycleCycles]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de ConfigProvider');
  }

  return context;
}
