// Usuários
const is_user_real = async (name, email) => {
  try {
    const params = new URLSearchParams({
      nome: name,
      email: email
    });

    const response = await fetch(`http://localhost:5000/api/usuarios/verify?${params}`);
    
    const data = await response.json();
    return data.exists;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const get_user =  async (identifier) => {
    try {
        const response = await fetch(`http://localhost:5000/api/usuarios/${identifier}`);
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

const create_user = async (name, email, type) => {
    try{
        const response = await fetch(`http://localhost:5000/api/usuarios`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({
                nome: name,
                email: email,
                cargo: type
            }),
        });
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

// Usuários Em Curso
const get_participants =  async (id_course) => {
    try {
        const response = await fetch(`http://localhost:5000/api/usuarios-em-curso/${id_course}/participantes`);
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

const add_user_course = async (id_user, id_course) => {
    try{
        const response = await fetch(`http://localhost:5000/api/usuarios-em-curso`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({
                usuario_id: id_user,
                curso_id: id_course
            }),
        });

        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

const remove_user_course = async (id_user, id_course) => {

}

const get_user_courses = async (id_user) => {
    try {
        const response = await fetch(`http://localhost:5000/api/usuarios-em-curso/${id_user}`)
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

// Cursos
const add_course = async (name, description, id_user) => {
    try{
        const response = await fetch(`http://localhost:5000/api/cursos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({
                nome: name,
                descricao: description,
                ID: id_user
            }),
        });
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

const remove_course = async (id_course) => {
    try{
        const response = await fetch(`http://localhost:5000/api/cursos/${id_course}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if(response.ok) {
            console.log('Sucesso');
        } else {
            console.log(`Erro: ${data.error}`);
        }
    } catch (e) {
        console.error(e);
    }
}

const is_course_real = async (id_course) => {
    try {
        const response = await fetch(`http://localhost:5000/api/cursos/${id_course}`);
        
        if (response.status === 404) {
            return false;
        }
        
        if (response.ok) {
            const data = await response.json();
            return data !== null && data !== undefined;
        }
        
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
}

// Grupos de Arquivo
const get_content_groups = async (id_course) => {
    try{
        const response = await fetch(`http://localhost:5000/api/modulos/curso/${id_course}`);
        const data = await response.json();

        if(response.ok) {
            data.map(group => group.contents = []); // TODO: RETIRAR QUANDO IMPLEMENTAR O ARMAZENAMENTO DE ARQUIVOS
        }

        return data;
    } catch (e) {
        console.error(e);
    }
}

const create_content_group = async (name, description, id_course) => {
    try{
        const response = await fetch(`http://localhost:5000/api/modulos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({
                nome: name,
                descricao: description,
                curso_id: id_course
            }),
        });
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

const edit_content_group = async (id_group, name, description) => {
    try{
        const response = await fetch(`http://localhost:5000/api/modulos/${id_group}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({
                nome: name,
                descricao: description
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log(`Grupo editado ${name} com sucesso`);
            return data;
        } else {
            console.log(`Erro ${data.error}`);
        }
    } catch (e) {
        console.error(e);
    }
}

const delete_content_group = async (id_group) => {
    try{
        const response = await fetch(`http://localhost:5000/api/modulos/${id_group}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if(response.ok) {
            console.log('Sucesso');
        } else {
            console.log(`Erro: ${data.error}`);
        }
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    is_user_real,
    get_user,
    create_user,
    get_participants,
    get_user_courses,
    add_user_course,
    remove_user_course,
    add_course,
    remove_course,
    is_course_real,
    get_content_groups,
    create_content_group,
    edit_content_group,
    delete_content_group
};