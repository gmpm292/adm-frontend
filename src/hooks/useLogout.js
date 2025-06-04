import { useMutation } from "@apollo/client";

import { useNavigate } from "react-router-dom";
import { LOGOUT } from "../modules/auth/graphql/queries";

const useLogout = () => {
  const [logout] = useMutation(LOGOUT);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userAuthenticated");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return handleLogout;
};

export default useLogout;
