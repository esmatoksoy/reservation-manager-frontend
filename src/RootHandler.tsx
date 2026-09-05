import { useSearchParams } from 'react-router-dom';
import App from './App';
import { LandingPage } from './components/GuestForm/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

const RootHandler = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');

  // If there's a requestId query parameter, show the guest form (public access)
  // Otherwise, show the landing page (admin only - protected)
  return requestId ? <App /> : (
    <ProtectedRoute>
      <LandingPage />
    </ProtectedRoute>
  );
};

export default RootHandler;
