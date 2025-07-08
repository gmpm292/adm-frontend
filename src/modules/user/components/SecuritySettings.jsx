import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CHANGE_PASSWORD_BY_EMAIL, GET_PROFILE } from "../graphql/queries";
import { useFormik } from "formik";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { classNames } from "primereact/utils";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";

export function SecuritySettings({ showSuccess }) {
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
  } = useQuery(GET_PROFILE);
  const [changePassword, { loading, error }] = useMutation(
    CHANGE_PASSWORD_BY_EMAIL
  );

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.newPassword) {
        errors.newPassword = "Nueva contraseña requerida";
      } else if (values.newPassword.length < 4) {
        errors.newPassword = "Mínimo 4 caracteres";
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
              email: profileData?.profile?.email,
              newPassword: values.newPassword,
            },
          },
        });
        formik.resetForm();
        showSuccess("Contraseña cambiada exitosamente");
      } catch (e) {
        console.error("Error changing password:", e);
      }
    },
  });

  const isFormFieldValid = (field) =>
    !!(formik.touched[field] && formik.errors[field]);
  const getFormErrorMessage = (field) => {
    return (
      isFormFieldValid(field) && (
        <small className="p-error">{formik.errors[field]}</small>
      )
    );
  };

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

  return (
    <div className="security-container">
      {/* Sección de Autenticación */}
      <Card className="mb-4">
        <h4>Autenticación</h4>
        <Divider />
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field mb-4">
              <label>Estado de la Cuenta</label>
              <div className="p-inputtext">
                {profileData?.profile?.enabled ? (
                  <Tag severity="success" value="Activa" />
                ) : (
                  <Tag severity="danger" value="Inactiva" />
                )}
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field mb-4">
              <label>Autenticación de Dos Factores</label>
              <div className="flex align-items-center gap-2">
                {profileData?.profile?.isTwoFactorConfigured ? (
                  <Badge
                    value={
                      profileData.profile.isTwoFactorEnabled
                        ? "Activado"
                        : "Desactivado"
                    }
                    severity={
                      profileData.profile.isTwoFactorEnabled
                        ? "success"
                        : "warning"
                    }
                  />
                ) : (
                  <Tag severity="danger" value="No configurado" />
                )}
                <Button
                  icon="pi pi-cog"
                  className="p-button-text p-button-sm"
                  tooltip="Configurar 2FA"
                  tooltipOptions={{ position: "top" }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Sección de Cambio de Contraseña */}
      <Card>
        <h4>Cambiar Contraseña</h4>
        <Divider />
        {error && (
          <Message
            severity="error"
            text="Error al cambiar contraseña"
            className="mb-3"
          />
        )}

        <form onSubmit={formik.handleSubmit}>
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field mb-4">
                <label htmlFor="newPassword">Nueva Contraseña*</label>
                <Password
                  id="newPassword"
                  name="newPassword"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  toggleMask
                  className={classNames({
                    "p-invalid": isFormFieldValid("newPassword"),
                  })}
                  disabled={loading}
                  feedback={false}
                />
                {getFormErrorMessage("newPassword")}
                <small className="text-color-secondary">
                  Mínimo 4 caracteres
                </small>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field mb-4">
                <label htmlFor="confirmPassword">Confirmar Contraseña*</label>
                <Password
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  toggleMask
                  className={classNames({
                    "p-invalid": isFormFieldValid("confirmPassword"),
                  })}
                  disabled={loading}
                  feedback={false}
                />
                {getFormErrorMessage("confirmPassword")}
              </div>
            </div>

            <div className="col-12">
              <div className="flex justify-content-end mt-3">
                <Button
                  type="submit"
                  label="Cambiar Contraseña"
                  icon="pi pi-key"
                  className="p-button-warning"
                  loading={loading}
                  disabled={!formik.dirty || !formik.isValid || loading}
                />
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
