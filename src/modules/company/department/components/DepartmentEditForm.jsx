import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useQuery } from "@apollo/client";
import { Toast } from "primereact/toast";
import { useRef } from "react";

import { GET_DEPARTMENT_BY_ID, UPDATE_DEPARTMENT } from "../graphql/queries";
import { FormField } from "../../../../components/ui";

const departmentTypes = [
  { label: "Económico", value: "ECONOMIC" },
  { label: "Ventas", value: "SALES" },
  { label: "Administración", value: "ADMINISTRATION" }
];

export const DepartmentEditForm = ({ departmentId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    departmentType: null,
    name: "",
    description: "",
    address: "",
  });
  const toast = useRef(null);
  const [updateDepartment] = useMutation(UPDATE_DEPARTMENT);

  const { loading, error } = useQuery(GET_DEPARTMENT_BY_ID, {
    variables: { id: departmentId },
    skip: !departmentId,
    onCompleted: (data) => {
      if (data?.department) {
        setFormData({
          departmentType: data.department.departmentType,
          name: data.department.name || "",
          description: data.department.description || "",
          address: data.department.address || "",
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, departmentType: e.value }));
  };

  const handleSubmit = async () => {
    try {
      await updateDepartment({
        variables: {
          department: {
            id: departmentId,
            ...formData,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Departamento actualizado correctamente",
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
        header="Editar Departamento"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar departamento</p>
        ) : (
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField label="Tipo" htmlFor="departmentType" required>
                <Dropdown
                  id="departmentType"
                  value={formData.departmentType}
                  options={departmentTypes}
                  onChange={handleDepartmentTypeChange}
                  optionLabel="label"
                  placeholder="Seleccione tipo"
                  required
                />
              </FormField>
            </div>

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

            <div className="col-12 md:col-6">
              <FormField label="Dirección" htmlFor="address">
                <InputText
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};