import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ fallback = '/painel', label = 'Voltar' }) {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallback);
  }

  return (
    <button className="back-link" type="button" onClick={handleBack}>
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
