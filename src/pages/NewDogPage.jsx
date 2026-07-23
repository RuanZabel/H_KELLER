import { AlertTriangle, Check, Dog, Save, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import { phases } from '../data/mockData.js';
import { useConfig } from '../context/ConfigContext.jsx';
import { useDogs } from '../context/DogContext.jsx';

const initialForm = {
  name: '',
  sex: '',
  color: '',
  birthDate: '',
  origin: '',
  microchip: '',
  category: '',
  initialWeight: '',
  pedigree: '',
  breed: '',
  coat: '',
  isBreeder: false,
  motherOrigin: '',
  motherName: '',
  motherSchoolRga: '',
  motherSearch: '',
  fatherOrigin: '',
  fatherName: '',
  fatherSchoolRga: '',
  fatherSearch: '',
  fatherColor: '',
  motherColor: '',
  temperament: '',
  chronicDiseases: '',
  litterCount: '',
  kennelData: '',
  initialPhase: '1 · Nascimento',
  notes: ''
};

const requiredFields = ['name', 'sex', 'color', 'birthDate', 'origin', 'category'];

const fieldLabels = {
  name: 'Nome',
  sex: 'Sexo',
  color: 'Cor',
  birthDate: 'Data de nascimento',
  origin: 'Procedência',
  category: 'Categoria'
};

export default function NewDogPage() {
  const navigate = useNavigate();
  const { addDog, dogs } = useDogs();
  const { dogBreeds } = useConfig();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [parentPicker, setParentPicker] = useState(null);

  const generatedCode = useMemo(() => {
    const year = new Date().getFullYear();
    const suffix = (form.name || 'NOVO').slice(0, 3).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `HK-${year}-${suffix}-AUTO`;
  }, [form.name]);

  const missingFields = requiredFields.filter((field) => !form[field]);
  const canSave = missingFields.length === 0;
  const schoolMothers = useMemo(() => findSchoolBreeders(dogs, 'Fêmea', form.motherSearch), [dogs, form.motherSearch]);
  const schoolFathers = useMemo(() => findSchoolBreeders(dogs, 'Macho', form.fatherSearch), [dogs, form.fatherSearch]);
  const selectedMother = dogs.find((dog) => dog.rga === form.motherSchoolRga);
  const selectedFather = dogs.find((dog) => dog.rga === form.fatherSchoolRga);
  const pickerDogs = parentPicker === 'mother' ? schoolMothers : schoolFathers;
  const pickerSearch = parentPicker === 'mother' ? form.motherSearch : form.fatherSearch;

  function updateField(field, value) {
    setSubmitted(false);
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === 'motherOrigin' && value !== 'Escola') {
        next.motherSchoolRga = '';
        next.motherSearch = '';
      }

      if (field === 'fatherOrigin' && value !== 'Escola') {
        next.fatherSchoolRga = '';
        next.fatherSearch = '';
      }

      return next;
    });
  }

  function selectSchoolParent(parent, parentDog) {
    setSubmitted(false);
    setForm((current) => ({
      ...current,
      [`${parent}SchoolRga`]: parentDog.rga,
      [`${parent}Name`]: parentDog.name,
      [`${parent}Search`]: parentDog.name,
      [`${parent}Color`]: parentDog.coat || ''
    }));
    setParentPicker(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (!canSave) {
      return;
    }

    const phase = Number.parseInt(form.initialPhase, 10) || 1;
    const newDog = {
      name: form.name.trim(),
      code: generatedCode,
      rga: generateRga(dogs),
      sex: form.sex,
      breed: form.breed || 'A definir',
      coat: form.coat || form.color,
      isBreeder: form.isBreeder,
      phase,
      group: groupByPhase(phase),
      trainer: 'A definir',
      socializer: 'A definir',
      birth: fromInputDate(form.birthDate),
      mother: selectedMother?.name || form.motherName || 'A definir',
      father: selectedFather?.name || form.fatherName || 'A definir',
      parentRelations: {
        mother: buildParentRelation('Mãe', form.motherOrigin, selectedMother, form.motherName),
        father: buildParentRelation('Pai', form.fatherOrigin, selectedFather, form.fatherName)
      },
      chip: form.microchip,
      alert: form.microchip ? '' : 'Microchip pendente',
      health: form.microchip ? 'ok' : 'alert',
      progress: Math.round((phase / 17) * 100)
    };

    addDog(newDog);
    navigate(`/caes/${newDog.rga}`);
  }

  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Novo prontuário" title="Cadastro do cão">
        <span className="generated-code"><Dog size={18} /> {generatedCode}</span>
      </PageHeader>

      <form className="record-form" onSubmit={handleSubmit}>
        <aside className="form-summary">
          <div className="avatar large">🐾</div>
          <div>
            <p className="eyebrow">Código HK automático</p>
            <h3>{generatedCode}</h3>
            <p>O código é gerado pelo sistema e não deve ser editado manualmente.</p>
          </div>
          {!form.microchip && (
            <div className="form-alert">
              <AlertTriangle size={18} />
              <span>Microchip pode ser preenchido depois, mas ficará pendente antes da socialização.</span>
            </div>
          )}
          {submitted && canSave && (
            <div className="form-success">
              <Check size={18} />
              <span>Cadastro validado no frontend. Pronto para integração com API.</span>
            </div>
          )}
        </aside>

        <div className="form-sections">
          <FormSection title="Dados obrigatórios" description="Informações mínimas para abrir um prontuário único.">
            <TextField label="Nome" value={form.name} onChange={(value) => updateField('name', value)} required />
            <SelectField label="Sexo" value={form.sex} onChange={(value) => updateField('sex', value)} options={['', 'Macho', 'Fêmea']} required />
            <TextField label="Cor" value={form.color} onChange={(value) => updateField('color', value)} required />
            <DateField label="Data de nascimento" value={form.birthDate} onChange={(value) => updateField('birthDate', value)} required />
            <SelectField label="Procedência" value={form.origin} onChange={(value) => updateField('origin', value)} options={['', 'Escola', 'Canil externo']} required />
            <SelectField label="Categoria" value={form.category} onChange={(value) => updateField('category', value)} options={['', 'Guia', 'Serviço', 'Terapia', 'Outro']} required />
          </FormSection>

          <FormSection title="Identificação e características" description="Dados complementares usados na carteira digital e no prontuário.">
            <TextField label="Microchip" value={form.microchip} onChange={(value) => updateField('microchip', value)} placeholder="Pode ficar pendente" />
            <SelectField label="Raça" value={form.breed} onChange={(value) => updateField('breed', value)} options={['', ...dogBreeds]} />
            <TextField label="Pelagem" value={form.coat} onChange={(value) => updateField('coat', value)} />
            <NumberField label="Peso inicial (kg)" value={form.initialWeight} onChange={(value) => updateField('initialWeight', value)} />
            <TextField label="Pedigree" value={form.pedigree} onChange={(value) => updateField('pedigree', value)} />
            <ToggleField label="É reprodutor" checked={form.isBreeder} onChange={(value) => updateField('isBreeder', value)} />
            <SelectField label="Fase inicial" value={form.initialPhase} onChange={(value) => updateField('initialPhase', value)} options={phases.map((phase, index) => `${index + 1} · ${phase}`)} />
          </FormSection>

          <FormSection title="Filiação" description="Histórico pré-nascimento, com vínculo interno ou cadastro manual do canil.">
            <ParentField
              label="Mãe"
              origin={form.motherOrigin}
              name={form.motherName}
              selectedRga={form.motherSchoolRga}
              selectedDog={selectedMother}
              onOriginChange={(value) => updateField('motherOrigin', value)}
              onNameChange={(value) => updateField('motherName', value)}
              onOpenPicker={() => setParentPicker('mother')}
            />
            <ParentField
              label="Pai"
              origin={form.fatherOrigin}
              name={form.fatherName}
              selectedRga={form.fatherSchoolRga}
              selectedDog={selectedFather}
              onOriginChange={(value) => updateField('fatherOrigin', value)}
              onNameChange={(value) => updateField('fatherName', value)}
              onOpenPicker={() => setParentPicker('father')}
            />
            <TextField label="Cor da mãe" value={form.motherColor} onChange={(value) => updateField('motherColor', value)} />
            <TextField label="Cor do pai" value={form.fatherColor} onChange={(value) => updateField('fatherColor', value)} />
            <NumberField label="Número de ninhadas" value={form.litterCount} onChange={(value) => updateField('litterCount', value)} />
            <TextArea label="Temperamento dos pais" value={form.temperament} onChange={(value) => updateField('temperament', value)} />
            <TextArea label="Doenças crônicas conhecidas" value={form.chronicDiseases} onChange={(value) => updateField('chronicDiseases', value)} />
            <TextArea label="Dados do canil externo" value={form.kennelData} onChange={(value) => updateField('kennelData', value)} />
          </FormSection>

          <FormSection title="Observações iniciais" description="Registro livre para contexto clínico, manejo ou implantação histórica.">
            <TextArea label="Observações" value={form.notes} onChange={(value) => updateField('notes', value)} wide />
          </FormSection>

          {submitted && !canSave && (
            <div className="validation-panel">
              <AlertTriangle size={18} />
              <span>Preencha os campos obrigatórios: {missingFields.map((field) => fieldLabels[field]).join(', ')}.</span>
            </div>
          )}

          <div className="form-actions">
            <Link className="ghost-action" to="/caes">Cancelar</Link>
            <button className="primary-action" type="submit"><Save size={18} /> Salvar cadastro</button>
          </div>
        </div>
      </form>

      {parentPicker && (
        <ParentPickerModal
          label={parentPicker === 'mother' ? 'mãe' : 'pai'}
          search={pickerSearch}
          dogs={pickerDogs}
          selectedRga={parentPicker === 'mother' ? form.motherSchoolRga : form.fatherSchoolRga}
          onSearchChange={(value) => updateField(parentPicker === 'mother' ? 'motherSearch' : 'fatherSearch', value)}
          onSelect={(dog) => selectSchoolParent(parentPicker, dog)}
          onClose={() => setParentPicker(null)}
        />
      )}
    </section>
  );
}

function FormSection({ title, description, children }) {
  return (
    <fieldset className="form-section">
      <legend>
        <strong>{title}</strong>
        <span>{description}</span>
      </legend>
      <div className="form-grid">{children}</div>
    </fieldset>
  );
}

function TextField({ label, value, onChange, placeholder = '', required = false }) {
  return (
    <label className="data-field">
      <span>{label}{required ? ' *' : ''}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} />
    </label>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="data-field">
      <span>{label}</span>
      <input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function DateField({ label, value, onChange, required = false }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <label className="data-field">
      <span>{label}{required ? ' *' : ''}</span>
      <input type="date" max={today} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}

function SelectField({ label, value, onChange, options, required = false }) {
  return (
    <label className="data-field">
      <span>{label}{required ? ' *' : ''}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} required={required}>
        {options.map((option) => (
          <option key={option || 'empty'} value={option}>{option || 'Selecione'}</option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="toggle-field">
      <span>{label}</span>
      <button className={checked ? 'selected' : ''} type="button" onClick={() => onChange(!checked)}>
        {checked ? 'Sim' : 'Não'}
      </button>
    </label>
  );
}

function ParentField({ label, origin, name, selectedDog, selectedRga, onOriginChange, onNameChange, onOpenPicker }) {
  const isSchool = origin === 'Escola';
  const lowerLabel = label.toLowerCase();
  const article = label === 'Pai' ? 'do' : 'da';

  return (
    <div className="parent-field">
      <SelectField
        label={`Procedência ${article} ${lowerLabel}`}
        value={origin}
        onChange={onOriginChange}
        options={['', 'Escola', 'Canil externo', 'Outro / descritivo']}
      />

      {isSchool ? (
        <div className="parent-selector">
          <span>{selectedRga ? 'Reprodutor selecionado' : 'Nenhum reprodutor selecionado'}</span>
          {selectedDog ? (
            <strong>{selectedDog.name} · {selectedDog.rga}</strong>
          ) : (
            <p>Selecione um cão marcado como reprodutor no cadastro da escola.</p>
          )}
          <button className="ghost-action" type="button" onClick={onOpenPicker}>
            <Search size={16} /> Selecionar {lowerLabel}
          </button>
        </div>
      ) : (
        <TextField label={`Nome ${article} ${lowerLabel}`} value={name} onChange={onNameChange} placeholder="Nome ou descrição da procedência" />
      )}
    </div>
  );
}

function ParentPickerModal({ label, search, dogs, selectedRga, onSearchChange, onSelect, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="parent-modal" role="dialog" aria-modal="true" aria-labelledby="parent-modal-title">
        <header>
          <div>
            <p className="eyebrow">Cães de reprodução</p>
            <h3 id="parent-modal-title">Selecionar {label}</h3>
          </div>
          <button className="icon-action" type="button" aria-label="Fechar modal" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <label className="data-field">
          <span>Pesquisar por nome, RGA, raça ou pelagem</span>
          <div className="search-input-shell">
            <Search size={16} />
            <input autoFocus value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={`Buscar ${label} reprodutor`} />
          </div>
        </label>

        <div className="parent-modal-list" role="list">
          {dogs.map((dog) => (
            <button
              className={selectedRga === dog.rga ? 'selected' : ''}
              key={dog.rga}
              type="button"
              onClick={() => onSelect(dog)}
            >
              <strong>{dog.name}</strong>
              <span>{dog.rga} · {dog.sex} · {dog.breed} · {dog.coat}</span>
              <em>Reprodutor</em>
            </button>
          ))}
          {dogs.length === 0 && <p>Nenhum reprodutor encontrado com esse filtro.</p>}
        </div>
      </section>
    </div>
  );
}

function TextArea({ label, value, onChange, wide = false }) {
  return (
    <label className={`data-field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function generateRga(dogs) {
  const year = new Date().getFullYear();
  const nextNumber = dogs.length + 1;
  return `HK-${year}-${String(nextNumber).padStart(4, '0')}`;
}

function findSchoolBreeders(dogs, sex, query) {
  const normalizedQuery = normalizeSearch(query);

  return dogs
    .filter((dog) => dog.sex === sex)
    .filter((dog) => dog.isBreeder)
    .filter((dog) => {
      if (!normalizedQuery) {
        return true;
      }

      return normalizeSearch(`${dog.name} ${dog.rga} ${dog.breed} ${dog.coat}`).includes(normalizedQuery);
    })
    .slice(0, 6);
}

function buildParentRelation(role, origin, selectedDog, typedName) {
  return {
    role,
    origin: origin || 'Não informado',
    rga: origin === 'Escola' ? selectedDog?.rga || '' : '',
    name: selectedDog?.name || typedName || '',
    linked: origin === 'Escola' && Boolean(selectedDog?.rga)
  };
}

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function fromInputDate(value) {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function groupByPhase(phase) {
  if (phase <= 5) return 'canil';
  if (phase <= 10) return 'socializacao';
  if (phase <= 12) return 'aptidao';
  if (phase <= 15) return 'castracao';
  if (phase === 16) return 'treino';
  return 'entrega';
}
