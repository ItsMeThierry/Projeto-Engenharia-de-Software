import { usePermissionContext } from '../context/PermissionContext';
import { ReactComponent as AddUserIcon } from '../icones/adicionar-usuario.svg';
import { ReactComponent as RemoveUserIcon } from '../icones/remover-usuario.svg';
import './Participantes.css'

function UsersList() {
    const { user_type } = usePermissionContext();

    const renderListConfig = ({ user_type }) => {
        if(user_type === 'monitor'){
            return(
                <div className='users-list-config'>
                    <button className='add-usr-btn'><AddUserIcon className='add-usr-icon'/></button>
                    <button className='remove-usr-btn'><RemoveUserIcon className='remove-usr-icon'/></button>
                </div>
            );
        };
    };

    const users = [
        {
            nome: "Nome 1",
            email: "nome1@email.com"
        },
        {
            nome: "Nome 2",
            email: "nome2@email.com"
        },
        {
            nome: "Nome 3",
            email: "nome3@email.com"
        }
    ];

    return(
        <div className='page'>
            {renderListConfig({user_type})}
            <div className='users-list'>
                {users.map(u => (<UserCard name={u.nome} email={u.email}/>))}
            </div>
        </div>
    );
}

function UserCard({ name, email }) {
    return(
        <div className='user-card'>
            <h1>{name}</h1>
            <span>{email}</span>
        </div>
    );
}

export default UsersList;