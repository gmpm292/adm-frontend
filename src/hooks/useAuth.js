import { useQuery } from "@apollo/client";
import { GET_PROFILE } from "../modules/auth/graphql/queries";

const useAuth = () => {
  const { data, error, loading } = useQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error al verificar autenticación query(GET_PROFILE):", error);
    },
  });

  const isAuthenticated = !error && data?.profile;

  return { isAuthenticated, loading };
};

export default useAuth;
