import { useState } from 'react';
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { client } from './apollo'
import { LoginPage } from './modules/auth/pages/LoginPage'
import { MainLayout } from './layout/components/MainLayout'
import { Analytics } from './modules/statistics/pages/Analytics'
import { Sales } from './modules/statistics/pages/Sales'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import 'primeflex/primeflex.css';
import './App.css'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Componente protegido que verifica autenticación
    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    return (
        <ApolloProvider client={client}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={
                        !isAuthenticated ? (
                            <LoginPage onLogin={() => setIsAuthenticated(true)} />
                        ) : (
                            <Navigate to="/statistics/analytics" replace />
                        )
                    } />
                    
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Routes>
                                    <Route path="statistics/analytics" element={<Analytics />} />
                                    <Route path="statistics/sales" element={<Sales />} />
                                </Routes>
                            </MainLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </ApolloProvider>
    )
}

export default App
