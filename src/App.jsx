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
import { UnauthorizedPage } from "./modules/auth/pages/UnauthorizedPage";
import { ForgotPasswordPage } from "./modules/auth/pages/ForgotPasswordPage";
import { TwoFactorPage } from "./modules/auth/pages/TwoFactorPage";
import { AppShell } from "./layout/components/AppShell";
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

// Importar locale español
import { PrimeReactProvider } from "primereact/api";
import { setupLocales } from "./locales/i18n";
import { QzTrayPage } from "./modules/printing/printing.module";
import { RoleGuardListPage } from "./modules/role-guard";
import { ScopedAccessListPage } from "./modules/scoped-access";

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
      // Con la base de Vite (/adm-frontend/): sin ella se saldría de la aplicación
      const newUrl = `${import.meta.env.BASE_URL}#/system/email?${searchParams.toString()}`;
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
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/two-factor" element={<TwoFactorPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                <Route
                  path="/statistics/analytics"
                  element={<Analytics />}
                />
                <Route
                  path="/statistics/sales"
                  element={<Sales />}
                />
                <Route
                  path="/users"
                  element={<UserListPage />}
                />
                <Route
                  path="/profile"
                  element={<ProfilePage />}
                />
                <Route
                  path="/configurations"
                  element={<ConfigListPage />}
                />
                <Route
                  path="/company/*"
                  element={<CompanyModule />}
                />
                <Route
                  path="/inventory/*"
                  element={<InventoryModule />}
                />
                <Route
                  path="/payroll/*"
                  element={<PayrollModule />}
                />
                <Route
                  path="/sales/*"
                  element={<SalesModule />}
                />
                <Route
                  path="/system/email"
                  element={<EmailSettingsPage />}
                />
                <Route
                  path="/system/printing"
                  element={<QzTrayPage />}
                />

                <Route
                  path="/system/security/role-guards"
                  element={<RoleGuardListPage />}
                />
                <Route
                  path="/system/security/scoped-access"
                  element={<ScopedAccessListPage />}
                />
                </Route>
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
