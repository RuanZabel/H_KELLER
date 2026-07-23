import { AuthProvider } from './context/AuthContext.jsx';
import { ConfigProvider } from './context/ConfigContext.jsx';
import { DogProvider } from './context/DogContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <DogProvider>
          <AppRoutes />
        </DogProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}
