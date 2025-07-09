import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { useMutation } from "@apollo/client";
import { CHANGE_PASSWORD_BY_EMAIL } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { Message } from "primereact/message";

export const UserChangePasswordForm = ({
  userEmail,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_BY_EMAIL);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida";
    } else if (formData.newPassword.length < 4) {
      newErrors.newPassword = "Mínimo 4 caracteres";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await changePassword({
        variables: {
          input: {
            email: userEmail,
            newPassword: formData.newPassword,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Contraseña cambiada correctamente",
        life: 3000,
      });

      setFormData({
        newPassword: "",
        confirmPassword: "",
      });

      onSuccess();
      onHide();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    }
  };

  const footer = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label={loading ? "Cambiando..." : "Cambiar Contraseña"}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={`Cambiar Contraseña para ${userEmail}`}
        visible={visible}
        style={{ width: "40vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <Password
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              toggleMask
              feedback={false}
              className={errors.newPassword ? "p-invalid" : ""}
            />
            {errors.newPassword && (
              <small className="p-error">{errors.newPassword}</small>
            )}
          </div>

          <div className="p-field">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <Password
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              toggleMask
              feedback={false}
              className={errors.confirmPassword ? "p-invalid" : ""}
            />
            {errors.confirmPassword && (
              <small className="p-error">{errors.confirmPassword}</small>
            )}
          </div>

          {errors.general && (
            <Message severity="error" text={errors.general} className="mt-3" />
          )}
        </div>
      </Dialog>
    </>
  );
};
