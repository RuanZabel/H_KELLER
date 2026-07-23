import { createContext, useContext, useMemo, useState } from 'react';

const initialDogBreeds = ['Labrador', 'Golden Retriever', 'Pastor Alemão', 'Poodle', 'Outra'];
const ConfigContext = createContext(null);

function loadBreeds() {
  try {
    const stored = localStorage.getItem('hk-dog-breeds');
    return stored ? JSON.parse(stored) : initialDogBreeds;
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

    const alreadyExists = dogBreeds.some((breed) => breed.toLowerCase() === normalizedName.toLowerCase());
    if (alreadyExists) {
      return false;
    }

    const nextBreeds = [...dogBreeds, normalizedName].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    setDogBreeds(nextBreeds);
    localStorage.setItem('hk-dog-breeds', JSON.stringify(nextBreeds));
    return true;
  }

  const value = useMemo(() => ({
    addDogBreed,
    dogBreeds
  }), [dogBreeds]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de ConfigProvider');
  }

  return context;
}
