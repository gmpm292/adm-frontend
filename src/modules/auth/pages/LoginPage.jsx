import { LoginForm } from "../components/LoginForm";
import "../styles/LoginPage.css";
import "../../../styles/ButtonStyles.css";

export function LoginPage() {
  console.log("Styles should be loaded"); // Para debug

  return (
    <div className="login-page">
      <div className="login-container w-full lg:w-6 md:w-8">
        <div className="login-header">
          {/* Si tienes un logo, puedes agregarlo aquí */}
          {/* <img src="/path/to/logo.png" alt="Logo" className="login-logo" /> */}
          <div className="login-title">Bienvenido</div>
          <span className="login-subtitle">Inicia sesión para continuar</span>
        </div>
        <LoginForm /> 
      </div>
    </div>
  );
}