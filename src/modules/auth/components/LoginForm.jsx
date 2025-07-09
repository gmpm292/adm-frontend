import { useLazyQuery } from "@apollo/client";
import { CLASSIC_LOGIN } from "../graphql/queries";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
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
          login(profile);
          navigate("/statistics/analytics");
        }
      } catch (err) {
        console.error("Error en login:", err);
      }
    },
  });

  return (
    <Card className="login-card" style={{ border: "none", boxShadow: "none" }}>
      <form onSubmit={formik.handleSubmit} className="p-fluid">
        <div className="field">
          <span className="p-float-label">
            <InputText
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`p-inputtext-lg ${
                formik.touched.email && formik.errors.email ? "p-invalid" : ""
              }`}
              style={{ width: "100%" }}
            />
            <label htmlFor="email">Email</label>
          </span>
          {formik.touched.email && formik.errors.email && (
            <small className="p-error">{formik.errors.email}</small>
          )}
        </div>

        <div className="field">
          <span className="p-float-label">
            <Password
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              toggleMask
              className={`p-inputtext-lg ${
                formik.touched.password && formik.errors.password
                  ? "p-invalid"
                  : ""
              }`}
              feedback={false}
              style={{ width: "100%" }}
            />
            <label htmlFor="password">Password</label>
          </span>
          {formik.touched.password && formik.errors.password && (
            <small className="p-error">{formik.errors.password}</small>
          )}
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
          disabled={!formik.isValid || loading}
        />
      </form>
    </Card>
  );
}
