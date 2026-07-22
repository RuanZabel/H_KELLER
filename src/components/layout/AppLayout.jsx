import {
  ClipboardList,
  Dog,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import BackButton from '../common/BackButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { navigationRoutes } from '../../routes/routeConfig.jsx';

export default function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <Header />
      <nav className="top-nav" aria-label="Navegação principal">
        <div className="nav-scroll">
          {navigationRoutes.map((item) => <NavItem key={item.path} {...item} />)}
        </div>
        <div className="session-menu">
          <span>{user?.role}</span>
          <button onClick={logout} title="Sair"><LogOut size={18} /></button>
        </div>
      </nav>
      <main className="main-frame">
        <BackButton />
        <Outlet />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="brand-header">
      <div className="brand-mark">
        <div className="logo-badge"><Dog size={30} /></div>
        <div>
          <strong>Escola Helen Keller</strong>
          <span>Prontuário Digital do Cão</span>
        </div>
      </div>
      <div className="header-title">
        <p>Controle interno · MVP 1º ano de vida</p>
        <h1>Fonte única para saúde, fases, documentos e responsáveis</h1>
      </div>
      <div className="cert-stack">
        <span><ShieldCheck size={16} /> Acessível</span>
        <span><ClipboardList size={16} /> Auditável</span>
      </div>
    </header>
  );
}

function NavItem({ path, icon: Icon, label, end }) {
  return (
    <NavLink to={path} className={({ isActive }) => (isActive ? 'active' : '')} end={end}>
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
