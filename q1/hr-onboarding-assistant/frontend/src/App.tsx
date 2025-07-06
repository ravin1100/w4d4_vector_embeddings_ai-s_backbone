import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import { useAuth, AuthProvider } from './context/AuthContext';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/chat" element={<Chat />} />
      
      {/* Admin Routes */}
      <Route path="/login" element={<Login />} />
      <Route 
        path="/admin/upload" 
        element={isAuthenticated ? <Upload /> : <Navigate to="/login" />} 
      />
      
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/chat" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
