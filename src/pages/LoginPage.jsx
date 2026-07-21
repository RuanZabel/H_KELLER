import { Lock, LogIn, Mail } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ email: 'equipe@helenkeller.local', password: 'demo123' });

  function handleSubmit(event) {
    event.preventDefault();
    login(credentials);
    navigate(location.state?.from?.pathname || '/painel', { replace: true });
  }

  return (
    <AuthLayout>
      <form className="login-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Acesso restrito</p>
          <h2>Entrar no sistema</h2>
          <p>Use qualquer e-mail e senha para acessar esta versão demonstrativa.</p>
        </div>
        <label className="icon-field">
          <span>E-mail</span>
          <Mail size={18} />
          <input
            type="email"
            value={credentials.email}
            onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
            placeholder="seu.email@instituicao.org"
            required
          />
        </label>
        <label className="icon-field">
          <span>Senha</span>
          <Lock size={18} />
          <input
            type="password"
            value={credentials.password}
            onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
            placeholder="Digite sua senha"
            required
          />
        </label>
        <button className="primary-action login-submit" type="submit"><LogIn size={18} /> Entrar</button>
      </form>
    </AuthLayout>
  );
}
