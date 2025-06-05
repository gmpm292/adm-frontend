import { useAuthContext } from "../modules/auth/components/AuthContext";

const useLogout = () => {
  const { logout } = useAuthContext();
  return logout;
};

export default useLogout;
