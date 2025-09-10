/*
    ATENÇÃO ESSE CÓDIGO NÃO É PRA USAR, ELE VAI SER USADO FUTURAMENTE PARA REUSO NO PROJETO
*/

import { useState, useRef } from 'react';

export default function MonitoringSystem() {
  const [disciplines, setDisciplines] = useState([]);
  const [disciplineName, setDisciplineName] = useState('');
  const [disciplineComment, setDisciplineComment] = useState('');

  // Adicionar nova disciplina
  const addDiscipline = () => {
    const name = disciplineName.trim();
    const comment = disciplineComment.trim();

    if (!name) {
      alert('Digite o nome da disciplina!');
      return;
    }

    const newDiscipline = {
      id: Date.now(),
      name,
      comment: comment || 'Clique para adicionar um comentário...',
      files: []
    };

    setDisciplines([...disciplines, newDiscipline]);
    setDisciplineName('');
    setDisciplineComment('');
  };

  // Atualizar disciplina
  const updateDiscipline = (id, field, value) => {
    setDisciplines(disciplines.map(discipline => 
      discipline.id === id 
        ? { ...discipline, [field]: value }
        : discipline
    ));
    alert(`Alteração feita: ${value}`);
  };

  // Upload de arquivo
  const uploadFile = (disciplineId, fileInput) => {
    if (fileInput.files.length === 0) {
      alert('Selecione um arquivo!');
      return;
    }

    const file = fileInput.files[0];
    
    // Simulação de upload
    const newFile = {
      id: Date.now(),
      name: file.name,
      downloadUrl: '#',
      comment: 'Clique para adicionar comentário...'
    };

    setDisciplines(disciplines.map(discipline =>
      discipline.id === disciplineId
        ? { ...discipline, files: [...discipline.files, newFile] }
        : discipline
    ));

    // Limpar input
    fileInput.value = '';
  };

  // Atualizar comentário do arquivo
  const updateFileComment = (disciplineId, fileId, comment) => {
    setDisciplines(disciplines.map(discipline =>
      discipline.id === disciplineId
        ? {
            ...discipline,
            files: discipline.files.map(file =>
              file.id === fileId ? { ...file, comment } : file
            )
          }
        : discipline
    ));
    alert(`Comentário salvo: ${comment}`);
  };

  // Excluir disciplina
  const deleteDiscipline = (disciplineId, disciplineName) => {
    if (confirm(`Você tem certeza que quer excluir a disciplina "${disciplineName}"?`)) {
      if (confirm('Essa ação é permanente. Deseja continuar?')) {
        setDisciplines(disciplines.filter(discipline => discipline.id !== disciplineId));
        alert(`Disciplina "${disciplineName}" foi excluída!`);
      }
    }
  };

  // Excluir arquivo
  const deleteFile = (disciplineId, fileId, fileName) => {
    if (confirm(`Você tem certeza que quer excluir o arquivo "${fileName}"?`)) {
      if (confirm('Essa ação é permanente. Deseja continuar?')) {
        setDisciplines(disciplines.map(discipline =>
          discipline.id === disciplineId
            ? {
                ...discipline,
                files: discipline.files.filter(file => file.id !== fileId)
              }
            : discipline
        ));
        alert(`Arquivo "${fileName}" foi excluído!`);
      }
    }
  };

  return (
    <div className="font-sans m-10">
      <h2 className="text-2xl font-bold mb-6">📘 Sistema de Monitoria - Disciplinas com Comentários</h2>

      {/* Formulário para criar disciplina */}
      <div className="mb-6 space-y-2">
        <input
          type="text"
          value={disciplineName}
          onChange={(e) => setDisciplineName(e.target.value)}
          placeholder="Nome da disciplina"
          className="border border-gray-300 px-3 py-2 rounded mr-2"
        />
        <input
          type="text"
          value={disciplineComment}
          onChange={(e) => setDisciplineComment(e.target.value)}
          placeholder="Comentário curto (opcional)"
          className="border border-gray-300 px-3 py-2 rounded mr-2"
        />
        <button
          onClick={addDiscipline}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Adicionar Disciplina
        </button>
      </div>

      {/* Lista de disciplinas */}
      <div>
        {disciplines.map(discipline => (
          <div key={discipline.id} className="border-2 border-green-500 rounded-lg p-4 mb-4">
            <h3
              contentEditable
              suppressContentEditableWarning={true}
              onBlur={(e) => updateDiscipline(discipline.id, 'name', e.target.textContent)}
              className="text-xl font-semibold mb-2 outline-none"
            >
              {discipline.name}
            </h3>
            
            <p
              contentEditable
              suppressContentEditableWarning={true}
              onBlur={(e) => updateDiscipline(discipline.id, 'comment', e.target.textContent)}
              className="text-sm text-gray-600 mb-4 outline-none"
            >
              {discipline.comment}
            </p>

            <div className="mb-4">
              <input
                type="file"
                id={`file-${discipline.id}`}
                className="mr-2"
              />
              <button
                onClick={() => {
                  const input = document.getElementById(`file-${discipline.id}`);
                  uploadFile(discipline.id, input);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
              >
                Upload
              </button>
              <button
                onClick={() => deleteDiscipline(discipline.id, discipline.name)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Excluir Disciplina
              </button>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">📂 Arquivos:</h4>
              {discipline.files.map(file => (
                <div
                  key={file.id}
                  className="flex justify-between items-center mb-2 p-2 border border-gray-300 rounded"
                >
                  <span className="font-medium">{file.name}</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={(e) => updateFileComment(discipline.id, file.id, e.target.textContent)}
                    className="text-sm text-gray-600 outline-none flex-1 mx-4"
                  >
                    {file.comment}
                  </span>
                  <div>
                    <button
                      onClick={() => window.location.href = file.downloadUrl}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-1 text-sm"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => deleteFile(discipline.id, file.id, file.name)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}