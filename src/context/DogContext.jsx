import { createContext, useContext, useMemo, useState } from 'react';
import { dogs as initialDogs } from '../data/mockData.js';

const DogContext = createContext(null);

export function DogProvider({ children }) {
  const [dogs, setDogs] = useState(initialDogs);

  function addDog(dog) {
    setDogs((current) => [dog, ...current]);
    return dog;
  }

  function findDogByRga(rga) {
    return dogs.find((dog) => dog.rga === rga);
  }

  const value = useMemo(() => ({
    addDog,
    dogs,
    findDogByRga
  }), [dogs]);

  return <DogContext.Provider value={value}>{children}</DogContext.Provider>;
}

export function useDogs() {
  const context = useContext(DogContext);
  if (!context) {
    throw new Error('useDogs deve ser usado dentro de DogProvider');
  }
  return context;
}
