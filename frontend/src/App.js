import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PermissionProvider, usePermissionContext } from './context/PermissionContext.js';
import TelaDeCurso from './tela_de_curso/TelaDeCurso.js';
import TelaDashboard from './tela_dashboard/TelaDashboard.js';
import TelaLogin from './tela_login/TelaLogin.js';
import TelaErro from './TelaErro.js';
import './App.css';

function ProtectedRoute({ children }) {
  const { user_id } = usePermissionContext();

  if (user_id === -1){
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <PermissionProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<TelaLogin />} />
            
            <Route path="/*" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<TelaDashboard />} />
                      <Route path="/curso/:id" element={<TelaDeCurso />} />
                      <Route path="*" element={<TelaErro />} />
                    </Routes>
                  </main>
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </PermissionProvider>
  );
}

function Header() {
  return (
    <div className='header'>
      <div className='header-left'>
        <div className='home-btn'>Menu</div>
      </div>
      <div className='header-right'>
        <div className='perfil'>
          <label>SEU NOME</label>
          <div className='avatar'>👤</div>
        </div>
      </div>
    </div>
  );
}

export default App;