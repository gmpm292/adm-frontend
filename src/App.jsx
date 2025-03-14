import { ApolloProvider } from '@apollo/client'
import { client } from './apollo'
import { LoginPage } from './modules/auth/pages/LoginPage'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import './App.css'

function App() {
  return (
    <ApolloProvider client={client}>
      <LoginPage />
    </ApolloProvider>
  )
}

export default App
