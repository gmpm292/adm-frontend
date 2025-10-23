import { ApolloProvider } from "@apollo/client";
//import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  HashRouter as BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";

import { client } from "./apollo";

import { AuthProvider } from "./modules/auth/components/AuthContext";
import ProtectedRoute from "./modules/auth/components/ProtectedRoute";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { MainLayout } from "./layout/components/MainLayout";
import { Analytics } from "./modules/statistics/pages/Analytics";
import { Sales } from "./modules/statistics/pages/Sales";
import { UserListPage } from "./modules/user/pages/UserListPage";

import { CompanyModule } from "./modules/company";
import { InventoryModule } from "./modules/inventory";
import { PayrollModule } from "./modules/payroll";
import { SalesModule } from "./modules/sales";
import { UserCreateFirstPage } from "./modules/user/pages/UserCreateFirstPage";
import { ChangePasswordPage } from "./modules/user/pages/ChangePasswordPage";
import { ConfigListPage } from "./modules/config/pages/ConfigListPage";
import { ProfilePage } from "./modules/user/pages/ProfilePage";
import { EmailSettingsPage } from "./modules/auth/email/email_oauth_config/pages/EmailSettingsPage";

// Importaciones de PrimeReact
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";
import "./styles/ButtonStyles.css";
import "./styles/dialogs.css";
import "./components/BaseTable/styles.css";

// Importar locale español
import { PrimeReactProvider } from "primereact/api";
import { setupLocales } from "./locales/i18n";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { QzTrayPage } from "./modules/printing/printing.module";

function App() {
  // Inicializar locales
  useEffect(() => {
    setupLocales();
  }, []);

  // 🔁 Redirige automáticamente si viene de Google OAuth sin hash
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const scope = searchParams.get("scope");
    const prompt = searchParams.get("prompt");

    const isRedirect =
      window.location.hash && window.location.hash === "#/system/email";

    if (code && scope && prompt && !isRedirect) {
      const newUrl = `/#/system/email?${searchParams.toString()}`;
      window.location.replace(newUrl);
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <PrimeReactProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cfu" element={<UserCreateFirstPage />} />
              <Route
                path="/change-password/:confirmationToken"
                element={<ChangePasswordPage />}
              />

              <Route element={<ProtectedRoute />}>
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
                <Route
                  path="/profile"
                  element={
                    <MainLayout>
                      <ProfilePage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/configurations"
                  element={
                    <MainLayout>
                      <ConfigListPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/company/*"
                  element={
                    <MainLayout>
                      <CompanyModule />
                    </MainLayout>
                  }
                />
                <Route
                  path="/inventory/*"
                  element={
                    <MainLayout>
                      <InventoryModule />
                    </MainLayout>
                  }
                />
                <Route
                  path="/payroll/*"
                  element={
                    <MainLayout>
                      <PayrollModule />
                    </MainLayout>
                  }
                />
                <Route
                  path="/sales/*"
                  element={
                    <MainLayout>
                      <SalesModule />
                    </MainLayout>
                  }
                />
                <Route
                  path="/system/email"
                  element={
                    <MainLayout>
                      <EmailSettingsPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/system/printing"
                  element={
                    <MainLayout>
                      <QzTrayPage />
                    </MainLayout>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </PrimeReactProvider>
    </ApolloProvider>
  );
}

export default App;
