import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useMutation } from "@apollo/client";
import { CREATE_CATEGORY } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { FormField } from "../../../../components/ui";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";

export const CategoryCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });
  const toast = useRef(null);
  const [createCategory] = useMutation(CREATE_CATEGORY);

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

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        throw new Error("El nombre es requerido");
      }

      await createCategory({
        variables: {
          category: {
            name: formData.name,
            description: formData.description,
            businessId: formData.businessId,
            officeId: formData.officeId,
            departmentId: formData.departmentId,
            teamId: formData.teamId,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Categoría creada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        name: "",
        description: "",
        businessId: null,
        officeId: null,
        departmentId: null,
        teamId: null,
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
        header="Crear Nueva Categoría"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid p-fluid">
          <div className="col-12 md:col-6">
            <FormField label="Nombre" htmlFor="name" required>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Descripción" htmlFor="description">
              <InputText
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="col-12">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
