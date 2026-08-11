import {
  ClipboardList,
  ChevronDown,
  Dog,
  LogOut,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  if (path === '/config') return <ConfigMenu Icon={Icon} label={label} />;

  return (
    <NavLink to={path} className={({ isActive }) => (isActive ? 'active' : '')} end={end}>
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function ConfigMenu({ Icon, label }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const submenuRef = useRef(null);
  const location = useLocation();
  const active = location.pathname.startsWith('/config');
  const items = [
    { to: '/config/ciclos', label: 'Cadastro do ciclo', Icon: RefreshCw },
    { to: '/config/tipos-animais', label: 'Raças e tipos de animais', Icon: Dog, relatedPath: '/config/racas' }
  ];

  function toggleSubmenu() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom, left: Math.max(12, rect.right - 252) });
    }
    setOpen((current) => !current);
  }

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => {
      if (!triggerRef.current?.contains(event.target) && !submenuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const closeViewport = () => setOpen(false);
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    window.addEventListener('resize', closeViewport);
    window.addEventListener('scroll', closeViewport, true);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
      window.removeEventListener('resize', closeViewport);
      window.removeEventListener('scroll', closeViewport, true);
    };
  }, [open]);

  return <div className="nav-menu-item">
    <button ref={triggerRef} type="button" className={`nav-menu-trigger${active ? ' active' : ''}`} onClick={toggleSubmenu} aria-haspopup="menu" aria-expanded={open}>
      <Icon size={18} />{label}<ChevronDown className={open ? 'rotated' : ''} size={15} />
    </button>
    {open && createPortal(
      <div ref={submenuRef} className="nav-config-submenu" style={position} role="menu" aria-label="Cadastros de configuração">
        {items.map(({ to, label: itemLabel, Icon: ItemIcon, relatedPath }) => <NavLink key={to} to={to} role="menuitem" className={({ isActive }) => (isActive || (relatedPath && location.pathname.startsWith(relatedPath)) ? 'active' : '')} onClick={() => setOpen(false)}><ItemIcon size={17} /><span>{itemLabel}</span></NavLink>)}
      </div>, document.body
    )}
  </div>;
}
