export const SUPPORT_MODALITIES = {
  GUIDE_DOG: { label: 'Cão-guia', description: 'Deficiência visual', symbol: '◉' },
  AUTISM_ASSISTANCE: { label: 'Assistência ao autismo', description: 'Modalidade definida', symbol: '∞' },
  SPECIFIC_ASSISTANCE: { label: 'Apoio específico', description: 'Outras necessidades', symbol: '♢' },
  UNDEFINED: { label: 'Em definição', description: 'Aguardando decisão', symbol: '—' }
};

export const WORK_GROUPS = [
  { id: 'TODAY', title: 'Hoje', empty: 'Nenhuma atividade para hoje.' },
  { id: 'NEXT_7_DAYS', title: 'Próximos 7 dias', empty: 'Nenhuma atividade nos próximos 7 dias.' },
  { id: 'ATTENTION', title: 'Atenção', empty: 'Nenhum ponto de atenção.' },
  { id: 'NEXT_15_DAYS', title: 'Próximos 15 dias', empty: 'Nenhuma atividade prevista para os próximos 15 dias.' }
];

export const LIFECYCLE_GROUPS = [
  { id: 'canil', title: 'Canil e neonatal', phases: '1–5', span: '20–55 dias', color: '#839b8b' },
  { id: 'socializacao', title: 'Socialização', phases: '6–10', span: 'família socializadora', color: '#7f8da3' },
  { id: 'aptidao', title: 'Avaliação de aptidão', phases: '11–12', span: '6–12 meses', color: '#9b937d' },
  { id: 'castracao', title: 'Transição para treinamento', phases: '13–15', span: 'define modalidade', color: '#897d91' },
  { id: 'treino', title: 'Treinamento e pré-entrega', phases: '16', span: 'treino especializado', color: '#7c9289' },
  { id: 'entrega', title: 'Entrega ao tutor', phases: '17', span: 'adaptação e entrega', color: '#9a8982' },
  { id: 'acompanhamento', title: 'Acompanhamento do tutor', phases: 'pós-entrega', span: 'acompanhamento contínuo', color: '#789087' }
];

export function enrichDogs(dogs) {
  return dogs.map((dog, index) => {
    const isEstrela = dog.name === 'Estrela';
    const supportModality = isEstrela ? 'AUTISM_ASSISTANCE' : dog.phase >= 16 ? (index % 2 ? 'SPECIFIC_ASSISTANCE' : 'GUIDE_DOG') : 'UNDEFINED';
    return {
      ...dog,
      age: dog.phase < 10 ? '8 meses' : '14 meses',
      responsibleTeam: dog.trainer || 'Equipe Helen Keller',
      supportModality,
      modalityDefinedAt: supportModality === 'UNDEFINED' ? null : '28/07/2026',
      feeding: { diet: dog.breed === 'Labrador' ? 'Ração Labrador Adult' : 'Ração super premium', amount: dog.phase < 6 ? '360 g/dia' : '420 g/dia', frequency: dog.phase < 6 ? '3 refeições' : '2 refeições', weight: `${22 + index},${index % 10} kg`, updated: '29/07', responsible: 'Equipe de manejo' },
      criteria: [
        { name: 'Avaliação clínica', detail: 'Concluída em 28/07', status: 'Concluído' },
        { name: 'Hemograma', detail: 'Resultado anexado', status: 'Concluído' },
        { name: isEstrela ? 'Avaliação anestésica' : 'Próxima avaliação', detail: 'Próximo acontecimento', status: 'Próxima', alert: isEstrela },
        { name: 'Critério final da fase', detail: 'Aguardando liberação', status: 'Pendente' }
      ],
      medications: isEstrela ? [
        { id: 'med-1', name: 'Antiparasitário', detail: 'Próxima dose · equipe veterinária', status: 'Próximo', date: '03/08', alert: true },
        { id: 'med-2', name: 'Suplemento articular', detail: 'Uso contínuo · administração diária', status: 'Em dia' }
      ] : [],
      vaccines: isEstrela ? [
        { id: 'vac-1', name: 'Reforço V10', detail: 'A programar · janela recomendada aberta', status: 'Próximo', date: '20/08', alert: true },
        { id: 'vac-2', name: 'Antirrábica', detail: 'Dentro da validade', status: 'Em dia', date: '12/09' },
        { id: 'vac-3', name: '4ª múltipla', detail: 'Comprovante anexado', status: 'Concluída' }
      ] : [],
      healthEvents: isEstrela ? [{ id: 'health-1', name: 'Avaliação anestésica', detail: 'Consulta confirmada · 09h30', status: 'Agendada', date: '02/08', alert: true }] : [],
      timeline: [
        { date: '20/07', title: 'Avaliação clínica', description: 'Sem alterações clínicas' },
        { date: '28/07', title: 'Hemograma', description: 'Resultado anexado e aprovado' }
      ],
      tutor: dog.phase >= 17 ? { name: dog.socializer, detail: 'Plano de acompanhamento ativo', status: 'Em acompanhamento', nextVisit: '18/08' } : null,
      workItems: isEstrela ? [
        { id: 'wi-est-1', category: 'exame', categoryLabel: 'Saúde', title: 'Avaliação anestésica', dueDate: '2026-07-29', displayDate: 'Hoje · 09h30', severity: 'high', status: 'Agendada', responsible: 'Veterinária HK' },
        { id: 'wi-est-2', category: 'medicacao', categoryLabel: 'Medicação', title: 'Antiparasitário', dueDate: '2026-08-03', displayDate: '03/08', severity: 'medium', status: 'Próxima dose', responsible: 'Equipe veterinária' },
        { id: 'wi-est-3', category: 'bloqueio', categoryLabel: 'Fase de vida', title: 'Critério clínico pendente', dueDate: '2026-07-28', displayDate: 'Atrasado 1 dia', severity: 'high', status: 'Bloqueando fase', blocksPhase: true },
        { id: 'wi-est-4', category: 'vacina', categoryLabel: 'Vacina', title: 'Reforço V10', dueDate: '2026-08-12', displayDate: '12/08', severity: 'low', status: 'A programar' }
      ] : dog.alert ? [{ id: `wi-${dog.code}`, category: 'saude', categoryLabel: 'Saúde', title: dog.alert, dueDate: '2026-07-28', displayDate: 'Atrasado', severity: 'critical', status: 'Requer atenção', isOverdue: true, responsible: dog.trainer }] : []
    };
  });
}

const DAY = 86400000;

export function toLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function classifyWorkItem(item, today = new Date()) {
  if (item.severity === 'critical' || item.isOverdue || item.blocksPhase) return 'ATTENTION';
  if (!item.dueDate) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const distance = Math.round((toLocalDate(item.dueDate) - start) / DAY);
  if (distance === 0) return 'TODAY';
  if (distance >= 1 && distance <= 7) return 'NEXT_7_DAYS';
  if (distance >= 8 && distance <= 15) return 'NEXT_15_DAYS';
  return null;
}

export function buildWorkQueue(dogs, today = new Date()) {
  return dogs
    .flatMap((dog) => (dog.workItems || []).map((item) => ({
      ...item,
      dogId: dog.rga,
      dogName: dog.name,
      group: classifyWorkItem(item, today)
    })))
    .filter((item) => item.group)
    .sort((a, b) => {
      const severity = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severity[a.severity] ?? 4) - (severity[b.severity] ?? 4)
        || String(a.dueDate || '').localeCompare(String(b.dueDate || ''))
        || a.dogName.localeCompare(b.dogName);
    });
}
