import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import PublicRoute from './PublicRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import DogRecordPage from '../pages/DogRecordPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NewDogPage from '../pages/NewDogPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import LifecycleConfigPage from '../pages/LifecycleConfigPage.jsx';
import BreedsConfigPage from '../pages/BreedsConfigPage.jsx';
import AnimalTypesConfigPage from '../pages/AnimalTypesConfigPage.jsx';
import LifecycleItemsPage from '../pages/LifecycleItemsPage.jsx';
import LifecycleEditPage from '../pages/LifecycleEditPage.jsx';
import AnimalTypeEditPage from '../pages/AnimalTypeEditPage.jsx';
import UsersConfigPage from '../pages/UsersConfigPage.jsx';
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
          <Route path="/config/ciclos" element={<LifecycleConfigPage />} />
          <Route path="/config/ciclos/:cycleId/itens" element={<LifecycleItemsPage />} />
          <Route path="/config/ciclos/:cycleId/editar" element={<LifecycleEditPage />} />
          <Route path="/config/racas" element={<BreedsConfigPage />} />
          <Route path="/config/tipos-animais" element={<AnimalTypesConfigPage />} />
          <Route path="/config/tipos-animais/:typeName/editar" element={<AnimalTypeEditPage />} />
          <Route path="/config/usuarios" element={<UsersConfigPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
