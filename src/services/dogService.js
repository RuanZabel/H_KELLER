import { dogs } from '../data/mockData.js';

export function listDogs() {
  return dogs;
}

export function findDogByRga(rga) {
  return dogs.find((dog) => dog.rga === rga);
}

export function listDogsWithAlerts() {
  return dogs.filter((dog) => dog.alert);
}
