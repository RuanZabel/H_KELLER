import { createContext, useContext, useMemo, useState } from 'react';
import { standardHealthProtocol } from '../data/healthProtocol.js';

const initialDogBreeds = [
  { name: 'Labrador', active: true },
  { name: 'Golden Retriever', active: true },
  { name: 'Pastor Alemão', active: true },
  { name: 'Poodle', active: true },
  { name: 'Outra', active: true }
];
const ConfigContext = createContext(null);
const initialEventLists = [
  {
    id: 'default-first-year',
    name: 'Protocolo padrão do primeiro ano',
    active: true,
    events: standardHealthProtocol
  }
];

function normalizeBreeds(breeds) {
  return breeds.map((breed) => {
    if (typeof breed === 'string') {
      return { name: breed, active: true };
    }

    return {
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

export function ConfigProvider({ children }) {
  const [dogBreeds, setDogBreeds] = useState(loadBreeds);
  const [eventLists, setEventLists] = useState(loadEventLists);

  function addDogBreed(name) {
    const normalizedName = name.trim();
    if (!normalizedName) {
      return false;
    }

    const alreadyExists = dogBreeds.some((breed) => breed.name.toLowerCase() === normalizedName.toLowerCase());
    if (alreadyExists) {
      return false;
    }

    persistBreeds([...dogBreeds, { name: normalizedName, active: true }]);
    return true;
  }

  function toggleDogBreed(name) {
    const nextBreeds = dogBreeds.map((breed) => (
      breed.name === name ? { ...breed, active: !breed.active } : breed
    ));
    persistBreeds(nextBreeds);
  }

  function persistBreeds(nextBreeds) {
    const sortedBreeds = nextBreeds.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    setDogBreeds(sortedBreeds);
    localStorage.setItem('hk-dog-breeds', JSON.stringify(sortedBreeds));
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
    addDogBreed,
    addEventList,
    addEventToList,
    activeDogBreeds,
    createEventListFrom,
    deactivateEventList,
    dogBreeds,
    eventLists,
    removeEventFromList,
    toggleDogBreed,
    updateEventInList
  }), [activeDogBreeds, activeEventList, dogBreeds, eventLists]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de ConfigProvider');
  }

  return context;
}
