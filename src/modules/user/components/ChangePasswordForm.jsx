import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import {
  CHANGE_PASSWORD,
  CHECK_CONFIRMATION_TOKEN,
} from "../../auth/graphql/queries";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  AuthLayout,
  FormField,
  LoadingScreen,
} from "../../../components/ui";

const MIN_PASSWORD_LENGTH = 8;

const validationSchema = Yup.object({
  password: Yup.string()
    .required("La contraseña es requerida")
    .min(
      MIN_PASSWORD_LENGTH,
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
    ),
  confirm: Yup.string()
    .required("Confirma la contraseña")
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden"),
});

/**
 * Creación de una contraseña nueva a partir del enlace enviado por correo
 */
export const ChangePasswordForm = () => {
  const { confirmationToken } = useParams();
  const navigate = useNavigate();

  const [changePassword, { error }] = useMutation(CHANGE_PASSWORD);
  const [checkToken] = useMutation(CHECK_CONFIRMATION_TOKEN);

  // null: comprobando el enlace · true: válido · false: inválido o caducado
  const [validLink, setValidLink] = useState(null);
  const [done, setDone] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirm: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await changePassword({
          variables: {
            input: {
              confirmationToken,
              newPassword: values.password,
            },
          },
        });
        setDone(true);
      } catch (err) {
        console.error("Error al cambiar la contraseña:", err);
      }
    },
  });

  useEffect(() => {
    if (!confirmationToken) {
      setValidLink(false);
      return;
    }

    checkToken({ variables: { input: { confirmationToken } } })
      .then(({ data }) => setValidLink(Boolean(data?.checkConfirmationToken)))
      .catch(() => setValidLink(false));
  }, [confirmationToken, checkToken]);

  const fieldError = (name) => formik.touched[name] && formik.errors[name];

  if (validLink === null) {
    return <LoadingScreen message="Comprobando el enlace..." />;
  }

  if (done) {
    return (
      <AuthLayout
        title="Contraseña actualizada"
        subtitle="Ya puedes entrar con tu contraseña nueva."
      >
        <Button
          label="Ir al inicio de sesión"
          className="w-full"
          onClick={() => navigate("/login")}
        />
      </AuthLayout>
    );
  }

  if (!validLink) {
    return (
      <AuthLayout
        title="Enlace no válido"
        subtitle="Este enlace ya se usó o caducó. Solicita uno nuevo para crear tu contraseña."
        footer={<Link to="/login">Volver al inicio de sesión</Link>}
      >
        <Button
          label="Solicitar otro enlace"
          className="w-full"
          onClick={() => navigate("/forgot-password")}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crea tu contraseña"
      subtitle="Elige una contraseña nueva para tu cuenta."
      footer={<Link to="/login">Volver al inicio de sesión</Link>}
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <FormField
          label="Contraseña nueva"
          htmlFor="password"
          hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          error={fieldError("password")}
        >
          <Password
            inputId="password"
            name="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            invalid={Boolean(fieldError("password"))}
            feedback={false}
            toggleMask
          />
        </FormField>

        <FormField
          label="Confirmar contraseña"
          htmlFor="confirm"
          error={fieldError("confirm")}
        >
          <Password
            inputId="confirm"
            name="confirm"
            autoComplete="new-password"
            value={formik.values.confirm}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            invalid={Boolean(fieldError("confirm"))}
            feedback={false}
            toggleMask
          />
        </FormField>

        {error && (
          <Message
            severity="error"
            text="No se pudo guardar la contraseña. Solicita un enlace nuevo e inténtalo otra vez."
            className="w-full mb-4"
          />
        )}

        <Button
          type="submit"
          label="Guardar contraseña"
          loading={formik.isSubmitting}
          className="w-full"
          disabled={formik.isSubmitting}
        />
      </form>
    </AuthLayout>
  );
};

export default ChangePasswordForm;
