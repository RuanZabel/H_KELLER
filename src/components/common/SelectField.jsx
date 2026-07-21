export default function SelectField({ label, value, onChange, options, names = {} }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{names[option] || option}</option>
        ))}
      </select>
    </label>
  );
}
