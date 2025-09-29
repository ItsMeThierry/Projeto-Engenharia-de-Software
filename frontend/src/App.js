import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { PermissionProvider } from './context/PermissionContext.js';
import TelaDeCurso from './tela_de_curso/TelaDeCurso.js';
import TelaDashboard from './tela_dashboard/TelaDashboard.js';
import TelaLogin from './tela_login/TelaLogin.js';
import TelaErro from './TelaErro.js';
import { is_course_real } from './api/requests.js';
import './App.css';

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

function App() {
  return (
    <PermissionProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<TelaLogin />} />
            
            <Route path="/*" element={
              <>
                <Header />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<TelaDashboard />} />
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