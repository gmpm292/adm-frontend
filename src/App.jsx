import { useState } from 'react';
import { ApolloProvider } from '@apollo/client'
import { client } from './apollo'
import { LoginPage } from './modules/auth/pages/LoginPage'
import { MainLayout } from './layout/components/MainLayout'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import './App.css'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <ApolloProvider client={client}>
            {!isAuthenticated ? (
                <LoginPage onLogin={() => setIsAuthenticated(true)} />
            ) : (
                <MainLayout>
                    <div className="card">
                        <h1>Contenido Principal</h1>
                    </div>
                </MainLayout>
            )}
        </ApolloProvider>
    )
}

export default App
