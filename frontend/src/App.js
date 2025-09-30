import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { PermissionProvider, usePermissionContext } from './context/PermissionContext.js';
import { is_course_real } from './api/requests.js';
import TelaDeCurso from './tela_de_curso/TelaDeCurso.js';
import TelaDashboard from './tela_dashboard/TelaDashboard.js';
import TelaLogin from './tela_login/TelaLogin.js';
import TelaErro from './TelaErro.js';
import NotificationModal from './tela_dashboard/NotificationModal.js';
import TelaPerfil from './tela_perfil/TelaPefil.js';
import { Bell, BookOpen, Home, Settings } from "lucide-react";
import './App.css';
import './tela_dashboard/TelaDashboard.css';

function ProtectedRoute({ children }) {
  const { user_id } = usePermissionContext();

  if (user_id === -1){
    return <Navigate to="/login" replace />;
  }

  return children;
}

function CourseRoute({ children }) {
  const { id } = useParams();
  const [isValidCourse, setIsValidCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCourse = async () => {
      try {
        const isValid = await is_course_real(id);
        setIsValidCourse(isValid);
      } catch (error) {
        console.error('Erro ao verificar curso:', error);
        setIsValidCourse(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCourse();
  }, [id]);

  if (isLoading) {
    return <div className="loading">Verificando curso...</div>;
  }

  if (!isValidCourse) {
    return <TelaErro />;
  }

  return children;
}

function Header({ user, setUser, isMonitor }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();

  const [disciplines] = useState([
    { id: 1, name: "Algoritmos e Estruturas de Dados", professor: "Dr. Silva", students: 45, monitors: 3 },
    { id: 2, name: "Engenharia de Software", professor: "Dra. Oliveira", students: 60, monitors: 5 },
    { id: 3, name: "Sistemas Distribuídos", professor: "Dr. Santos", students: 30, monitors: 2 },
    { id: 4, name: "Circuitos Lógicos", professor: "Milton Lacerda", students: 30, monitors: 2 },
    { id: 5, name: "Mecânica dos fluidos", professor: "Hugo Cavalcante", students: 50, monitors: 1 },
    { id: 6, name: "Física Geral", professor: "Alexandre Lirios", students: 40, monitors: 2 },
  ]);

  return (
    <>
      <header className="app-header">
        <div className="logo">
          <img src="./icones/logo.png" alt="logo" />
        </div>
        <nav className="nav-links">
          <a href="#" className="nav-link" onClick={() => navigate('/')}>
            <Home size={18} />
            <span>Início</span>
          </a>

          <a href="#" className="nav-link" onClick={() => setIsNotificationOpen(true)}>
            <Bell size={18} />
            <span>Notificações</span>
          </a>

          {isMonitor && (
            <a href="#" className="nav-link" onClick={() => navigate('/')}>
              <Settings size={18} />
              <span>Gerenciar Disciplinas</span>
            </a>
          )}

          <a href="#" className="nav-link avatar-link" onClick={() => navigate('/perfil')}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar-small" />
            ) : (
              <div className="avatar-small-fallback">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </a>
        </nav>
      </header>

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        disciplines={disciplines}
      />
    </>
  );
}

function App() {
  const [user, setUser] = useState({
    name: "Usuário Padrão",
    email: "usuario@exemplo.com",
    avatar: ""
  });
  const [isMonitor] = useState(false);
  const [currentView, setCurrentView] = useState("list");

  return (
    <PermissionProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<TelaLogin />} />
            
            <Route path="/*" element={
              <ProtectedRoute>
                <>
                  <Header 
                    user={user} 
                    setUser={setUser} 
                    isMonitor={isMonitor}
                  />
                  <main className="main-content">
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <TelaDashboard 
                            user={user} 
                            setUser={setUser}
                            isMonitor={isMonitor}
                            currentView={currentView}
                            setCurrentView={setCurrentView}
                          />
                        } 
                      />
                      <Route
                        path="/perfil"
                        element={
                          <TelaPerfil 
                            user={user}
                            setUser={setUser}
                          />
                        }
                      />
                      <Route 
                        path="/curso/:id" 
                        element={
                          <CourseRoute>
                            <TelaDeCurso />
                          </CourseRoute>
                        } 
                      />
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

export default App;