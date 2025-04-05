import { useMutation } from '@apollo/client';
import { LOGOUT } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const [logout] = useMutation(LOGOUT);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return handleLogout;
};

export default useLogout;