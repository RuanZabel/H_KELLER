import { createContext, useContext, useMemo, useState } from 'react';
import { dogs as initialDogs } from '../data/mockData.js';
import { enrichDogs } from '../data/dashboardData.js';

const DogContext = createContext(null);

export function DogProvider({ children }) {
  const [dogs, setDogs] = useState(() => enrichDogs(initialDogs));

  function addDog(dog) {
    setDogs((current) => {
      const parentRgas = [
        dog.parentRelations?.mother?.rga,
        dog.parentRelations?.father?.rga
      ].filter(Boolean);

      const linkedParents = current.map((currentDog) => {
        if (!parentRgas.includes(currentDog.rga)) {
          return currentDog;
        }

        return {
          ...currentDog,
          children: Array.from(new Set([...(currentDog.children || []), dog.rga]))
        };
      });

      return [dog, ...linkedParents];
    });
    return dog;
  }

  function findDogByRga(rga) {
    return dogs.find((dog) => dog.rga === rga);
  }

  function moveDogToGroup(rga, group, phase, groupTitle, groupColor) {
    setDogs((current) => current.map((dog) => (
      dog.rga === rga
        ? {
            ...dog,
            group,
            phase,
            currentMacroPhaseName: groupTitle,
            currentMacroPhaseColor: groupColor,
            timeline: [
              {
                date: new Intl.DateTimeFormat('pt-BR').format(new Date()),
                title: 'Mudança de fase',
                description: `Movido para uma nova etapa do ciclo de vida.`
              },
              ...(dog.timeline || [])
            ]
          }
        : dog
    )));
  }

  const value = useMemo(() => ({
    addDog,
    dogs,
    findDogByRga,
    moveDogToGroup
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
