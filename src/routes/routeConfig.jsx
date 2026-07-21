import {
  Activity,
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  Dog,
  FileText,
  HeartPulse,
  Settings,
  Soup,
  UserRound,
  WalletCards
} from 'lucide-react';
import ChecklistsPage from '../pages/ChecklistsPage.jsx';
import ConfigPage from '../pages/ConfigPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import DevelopmentPage from '../pages/DevelopmentPage.jsx';
import DigitalWalletsPage from '../pages/DigitalWalletsPage.jsx';
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
  { path: '/desenvolvimento', icon: BadgeCheck, label: 'Desenvolvimento', element: <DevelopmentPage /> },
  { path: '/avaliacoes', icon: ClipboardCheck, label: 'Avaliações', element: <EvaluationsPage /> },
  { path: '/carteiras', icon: WalletCards, label: 'Carteiras', element: <DigitalWalletsPage /> },
  { path: '/tutores', icon: UserRound, label: 'Tutores', element: <TutorsPage /> },
  { path: '/documentos', icon: FileText, label: 'Documentos', element: <DocumentsPage /> },
  { path: '/checklists', icon: BookOpenCheck, label: 'Checklists', element: <ChecklistsPage /> },
  { path: '/config', icon: Settings, label: 'Config', element: <ConfigPage /> }
];
