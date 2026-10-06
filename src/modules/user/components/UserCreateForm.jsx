import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../graphql/queries";
import { Toast } from "primereact/toast";
import SecurityEntitySelector from "../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { FormField } from "../../../components/ui";

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
    lastName: null,
    email: "",
    mobile: "",
    role: null,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const [showSecurityEntities, setShowSecurityEntities] = useState(false);
  const [entitiesToInclude, setEntitiesToInclude] = useState([]);
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
    const selectedRole = e.value;
    setFormData((prev) => ({ ...prev, role: selectedRole }));

    // Determinar qué entidades mostrar según el rol
    let entities = [];
    switch (selectedRole) {
      case "PRINCIPAL":
      case "USER":
        entities = ["BUSINESS"];
        break;
      case "ADMIN":
        entities = ["BUSINESS", "OFFICE"];
        break;
      case "MANAGER":
        entities = ["BUSINESS", "OFFICE", "DEPARTMENT"];
        break;
      case "SUPERVISOR":
      case "AGENT":
        entities = ["BUSINESS", "OFFICE", "DEPARTMENT", "TEAM"];
        break;
      case "SUPER":
      default:
        entities = [];
    }

    setEntitiesToInclude(entities);
    setShowSecurityEntities(entities.length > 0);
  };

  const handleSubmit = async () => {
    try {
      // Trim all string fields before validation and submission
      const trimmedData = {
        ...formData,
        name: formData.name.trim(),
        lastName: formData.lastName?.trim() || null,
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
      };

      if (!trimmedData.email || !trimmedData.name || !trimmedData.role) {
        throw new Error("Email, nombres y rol son campos requeridos");
      }

      await createUser({
        variables: {
          user: {
            email: trimmedData.email,
            name: trimmedData.name,
            lastName: trimmedData.lastName || null,
            mobile: trimmedData.mobile,
            role: [trimmedData.role],
            businessId: trimmedData.businessId,
            officeId: trimmedData.officeId,
            departmentId: trimmedData.departmentId,
            teamId: trimmedData.teamId,
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
        lastName: null,
        email: "",
        mobile: "",
        role: null,
        businessId: null,
        officeId: null,
        departmentId: null,
        teamId: null,
      });
      setShowSecurityEntities(false);
      setEntitiesToInclude([]);
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
        label="Crear"
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
        header="Crear Nuevo Usuario"
        visible={visible}
        className="ui-dialog--wide"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField label="Nombres" htmlFor="name" required>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
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
            <FormField label="Email" htmlFor="email" required>
              <InputText
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
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
            <FormField label="Rol" htmlFor="role" required>
              <Dropdown
                id="role"
                value={formData.role}
                options={roles}
                onChange={handleRoleChange}
                optionLabel="label"
                placeholder="Seleccione un rol"
                required
                className="w-full"
              />
            </FormField>
          </div>

          {showSecurityEntities && (
            <div className="col-12">
              <SecurityEntitySelector
                onSelectionChange={handleSecurityEntitiesChange}
                entitiesToInclude={entitiesToInclude}
              />
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};
