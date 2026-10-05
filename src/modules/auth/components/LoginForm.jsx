import { useLazyQuery } from "@apollo/client";
import { CLASSIC_LOGIN } from "../graphql/queries";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import { FormField } from "../../../components/ui";
import { useFormik } from "formik";
import * as Yup from "yup";

// Esquema de validación
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Ingrese un email válido")
    .required("El email es requerido"),
  password: Yup.string()
    .min(4, "La contraseña debe tener al menos 4 caracteres")
    .required("La contraseña es requerida"),
});

/**
 * Traduce el error del backend a un mensaje entendible para el usuario
 */
const getLoginErrorMessage = (error) => {
  if (error.networkError) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }

  const message = error.graphQLErrors?.[0]?.message ?? "";

  if (/incorrect/i.test(message)) {
    return "Correo o contraseña incorrectos.";
  }
  if (/disable/i.test(message)) {
    return "Tu usuario está deshabilitado. Contacta al administrador.";
  }
  if (/must have/i.test(message)) {
    return "Tu usuario no tiene asignada la empresa, oficina o equipo que requiere su rol. Contacta al administrador.";
  }
  if (/^Unauthorized(Error)?$/.test(message)) {
    return "Tu usuario no tiene acceso a esta aplicación.";
  }

  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
};

export function LoginForm() {
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

  const { login } = useAuthContext();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { data } = await loginQuery({
          variables: { input: values },
        });

        const profile = data?.classicLogin?.profile;

        if (profile) {
          navigate(login(profile));
        }
      } catch (err) {
        console.error("Error en login:", err);
      }
    },
  });

  const fieldError = (name) => formik.touched[name] && formik.errors[name];

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <FormField
        label="Correo electrónico"
        htmlFor="email"
        error={fieldError("email")}
      >
        <InputText
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="nombre@empresa.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          invalid={Boolean(fieldError("email"))}
          autoFocus
        />
      </FormField>

      <FormField
        label="Contraseña"
        htmlFor="password"
        error={fieldError("password")}
      >
        <Password
          inputId="password"
          name="password"
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          invalid={Boolean(fieldError("password"))}
          feedback={false}
          toggleMask
        />
      </FormField>

      <div className="auth-card__row">
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </div>

      {error && (
        <Message
          severity="error"
          text={getLoginErrorMessage(error)}
          className="w-full mb-4"
        />
      )}

      <Button
        type="submit"
        label={loading ? "Iniciando sesión..." : "Iniciar sesión"}
        loading={loading}
        className="w-full"
        disabled={loading}
      />
    </form>
  );
}
