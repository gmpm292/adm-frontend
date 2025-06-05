import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { CLASSIC_LOGIN } from "../graphql/queries";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginQuery, { loading, error }] = useLazyQuery(CLASSIC_LOGIN, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error detallado:", {
        message: error.message,
        networkError: error.networkError,
        graphQLErrors: error.graphQLErrors,
        extraInfo: error.extraInfo,
      });
    },
  });

  const { login } = useAuthContext(); // authContext.login()
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginQuery({
        variables: { input: { email, password } },
      });

      const profile = data?.classicLogin?.profile;

      if (profile) {
        login(profile); // Guarda en contexto
        navigate("/statistics/analytics");
      }
    } catch (err) {
      console.error("Error en login:", err);
    }
  };

  return (
    <Card className="login-card" style={{ border: "none", boxShadow: "none" }}>
      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="field">
          <span className="p-float-label">
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-inputtext-lg"
              style={{ width: "100%" }}
            />
            <label htmlFor="email">Email</label>
          </span>
        </div>

        <div className="field">
          <span className="p-float-label">
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              className="p-inputtext-lg"
              feedback={false}
              style={{ width: "100%" }}
            />
            <label htmlFor="password">Password</label>
          </span>
        </div>

        {error && (
          <Message
            severity="error"
            text={error.message || "Error al iniciar sesión"}
            className="w-full mb-3"
          />
        )}

        <Button
          type="submit"
          label={loading ? "Iniciando sesión..." : "Iniciar sesión"}
          icon="pi pi-sign-in"
          loading={loading}
          className="p-button-lg"
          style={{ width: "100%", marginTop: "20px" }}
        />
      </form>
    </Card>
  );
}
