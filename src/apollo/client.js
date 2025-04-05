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

// const errorLink = onError(({ graphQLErrors, operation, forward }) => {
//   if (graphQLErrors) {
//     for (const err of graphQLErrors) {
//       console.log("Error extensions", err.extensions);
//       if (
//         err.extensions?.code === "401" &&
//         (err.message === "Unauthorized" || err.message === "UnauthorizedError")
//       ) {
//         // Si no está refrescando, inicia el proceso de refresh
//         if (!isRefreshing) {
//           isRefreshing = true;

//           client
//             .mutate({ mutation: REFRESH_TOKEN })
//             .then(() => {
//               // Resuelve las solicitudes pendientes
//               resolvePendingRequests();
//               isRefreshing = false;
//             })
//             .catch((error) => {
//               console.error("Error al refrescar el token:", error);
//               // Si el refresh falla, redirige al login
//               rejectPendingRequests();
//               isRefreshing = false;
//               window.location.href = "/login";
//             });
//         }

//         return new Observable((observer) => {
//           pendingRequests.push(() => {
//             forward(operation).subscribe({
//               next: (value) => observer.next(value),
//               error: (err) => observer.error(err),
//               complete: () => observer.complete(),
//             });
//           });
//         });
//       }
//     }
//   }
// });

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.log("Error extensions", err.extensions);

      if (
        err.extensions?.code === "401" &&
        (err.message === "Unauthorized" || err.message === "UnauthorizedError")
      ) {
        if (!isRefreshing) {
          isRefreshing = true;

          const refreshPromise = client
            .mutate({ mutation: REFRESH_TOKEN })
            .then(({ data }) => {
              if (data?.refresh?.accessToken) {
                console.log("Token refrescado correctamente");
                resolvePendingRequests();
              } else {
                throw new Error("Refresh token falló");
              }
            })
            .catch((error) => {
              console.error("Error al refrescar el token:", error);
              rejectPendingRequests();
              window.location.href = "/login"; // Redirigir al login si falla el refresh
            })
            .finally(() => {
              isRefreshing = false;
            });

          return new Observable((observer) => {
            refreshPromise.finally(() => {
              forward(operation).subscribe(observer);
            });
          });
        }

        return new Observable((observer) => {
          pendingRequests.push(() => {
            forward(operation).subscribe(observer);
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
