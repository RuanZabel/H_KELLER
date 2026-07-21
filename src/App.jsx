import { AuthProvider } from './context/AuthContext.jsx';
import { DogProvider } from './context/DogContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <DogProvider>
        <AppRoutes />
      </DogProvider>
    </AuthProvider>
  );
}
