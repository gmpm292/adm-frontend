import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { useMutation } from "@apollo/client";
import { CHANGE_PASSWORD_BY_EMAIL } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { getErrorMessage } from "../../../utils/errors";
import { useRef } from "react";
import { Message } from "primereact/message";
import { FormField } from "../../../components/ui";

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
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mínimo 8 caracteres";
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
        detail: getErrorMessage(err),
        life: 3000,
      });
    }
  };

  const footer = (
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
        disabled={loading}
      />
      <Button
        label={loading ? "Cambiando..." : "Cambiar Contraseña"}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={loading}
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={`Cambiar Contraseña para ${userEmail}`}
        visible={visible}
        className="w-full md:w-30rem"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12">
            <FormField
              label="Nueva Contraseña"
              htmlFor="newPassword"
              error={errors.newPassword}
            >
              <Password
                inputId="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                toggleMask
                feedback={false}
                invalid={Boolean(errors.newPassword)}
              />
            </FormField>
          </div>

          <div className="col-12">
            <FormField
              label="Confirmar Contraseña"
              htmlFor="confirmPassword"
              error={errors.confirmPassword}
            >
              <Password
                inputId="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                toggleMask
                feedback={false}
                invalid={Boolean(errors.confirmPassword)}
              />
            </FormField>
          </div>

          {errors.general && (
            <div className="col-12">
              <Message
                severity="error"
                text={errors.general}
                className="w-full"
              />
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};
