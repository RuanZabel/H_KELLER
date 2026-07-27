import { createContext, useContext, useMemo, useState } from 'react';

const initialDogBreeds = [
  { name: 'Labrador', active: true },
  { name: 'Golden Retriever', active: true },
  { name: 'Pastor Alemão', active: true },
  { name: 'Poodle', active: true },
  { name: 'Outra', active: true }
];
const ConfigContext = createContext(null);

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

export function ConfigProvider({ children }) {
  const [dogBreeds, setDogBreeds] = useState(loadBreeds);

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

  const activeDogBreeds = useMemo(() => (
    dogBreeds.filter((breed) => breed.active).map((breed) => breed.name)
  ), [dogBreeds]);

  const value = useMemo(() => ({
    addDogBreed,
    activeDogBreeds,
    dogBreeds,
    toggleDogBreed
  }), [activeDogBreeds, dogBreeds]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de ConfigProvider');
  }

  return context;
}
