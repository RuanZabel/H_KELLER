import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import PublicRoute from './PublicRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import DogRecordPage from '../pages/DogRecordPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NewDogPage from '../pages/NewDogPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { privateRoutes } from './routeConfig.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/painel" replace />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {privateRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="/caes/novo" element={<NewDogPage />} />
          <Route path="/caes/:rga" element={<DogRecordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
