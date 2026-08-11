import { CheckCircle2, Clock3, Dog, Info, PawPrint, Pencil, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext.jsx';

const icons = [Dog, PawPrint, Users, CheckCircle2];
export default function AnimalTypeEditPage() {
  const navigate = useNavigate();
  const { typeName } = useParams();
  const { animalTypes, dogBreeds, updateAnimalType, toggleAnimalType } = useConfig();
  const type = animalTypes.find((entry) => entry.name === decodeURIComponent(typeName));
  const [form, setForm] = useState(() => type ? { label: type.name, plural: `${type.name}s`, description: `Animais da espécie ${type.name.toLowerCase()}.`, useBreeds: true, requireBreed: true, allowNoBreed: true, available: type.active, icon: 0, ...type } : null);
  if (!type || !form) return <section className="screen"><h2>Tipo não encontrado</h2></section>;
  const breeds = dogBreeds.filter((breed) => (breed.animalType || 'Cão') === type.name);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return <form className="screen animal-type-edit animate-in" onSubmit={(e) => { e.preventDefault(); updateAnimalType(type.name, form); navigate('/config/tipos-animais'); }}>
    <nav className="items-breadcrumb"><button type="button" onClick={() => navigate('/config/tipos-animais')}>← Configurações</button><span>/</span><button type="button" onClick={() => navigate('/config/tipos-animais')}>Raças e tipos de animais</button><span>/</span><strong>Tipos de animais</strong><span>/</span><b>{type.name} · Editar</b></nav>
    <header className="lifecycle-edit-heading"><div><h2>Editar tipo de animal</h2><p>Atualize as informações e regras utilizadas no cadastro de animais.</p></div><button type="button" className="ghost-action" onClick={() => navigate('/config/tipos-animais')}>Cancelar</button></header>
    <section className="type-edit-summary"><Dog size={58} /><div><h3>{form.name} <span className="registry-status active"><CheckCircle2 size={14} /> Ativo</span></h3><p>{breeds.length} raças vinculadas · 48 animais cadastrados</p></div><button type="button" onClick={() => navigate('/config/racas')}><Users size={17} /> Ver raças vinculadas ({breeds.length})</button></section>
    <section className="type-edit-card"><fieldset><legend>Identificação</legend><div className="type-identification"><label><span>Nome do tipo *</span><input required value={form.name} onChange={(e) => update('name', e.target.value)} /></label><label><span>Identificação no cadastro *</span><input required value={form.label} onChange={(e) => update('label', e.target.value)} /></label><div className="type-icon-picker"><span>Ícone</span><div>{icons.map((Icon, index) => <button type="button" className={form.icon === index ? 'active' : ''} onClick={() => update('icon', index)} key={index}><Icon size={24} /></button>)}</div></div><label><span>Nome no plural</span><input value={form.plural} onChange={(e) => update('plural', e.target.value)} /></label><label><span>Descrição</span><textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></label></div></fieldset>
      <div className="type-rules"><fieldset><legend>Regras para raças</legend><Toggle checked={form.useBreeds} onChange={(value) => update('useBreeds', value)} label="Utilizar cadastro de raças para este tipo" /><Toggle checked={form.requireBreed} onChange={(value) => update('requireBreed', value)} label="Exigir raça no cadastro do animal" /><Toggle checked={form.allowNoBreed} onChange={(value) => update('allowNoBreed', value)} label="Permitir a opção Sem raça definida" /><p><Info size={15} /> As raças são cadastradas e gerenciadas separadamente na aba Raças.</p></fieldset><fieldset><legend>Disponibilidade</legend><Toggle checked={form.available} onChange={(value) => update('available', value)} label="Disponível para novos cadastros" /><div className="linked-count"><Users size={17} /> 48 animais utilizam este tipo</div><p><Info size={15} /> Alterar o nome não modifica os animais existentes.</p></fieldset></div>
      <aside className="type-warning"><Info size={22} /> Este tipo possui animais e raças vinculados. Ele não pode ser excluído; apenas desativado para novos cadastros.</aside><div className="type-audit"><span><Clock3 /> Criado em 15/01/2026</span><span><Pencil /> Última atualização em 05/08/2026 por Geisiane</span></div>
      <footer><button type="button" className="danger-action" onClick={() => { toggleAnimalType(type.name); update('available', !form.available); }}>Desativar tipo</button><div><button type="button" className="ghost-action" onClick={() => setForm({ ...type })}>Descartar alterações</button><button className="primary-action">Salvar alterações</button></div></footer>
    </section>
  </form>;
}
function Toggle({ checked, onChange, label }) { return <label className="switch-label"><button type="button" className={`switch${checked ? ' active' : ''}`} onClick={() => onChange(!checked)}><i /></button>{label}</label>; }
