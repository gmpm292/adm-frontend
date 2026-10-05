import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useFormik } from "formik";
import * as Yup from "yup";
import { REQUEST_PASSWORD_CHANGE } from "../graphql/queries";
import { AuthLayout, FormField } from "../../../components/ui";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Ingrese un email válido")
    .required("El email es requerido"),
});

/**
 * Solicitud del enlace para restablecer la contraseña.
 * La respuesta es la misma exista o no la cuenta, para no revelar correos.
 */
export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState(null);
  const [requestPasswordChange, { loading, error }] = useMutation(
    REQUEST_PASSWORD_CHANGE
  );

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async ({ email }) => {
      try {
        await requestPasswordChange({ variables: { input: { email } } });
        setSentTo(email);
      } catch (err) {
        console.error("Error al solicitar el cambio de contraseña:", err);
      }
    },
  });

  const emailError = formik.touched.email && formik.errors.email;
  const backToLogin = <Link to="/login">Volver al inicio de sesión</Link>;

  if (sentTo) {
    return (
      <AuthLayout
        title="Revisa tu correo"
        subtitle={`Si ${sentTo} corresponde a una cuenta activa, recibirás un enlace para crear una contraseña nueva.`}
        footer={backToLogin}
      >
        <Message
          severity="info"
          text="¿No llega? Revisa la carpeta de correo no deseado o solicita otro enlace."
          className="w-full mb-4"
        />
        <Button
          label="Solicitar otro enlace"
          severity="secondary"
          className="w-full"
          onClick={() => setSentTo(null)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva."
      footer={backToLogin}
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <FormField
          label="Correo electrónico"
          htmlFor="email"
          error={emailError}
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
            invalid={Boolean(emailError)}
            autoFocus
          />
        </FormField>

        {error && (
          <Message
            severity="error"
            text="No se pudo enviar la solicitud. Inténtalo de nuevo."
            className="w-full mb-4"
          />
        )}

        <Button
          type="submit"
          label="Enviar enlace"
          loading={loading}
          className="w-full"
          disabled={loading}
        />
      </form>
    </AuthLayout>
  );
}
