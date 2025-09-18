import './App.css';
import TelaDeCurso from './tela_de_curso/TelaDeCurso.js';
import { PermissionProvider } from './context/PermissionContext.js';

function App() {

  return (
    <PermissionProvider>
      <div>
        <Header/>
        <TelaDeCurso/>
      </div>
    </PermissionProvider>
  );

}

function Header() {
  return (
    <div class='header'>
      <div class='header-left'>
        <div class='home-btn'>Menu</div>
      </div>
      <div class='header-right'>
        <div class='perfil'>
          <label>SEU NOME</label>
          <div class='avatar'>👤</div>
        </div>
      </div>
    </div>
  );
}

export default App;