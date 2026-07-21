export const standardHealthProtocol = [
  { id: 'clinical-20', type: 'Avaliação clínica', name: 'Avaliação clínica neonatal', dose: '20 dias', offsetDays: 20, phase: 1, required: true },
  { id: 'deworm-1', type: 'Vermifugação', name: '1ª vermifugação', dose: '20 dias', offsetDays: 20, phase: 3, required: true },
  { id: 'puppy', type: 'Vacina', name: 'Puppy', dose: '30 dias', offsetDays: 30, phase: 2, required: false },
  { id: 'influenza', type: 'Vacina', name: 'Influenza canina', dose: '30 dias', offsetDays: 30, phase: 2, required: false },
  { id: 'clinical-35', type: 'Avaliação clínica', name: 'Avaliação clínica', dose: '35 dias', offsetDays: 35, phase: 3, required: true },
  { id: 'deworm-2', type: 'Vermifugação', name: '2ª vermifugação', dose: '35 dias', offsetDays: 35, phase: 3, required: true },
  { id: 'v10-1', type: 'Vacina', name: 'V10', dose: '1ª múltipla', offsetDays: 45, phase: 4, required: true },
  { id: 'exam-55-blood', type: 'Exame', name: 'Hemograma', dose: 'Pré-família', offsetDays: 55, phase: 5, required: true },
  { id: 'exam-55-fecal', type: 'Exame', name: 'Parasitológico de fezes', dose: '3 amostras', offsetDays: 55, phase: 5, required: true },
  { id: 'v10-2', type: 'Vacina', name: 'V10', dose: '2ª múltipla', offsetDays: 66, phase: 6, required: true },
  { id: 'v10-3', type: 'Vacina', name: 'V10', dose: '3ª múltipla', offsetDays: 87, phase: 7, required: true },
  { id: 'v10-4', type: 'Vacina', name: 'V10', dose: '4ª múltipla', offsetDays: 108, phase: 8, required: true },
  { id: 'rabies', type: 'Vacina', name: 'Antirrábica', dose: 'Dose única', offsetDays: 108, phase: 8, required: true },
  { id: 'exam-180-eye', type: 'Exame', name: 'Avaliação oftalmológica', dose: '6 meses', offsetDays: 180, phase: 11, required: true },
  { id: 'exam-180-pennhip', type: 'Exame', name: 'PennHIP', dose: '6 meses', offsetDays: 180, phase: 11, required: true },
  { id: 'exam-330-complete', type: 'Exame', name: 'Bateria completa', dose: '11-12 meses', offsetDays: 330, phase: 12, required: true },
  { id: 'anesthetic', type: 'Exame', name: 'Avaliação anestésica', dose: 'Pré-castração', offsetDays: 360, phase: 13, required: true },
  { id: 'neuter', type: 'Cirurgia', name: 'Castração', dose: 'Procedimento', offsetDays: 365, phase: 14, required: true }
];

export function buildProtocolForDog(dog) {
  return standardHealthProtocol.map((item) => {
    const done = dog.phase >= item.phase;
    return {
      ...item,
      dueDate: formatDate(addDays(parseBrazilianDate(dog.birth), item.offsetDays)),
      doneDate: done ? formatDate(addDays(parseBrazilianDate(dog.birth), item.offsetDays)) : '',
      ageLabel: `${item.offsetDays} dias de vida`,
      batch: done && item.type === 'Vacina' ? batchFor(item.id) : '',
      maker: done && item.type === 'Vacina' ? makerFor(item.id) : '',
      reportedBy: done ? reporterFor(item.type, item.phase) : '',
      proof: done ? proofFor(item.type, item.id) : '',
      status: done ? 'done' : statusForDueDate(addDays(parseBrazilianDate(dog.birth), item.offsetDays))
    };
  });
}

function parseBrazilianDate(value) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function statusForDueDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return 'late';
  }

  return 'scheduled';
}

function batchFor(id) {
  const batches = {
    puppy: 'PUP-2210',
    influenza: 'INF-1148',
    'v10-1': 'V10-4487',
    'v10-2': 'V10-4512',
    'v10-3': 'V10-4601',
    'v10-4': 'V10-4720',
    rabies: 'RAB-7780'
  };
  return batches[id] || '';
}

function makerFor(id) {
  if (id === 'rabies') {
    return 'Biovet';
  }
  if (id === 'puppy') {
    return 'Zoetis';
  }
  return id.startsWith('v10') ? 'MSD' : '';
}

function reporterFor(type, phase) {
  if (type === 'Vacina') {
    return phase >= 8 ? 'Dra. Helena CRMV 0000' : 'Bruna Reis';
  }
  if (type === 'Exame') {
    return 'Dr. Rafael CRMV 0000';
  }
  return 'Equipe HK';
}

function proofFor(type, id) {
  if (type === 'Vacina') {
    return `carteira-${id}.jpg`;
  }
  if (type === 'Exame') {
    return `laudo-${id}.pdf`;
  }
  return `registro-${id}.pdf`;
}
