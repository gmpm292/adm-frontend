import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { REFRESH_TOKEN } from "../modules/auth/graphql/queries";
import { Observable } from "@apollo/client/core";

console.log("API URL:", import.meta.env.VITE_API_URL);

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

const rejectPendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.log("err", err);
      console.log("operation", operation);
      const isUnauthorized =
        err.extensions?.code === "401" &&
        (err.message === "Unauthorized" || err.message === "UnauthorizedError");

      console.log("isUnauthorized", isUnauthorized);
      if (isUnauthorized) {
        if (!isRefreshing) {
          isRefreshing = true;

          const refreshPromise = client
            .mutate({ mutation: REFRESH_TOKEN })
            .then(({ data }) => {
              if (data?.refresh?.accessToken) {
                console.log("Token refrescado correctamente");
                resolvePendingRequests();
                console.log("Retorna true.");
                return true;
              } else {
                throw new Error("Refresh token falló");
              }
            })
            .catch((error) => {
              console.error("Error al refrescar el token:", error);
              rejectPendingRequests();

              // Limpiar estado antes de redirigir
              localStorage.removeItem("isAuthenticated");
              localStorage.removeItem("userAuthenticated");

              window.dispatchEvent(new Event("auth-failed"));
              return false;
            })
            .finally(() => {
              console.error("Error al refrescar el token: .finally");
              isRefreshing = false;
            });

          return new Observable((observer) => {
            refreshPromise.then((success) => {
              console.log("success", success);
              if (success) {
                forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                });
              } else {
                observer.error(new Error("No se pudo refrescar el token"));
              }
            });
          });
        } else {
          console.log("isRefreshing", isRefreshing);
          isRefreshing = false;
          window.dispatchEvent(new Event("auth-failed"));
        }

        return new Observable((observer) => {
          pendingRequests.push(() => {
            forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          });
        });
      }
    }
  }
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
  cache: new InMemoryCache(),
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
