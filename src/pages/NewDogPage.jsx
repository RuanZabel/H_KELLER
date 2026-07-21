import { AlertTriangle, Check, Dog, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import { phases } from '../data/mockData.js';
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
  motherName: '',
  fatherName: '',
  parentsOrigin: '',
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
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const generatedCode = useMemo(() => {
    const year = new Date().getFullYear();
    const suffix = (form.name || 'NOVO').slice(0, 3).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `HK-${year}-${suffix}-AUTO`;
  }, [form.name]);

  const missingFields = requiredFields.filter((field) => !form[field]);
  const canSave = missingFields.length === 0;

  function updateField(field, value) {
    setSubmitted(false);
    setForm((current) => ({ ...current, [field]: value }));
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
      phase,
      group: groupByPhase(phase),
      trainer: 'A definir',
      socializer: 'A definir',
      birth: fromInputDate(form.birthDate),
      mother: form.motherName || 'A definir',
      father: form.fatherName || 'A definir',
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
            <TextField label="Raça" value={form.breed} onChange={(value) => updateField('breed', value)} />
            <TextField label="Pelagem" value={form.coat} onChange={(value) => updateField('coat', value)} />
            <NumberField label="Peso inicial (kg)" value={form.initialWeight} onChange={(value) => updateField('initialWeight', value)} />
            <TextField label="Pedigree" value={form.pedigree} onChange={(value) => updateField('pedigree', value)} />
            <SelectField label="Fase inicial" value={form.initialPhase} onChange={(value) => updateField('initialPhase', value)} options={phases.map((phase, index) => `${index + 1} · ${phase}`)} />
          </FormSection>

          <FormSection title="Filiação" description="Histórico pré-nascimento, com vínculo interno ou cadastro manual do canil.">
            <TextField label="Nome da mãe" value={form.motherName} onChange={(value) => updateField('motherName', value)} />
            <TextField label="Nome do pai" value={form.fatherName} onChange={(value) => updateField('fatherName', value)} />
            <SelectField label="Procedência dos pais" value={form.parentsOrigin} onChange={(value) => updateField('parentsOrigin', value)} options={['', 'Escola', 'Canil externo']} />
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
