import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from "./Components/User/Login";
import Register from "./Components/User/Register";
import Administrator from "./Components/Administrator/Administrator";
import Dashboard from "./Components/Dashboard/Dashboar.jsx";
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated, getRole, logout } from './utils/auth';
import UpdatePassword from './Components/User/UpdatePassword';

function NavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="p-4 bg-blue-100 flex gap-4">
      {!isAuthenticated() && <Link to="/login">Login</Link>}
      {!isAuthenticated() && <Link to="/register">Register</Link>}
      {isAuthenticated() && <Link to="/dashboard">Dashboard</Link>}
      {isAuthenticated() && <Link to="/update-password">Update Password</Link>}
      {isAuthenticated() && getRole() === 'admin' && <Link to="/admin">Admin</Link>}
      {isAuthenticated() && <button onClick={handleLogout} className="ml-auto bg-red-500 text-white px-3 py-1 rounded">Logout</button>}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['user','owner','admin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Administrator /></ProtectedRoute>} />
        <Route path="/update-password" element={<ProtectedRoute roles={['user','owner','admin']}><UpdatePassword /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
