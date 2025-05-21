import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../graphql/queries";
import { Toast } from "primereact/toast";
import SecurityEntitySelector from "../../../components/SecurityEntitySelector/SecurityEntitySelector";


const roles = [
  { label: "Super", value: "SUPER" },
  { label: "Principal", value: "PRINCIPAL" },
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Agent", value: "AGENT" },
  { label: "User", value: "USER" },
];

export const UserCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    mobile: "",
    role: null,

    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });
  const toast = useRef(null);
  const [createUser] = useMutation(CREATE_USER);

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({
      ...prev,
      ...entities,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({ ...prev, role: e.value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.email || !formData.name || !formData.role) {
        throw new Error("Email, nombre y rol son campos requeridos");
      }

      await createUser({
        variables: {
          user: {
            email: formData.email,
            name: formData.name,
            lastName: formData.lastName,
            mobile: formData.mobile,
            role: [formData.role], // Enviar como array con un solo elemento
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        name: "",
        lastName: "",
        email: "",
        mobile: "",
        role: null,
      });
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
      />
      <Button
        label="Crear"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Nuevo Usuario"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">Nombre*</label>
            <InputText
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="lastName">Apellido</label>
            <InputText
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="p-field">
            <label htmlFor="email">Email*</label>
            <InputText
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="mobile">Teléfono</label>
            <InputText
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="p-field">
            <label htmlFor="role">Rol*</label>
            <Dropdown
              id="role"
              value={formData.role}
              options={roles}
              onChange={handleRoleChange}
              optionLabel="label"
              placeholder="Seleccione un rol"
              required
            />
          </div>

          <SecurityEntitySelector
            onSelectionChange={handleSecurityEntitiesChange}
          />
        </div>
      </Dialog>
    </>
  );
};
