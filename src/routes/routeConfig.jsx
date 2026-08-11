import {
  Activity,
  ClipboardCheck,
  Dog,
  FileText,
  HeartPulse,
  Settings,
  Soup,
  UserRound
} from 'lucide-react';
import ConfigPage from '../pages/ConfigPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import DogsPage from '../pages/DogsPage.jsx';
import DocumentsPage from '../pages/DocumentsPage.jsx';
import EvaluationsPage from '../pages/EvaluationsPage.jsx';
import FeedingPage from '../pages/FeedingPage.jsx';
import HealthPage from '../pages/HealthPage.jsx';
import TutorsPage from '../pages/TutorsPage.jsx';

export const privateRoutes = [
  { path: '/painel', icon: Activity, label: 'Painel', element: <DashboardPage /> },
  { path: '/caes', icon: Dog, label: 'Cães', element: <DogsPage />, end: true },
  { path: '/saude', icon: HeartPulse, label: 'Saúde', element: <HealthPage /> },
  { path: '/alimentacao', icon: Soup, label: 'Alimentação', element: <FeedingPage /> },
  { path: '/avaliacoes', icon: ClipboardCheck, label: 'Avaliações', element: <EvaluationsPage /> },
  { path: '/tutores', icon: UserRound, label: 'Tutores', element: <TutorsPage /> },
  { path: '/documentos', icon: FileText, label: 'Documentos', element: <DocumentsPage /> },
  { path: '/config', icon: Settings, label: 'Config', element: <ConfigPage /> }
];

export const navigationRoutes = privateRoutes.filter((route) => route.path !== '/documentos');
