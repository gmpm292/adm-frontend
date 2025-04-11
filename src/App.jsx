import { useState } from "react";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { client } from "./apollo";

import { LoginPage } from "./modules/auth/pages/LoginPage";
import { MainLayout } from "./layout/components/MainLayout";
import { Analytics } from "./modules/statistics/pages/Analytics";
import { Sales } from "./modules/statistics/pages/Sales";
import { UserListPage } from "./modules/user/pages/UserListPage";
import ProtectedRoute from "./modules/auth/components/ProtectedRoute";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";
import './styles/dialogs.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación

  // Función que se pasa a LoginPage para manejar el inicio de sesión exitoso
  const handleLogin = () => {
    setIsAuthenticated(true); // Actualiza el estado de autenticación
  };

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública (login) */}
          <Route
            path="/login"
            element={<LoginPage onLogin={handleLogin} />}
          />{" "}
          {/* Pasa handleLogin como prop */}
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route
              path="/statistics/analytics"
              element={
                <MainLayout>
                  <Analytics />
                </MainLayout>
              }
            />
            <Route
              path="/statistics/sales"
              element={
                <MainLayout>
                  <Sales />
                </MainLayout>
              }
            />
            <Route
              path="/users"
              element={
                <MainLayout>
                  <UserListPage />
                </MainLayout>
              }
            />
          </Route>
          {/* Redirigir a /login por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
