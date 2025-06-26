import { ApolloProvider } from "@apollo/client";
//import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  HashRouter as BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";
import "./styles/ButtonStyles.css";
import "./styles/dialogs.css";
import "./components/BaseTable/styles.css";

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* <Route path="/login" element={<LoginPage />} /> */}
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
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
