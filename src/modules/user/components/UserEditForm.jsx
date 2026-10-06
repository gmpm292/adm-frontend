import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER_BY_ID, UPDATE_USER } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { FormField } from "../../../components/ui";

export const UserEditForm = ({ userId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    mobile: "",
    enabled: true,
  });
  const toast = useRef(null);
  const [updateUser] = useMutation(UPDATE_USER);

  const { loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.user) {
        setFormData({
          name: data.user.name || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          mobile: data.user.mobile || "",
          enabled: data.user.enabled,
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, enabled: e.value }));
  };

  const handleSubmit = async () => {
    try {
      // Trim all string fields before submission
      const trimmedData = {
        ...formData,
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
      };

      await updateUser({
        variables: {
          user: {
            id: userId,
            ...trimmedData,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario actualizado correctamente",
        life: 3000,
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
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Usuario"
        visible={visible}
        className="ui-dialog--wide"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p className="m-0 text-color-secondary">Cargando...</p>
        ) : error ? (
          <p className="m-0 text-color-secondary">Error al cargar usuario</p>
        ) : (
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField label="Nombres" htmlFor="name">
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full"
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Apellidos" htmlFor="lastName">
                <InputText
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full"
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Email" htmlFor="email">
                <InputText
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full"
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Teléfono" htmlFor="mobile">
                <InputText
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full"
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Estado" htmlFor="enabled">
                <div className="flex align-items-center gap-2">
                  <InputSwitch
                    inputId="enabled"
                    checked={formData.enabled}
                    onChange={handleStatusChange}
                  />
                  <span>{formData.enabled ? "Activo" : "Inactivo"}</span>
                </div>
              </FormField>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
