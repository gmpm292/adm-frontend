import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CHANGE_OWN_PASSWORD, GET_PROFILE } from "../graphql/queries";
import { useFormik } from "formik";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { FormField } from "../../../components/ui";
import { TwoFactorDialog } from "./TwoFactorDialog";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Traduce el error del backend a un mensaje entendible para el usuario
 */
const getChangePasswordErrorMessage = (error) => {
  if (error.networkError) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }
  if (/Current password incorrect/i.test(error.message)) {
    return "La contraseña actual no es correcta.";
  }
  return "No se pudo cambiar la contraseña. Inténtalo de nuevo.";
};

export function SecuritySettings({ showSuccess }) {
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery(GET_PROFILE);
  const [rejectedValues, setRejectedValues] = useState(null);
  const [changePassword, { loading, error }] =
    useMutation(CHANGE_OWN_PASSWORD);
  // null: cerrado · "enable" · "disable"
  const [twoFactorMode, setTwoFactorMode] = useState(null);

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.currentPassword) {
        errors.currentPassword = "Contraseña actual requerida";
      }

      if (!values.newPassword) {
        errors.newPassword = "Nueva contraseña requerida";
      } else if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
        errors.newPassword = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
      } else if (values.newPassword === values.currentPassword) {
        errors.newPassword = "La nueva contraseña debe ser distinta de la actual";
      }

      if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        await changePassword({
          variables: {
            input: {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            },
          },
        });
        formik.resetForm();
        showSuccess("Contraseña cambiada exitosamente");
      } catch (e) {
        console.error("Error changing password:", e);
        setRejectedValues(JSON.stringify(values));
      }
    },
  });

  // El error del servidor solo se muestra mientras los datos sigan siendo los
  // que se rechazaron; al corregir algo desaparece
  const showError = error && rejectedValues === JSON.stringify(formik.values);

  const fieldError = (name) => formik.touched[name] && formik.errors[name];

  if (profileLoading)
    return (
      <Card className="mb-4">
        <Skeleton width="100%" height="2rem" className="mb-2" />
        <Skeleton width="100%" height="4rem" className="mb-2" />
        <Skeleton width="100%" height="4rem" className="mb-2" />
      </Card>
    );

  if (profileError)
    return (
      <Card className="mb-4">
        <Message
          severity="error"
          text="Error cargando información de seguridad"
        />
      </Card>
    );

  const profile = profileData?.profile;
  const twoFactorActive =
    profile?.isTwoFactorEnabled && profile?.isTwoFactorConfigured;

  const handleTwoFactorDone = async (enabled) => {
    setTwoFactorMode(null);
    await refetchProfile();
    showSuccess(
      enabled
        ? "Verificación en dos pasos activada"
        : "Verificación en dos pasos desactivada"
    );
  };

  return (
    <div className="flex flex-column gap-4">
      <Card title="Autenticación">
        <div className="grid">
          <div className="col-12 md:col-6">
            <FormField label="Estado de la cuenta">
              <div>
                {profile?.enabled ? (
                  <Tag severity="success" value="Activa" />
                ) : (
                  <Tag severity="danger" value="Inactiva" />
                )}
              </div>
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField
              label="Verificación en dos pasos"
              hint="Además de la contraseña, pide un código de tu teléfono al iniciar sesión."
            >
              <div className="flex align-items-center gap-3">
                <Tag
                  severity={twoFactorActive ? "success" : "warning"}
                  value={twoFactorActive ? "Activada" : "Desactivada"}
                />
                <Button
                  label={twoFactorActive ? "Desactivar" : "Activar"}
                  icon={twoFactorActive ? "pi pi-lock-open" : "pi pi-shield"}
                  severity={twoFactorActive ? "secondary" : undefined}
                  size="small"
                  onClick={() =>
                    setTwoFactorMode(twoFactorActive ? "disable" : "enable")
                  }
                />
              </div>
            </FormField>
          </div>
        </div>
      </Card>

      <Card title="Cambiar contraseña">
        {showError && (
          <Message
            severity="error"
            text={getChangePasswordErrorMessage(error)}
            className="w-full mb-4"
          />
        )}

        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="grid">
            <div className="col-12 md:col-6">
              <FormField
                label="Contraseña actual"
                htmlFor="currentPassword"
                required
                error={fieldError("currentPassword")}
              >
                <Password
                  inputId="currentPassword"
                  name="currentPassword"
                  autoComplete="current-password"
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  toggleMask
                  invalid={Boolean(fieldError("currentPassword"))}
                  disabled={loading}
                  feedback={false}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6" />

            <div className="col-12 md:col-6">
              <FormField
                label="Nueva contraseña"
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
                  toggleMask
                  invalid={Boolean(fieldError("newPassword"))}
                  disabled={loading}
                  feedback={false}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField
                label="Confirmar contraseña"
                htmlFor="confirmPassword"
                required
                error={fieldError("confirmPassword")}
              >
                <Password
                  inputId="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  toggleMask
                  invalid={Boolean(fieldError("confirmPassword"))}
                  disabled={loading}
                  feedback={false}
                />
              </FormField>
            </div>

            <div className="col-12 flex justify-content-end">
              <Button
                type="submit"
                label="Cambiar contraseña"
                icon="pi pi-key"
                loading={loading}
                disabled={!formik.dirty || !formik.isValid || loading}
              />
            </div>
          </div>
        </form>
      </Card>

      <TwoFactorDialog
        mode={twoFactorMode ?? "enable"}
        visible={twoFactorMode !== null}
        onHide={() => setTwoFactorMode(null)}
        onDone={handleTwoFactorDone}
      />
    </div>
  );
}
