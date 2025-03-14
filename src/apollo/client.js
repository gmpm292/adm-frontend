import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Para debug - eliminamos '/graphql' de la URL base ya que la API ya lo incluye
console.log('API URL:', import.meta.env.VITE_API_URL);

// Manejador de errores
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) 
    console.log(`[Network error]: ${networkError}`);
});

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente con más opciones de debug
export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
  connectToDevTools: true, // Esto ayudará a debuggear en las DevTools
});