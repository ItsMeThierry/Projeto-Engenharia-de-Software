import { usePermissionContext } from '../context/PermissionContext';
import { ReactComponent as AddUserIcon } from '../icones/adicionar-usuario.svg';
import { ReactComponent as RemoveUserIcon } from '../icones/remover-usuario.svg';
import './Participantes.css'

function UsersList() {
    const { user_type } = usePermissionContext();

    const renderListConfig = ({ user_type }) => {
        if(user_type === 'monitor'){
            return(
                <div class='users-list-config'>
                    <button class='add-usr-btn'><AddUserIcon class='add-usr-icon'/></button>
                    <button class='remove-usr-btn'><RemoveUserIcon class='remove-usr-icon'/></button>
                </div>
            );
        };
    };

    return(
        <div class='page'>
            {renderListConfig({user_type})}
            <div class='users-list'>
                <UserCard name='Nome 1' email='nome1@email.com'/>
                <UserCard name='Nome 2' email='nome2@email.com'/>
                <UserCard name='Nome 3' email='nome3@email.com'/>
                <UserCard name='Nome 4' email='nome4@email.com'/>
                <UserCard name='Nome 1' email='nome1@email.com'/>
                <UserCard name='Nome 2' email='nome2@email.com'/>
                <UserCard name='Nome 3' email='nome3@email.com'/>
                <UserCard name='Nome 4' email='nome4@email.com'/>
            </div>
        </div>
    );
}

function UserCard({ name, email }) {
    return(
        <div class='user-card'>
            <h1>{name}</h1>
            <span>{email}</span>
        </div>
    );
}

export default UsersList;