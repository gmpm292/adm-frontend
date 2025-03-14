import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
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