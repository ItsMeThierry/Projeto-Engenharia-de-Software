import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { PermissionProvider, usePermissionContext } from './context/PermissionContext.js';
import { is_course_real, get_user_courses, remove_course, remove_user_course } from './api/requests.js';
import { Bell, BookOpen, Home, Settings } from "lucide-react";
import logo from './icones/logo.png';
import TelaDeCurso from './tela_de_curso/TelaDeCurso.js';
import TelaDashboard from './tela_dashboard/TelaDashboard.js';
import TelaLogin from './tela_login/TelaLogin.js';
import TelaErro from './TelaErro.js';
import NotificationModal from './tela_dashboard/NotificationModal.js';
import RemoveCoursesModal from './tela_dashboard/RemoveCoursesModal.js';
import TelaPerfil from './tela_perfil/TelaPefil.js';
import './App.css';
import './tela_dashboard/TelaDashboard.css';

function ProtectedRoute({ children }) {
  const { getUserData } = usePermissionContext();
  const userData = getUserData();

  if (userData.id === null){
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

function Header({ onCoursesUpdate }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [isRemoveCoursesOpen, setIsRemoveCoursesOpen] = useState(false);
  const [userCourses, setUserCourses] = useState([]);
  const { isUserMonitor, getUserData } = usePermissionContext();
  const userData = getUserData();
  const navigate = useNavigate();

  const [disciplines] = useState([
    { id: 1, name: "Algoritmos e Estruturas de Dados", professor: "Dr. Silva", students: 45, monitors: 3 },
    { id: 2, name: "Engenharia de Software", professor: "Dra. Oliveira", students: 60, monitors: 5 },
    { id: 3, name: "Sistemas Distribuídos", professor: "Dr. Santos", students: 30, monitors: 2 },
    { id: 4, name: "Circuitos Lógicos", professor: "Milton Lacerda", students: 30, monitors: 2 },
    { id: 5, name: "Mecânica dos fluidos", professor: "Hugo Cavalcante", students: 50, monitors: 1 },
    { id: 6, name: "Física Geral", professor: "Alexandre Lirios", students: 40, monitors: 2 },
  ]);

  useEffect(() => {
    const fetchUserCourses = async () => {
      const courses = await get_user_courses(userData.id);
      setUserCourses(courses || []);
    };

    if (userData.id) {
      fetchUserCourses();
    }
  }, [userData.id]);

  const handleRemoveCourses = async (selectedCourseIds) => {
    try {
      // Remove cada curso selecionado
      for (const courseId of selectedCourseIds) {
        // Se for monitor, pode remover o curso completamente
        if (isUserMonitor()) {
          await remove_course(courseId);
        } else {
          // Se for aluno, apenas remove sua relação com o curso
          await remove_user_course(userData.id, courseId);
        }
      }

      // Atualiza a lista de cursos
      const updatedCourses = await get_user_courses(userData.id);
      setUserCourses(updatedCourses || []);
      
      // Notifica o componente pai para atualizar
      if (onCoursesUpdate) {
        onCoursesUpdate();
      }

      console.log('Cursos removidos com sucesso');
    } catch (error) {
      console.error('Erro ao remover cursos:', error);
    }
  };

  const handleOpenRemoveCourses = () => {
    setIsManageMenuOpen(false);
    setIsRemoveCoursesOpen(true);
  };

  return (
    <>
      <header className="app-header">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <nav className="nav-links">
          <a href="#" className="nav-link" onClick={() => navigate('/')}>
            <Home size={18} />
            <span>Início</span>
          </a>

          {/* <a href="#" className="nav-link" onClick={() => setIsNotificationOpen(true)}>
            <Bell size={18} />
            <span>Notificações</span>
          </a> */}

          {isUserMonitor() && (
            <div style={{ position: 'relative' }}>
              <a 
                href="#" 
                className="nav-link" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsManageMenuOpen(!isManageMenuOpen);
                }}
              >
                <Settings size={18} />
                <span>Gerenciar Disciplinas</span>
              </a>
              
              {isManageMenuOpen && (
                <>
                  <div 
                    className="manage-menu-overlay"
                    onClick={() => setIsManageMenuOpen(false)}
                  />
                  <div className="manage-menu-popout">
                    <button 
                      className="manage-menu-option"
                      onClick={handleOpenRemoveCourses}
                    >
                      Remover Cursos
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <a href="#" className="nav-link avatar-link" onClick={() => navigate('/perfil')}>
            {userData.avatar ? (
              <img src={userData.avatar} alt={userData.nome} className="avatar-small" />
            ) : (
              <div className="avatar-small-fallback">
                {userData.nome.charAt(0).toUpperCase()}
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

      <RemoveCoursesModal
        isOpen={isRemoveCoursesOpen}
        onClose={() => setIsRemoveCoursesOpen(false)}
        disciplines={userCourses}
        onRemoveCourses={handleRemoveCourses}
      />
    </>
  );
}

function App() {
  const [currentView, setCurrentView] = useState("list");
  const [coursesUpdateTrigger, setCoursesUpdateTrigger] = useState(0);

  const handleCoursesUpdate = () => {
    setCoursesUpdateTrigger(prev => prev + 1);
  };

  return (
    <PermissionProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<TelaLogin />} />
            
            <Route path="/*" element={
              <ProtectedRoute>
                <>
                  <Header onCoursesUpdate={handleCoursesUpdate} />
                  <main className="main-content">
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <TelaDashboard 
                            currentView={currentView}
                            setCurrentView={setCurrentView}
                            coursesUpdateTrigger={coursesUpdateTrigger}
                          />
                        } 
                      />
                      <Route
                        path="/perfil"
                        element={
                          <TelaPerfil />
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