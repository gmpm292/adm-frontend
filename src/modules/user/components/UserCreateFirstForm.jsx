import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_FIRST_USER } from "../graphql/queries";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, FormField } from "../../../components/ui";

const MIN_PASSWORD_LENGTH = 5;

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Nombres debe tener al menos 3 caracteres")
    .required("Nombres es requerido"),
  email: Yup.string().email("Email inválido").required("Email es requerido"),
  mobile: Yup.string().required("Teléfono es requerido"),
  newPassword: Yup.string()
    .min(
      MIN_PASSWORD_LENGTH,
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
    )
    .required("Contraseña es requerida"),
});

const getErrorMessage = (error) => {
  if (error.networkError) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }
  if (/already exist/i.test(error.message)) {
    return "El sistema ya tiene usuarios. Inicia sesión con una cuenta existente.";
  }
  if (/mobile|phone/i.test(error.message)) {
    return "El teléfono no es válido. Escríbelo con el código de país, por ejemplo +5352345678.";
  }
  return "No se pudo crear el usuario. Revisa los datos e inténtalo de nuevo.";
};

const UserCreateFirstForm = () => {
  const [created, setCreated] = useState(false);
  const navigate = useNavigate();
  const [createFirstUser, { loading, error }] = useMutation(CREATE_FIRST_USER);

  const formik = useFormik({
    initialValues: {
      name: "",
      lastName: "",
      email: "",
      mobile: "",
      newPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await createFirstUser({
          variables: {
            input: values,
          },
        });
        setCreated(true);
      } catch (err) {
        console.error("Error al crear el primer usuario:", err);
      }
    },
  });

  const fieldError = (name) => formik.touched[name] && formik.errors[name];

  if (created) {
    return (
      <AuthLayout
        title="Usuario creado"
        subtitle="La cuenta de administración está lista. Ya puedes iniciar sesión."
      >
        <Button
          label="Ir al inicio de sesión"
          className="w-full"
          onClick={() => navigate("/login")}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      wide
      title="Crear primer usuario"
      subtitle="Esta cuenta tendrá acceso total para configurar el sistema."
      footer={<Link to="/login">Volver al inicio de sesión</Link>}
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField
              label="Nombres"
              htmlFor="name"
              required
              error={fieldError("name")}
            >
              <InputText
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={Boolean(fieldError("name"))}
                autoFocus
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Apellidos" htmlFor="lastName">
              <InputText
                id="lastName"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField
              label="Correo electrónico"
              htmlFor="email"
              required
              error={fieldError("email")}
            >
              <InputText
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={Boolean(fieldError("email"))}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField
              label="Teléfono"
              htmlFor="mobile"
              required
              hint="Con código de país, por ejemplo +5352345678"
              error={fieldError("mobile")}
            >
              <InputText
                id="mobile"
                name="mobile"
                type="tel"
                value={formik.values.mobile}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={Boolean(fieldError("mobile"))}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Contraseña"
              htmlFor="newPassword"
              required
              hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
              error={fieldError("newPassword")}
            >
              <Password
                inputId="newPassword"
                name="newPassword"
                autoComplete="new-password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={Boolean(fieldError("newPassword"))}
                feedback={false}
                toggleMask
              />
            </FormField>
          </div>
        </div>

        {error && (
          <Message
            severity="error"
            text={getErrorMessage(error)}
            className="w-full mb-4"
          />
        )}

        <Button
          type="submit"
          label="Crear usuario"
          loading={loading}
          className="w-full"
          disabled={loading}
        />
      </form>
    </AuthLayout>
  );
};

export default UserCreateFirstForm;
