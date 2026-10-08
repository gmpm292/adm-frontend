import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { REFRESH_TOKEN } from "../modules/auth/graphql/queries";
import { Observable } from "@apollo/client/core";

let refreshPromise = null;

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const unauthorized = graphQLErrors?.some(
    (error) =>
      String(error.extensions?.code) === "401" &&
      (error.message === "Unauthorized" ||
        error.message === "UnauthorizedError"),
  );

  if (!unauthorized || operation.getContext().skipAuthRefresh) {
    return;
  }

  const clearAuthentication = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userAuthenticated");
    window.dispatchEvent(new Event("auth-failed"));
  };

  if (operation.getContext().authRefreshRetried) {
    clearAuthentication();
    return;
  }

  if (!refreshPromise) {
    refreshPromise = client
      .mutate({
        mutation: REFRESH_TOKEN,
        context: { skipAuthRefresh: true },
      })
      .then(({ data }) => {
        if (!data?.refresh?.accessToken) {
          throw new Error("El backend no devolvió un token de acceso renovado");
        }
      })
      .catch((error) => {
        console.error("Error al refrescar el token:", error);
        clearAuthentication();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  operation.setContext({ authRefreshRetried: true });

  return new Observable((observer) => {
    let subscription;
    let cancelled = false;

    refreshPromise
      .then(() => {
        if (cancelled) return;

        subscription = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch((error) => {
        if (!cancelled) observer.error(error);
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  });
});

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});

// Cliente con más opciones de debug
export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      // Filas de clasificaciones (productos, vendedores, clientes...): su id es
      // el de entidades distintas, así que no sirve para identificarlas en caché
      StatisticsRanking: { keyFields: false },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
    },
    query: {
      fetchPolicy: "network-only",
    },
  },
  connectToDevTools: true, // Esto ayudará a debuggear en las DevTools
});
