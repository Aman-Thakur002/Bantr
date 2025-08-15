import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useTheme } from './hooks/useTheme';
import ThemeSwitcher from './components/ui/ThemeSwitcher';
import { useAuth } from './hooks/useAuth';

function App() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const bgColor = 'var(--color-background)';
  const textColor = 'var(--color-text)';
  const primaryColor = 'var(--color-primary)';

  return (
    <Router>
      <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh' }} className="flex flex-col items-center justify-center transition-colors duration-500">

        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>

        {user ? (
          <div>
            <h1 className="text-3xl">Welcome, {user.name}</h1>
            <button onClick={logout} style={{ color: primaryColor }}>Logout</button>
          </div>
        ) : (
          <>
            <nav className="mb-8">
              <ul className="flex gap-4">
                <li><Link to="/login" style={{ color: primaryColor }} className="hover:underline">Login</Link></li>
                <li><Link to="/signup" style={{ color: primaryColor }} className="hover:underline">Signup</Link></li>
              </ul>
            </nav>
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/" element={<LoginPage />} /> {/* Default route */}
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
