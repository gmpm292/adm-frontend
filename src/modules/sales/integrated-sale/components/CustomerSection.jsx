import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { EntityTypes } from "../../../../components/SecurityEntitySelector/entityTypes";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";

export const CustomerSection = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    ci: "",
    email: "",
    phone: "",
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  // Cargar datos iniciales si existen
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        lastName: initialData.lastName || "",
        ci: initialData.ci || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        businessId: initialData.businessId,
        officeId: initialData.officeId,
        departmentId: initialData.departmentId,
        teamId: initialData.teamId,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({
      ...prev,
      businessId: entities.businessId,
      officeId: entities.officeId,
      departmentId: entities.departmentId,
      teamId: entities.teamId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Preparar datos para enviar - campos opcionales vacíos se envían como null
    const submitData = {
      name: formData.name,
      lastName: formData.lastName || null,
      ci: formData.ci || null,
      email: formData.email || null,
      phone: formData.phone || null,
      businessId: formData.businessId,
      officeId: formData.officeId || null,
      departmentId: formData.departmentId || null,
      teamId: formData.teamId || null,
    };

    onSubmit(submitData);
  };

  // Validar que tenga nombre y businessId (requeridos)
  const isFormValid = formData.name && formData.businessId;

  return (
    <>
      <div className="text-center mb-4">
        <h3 className="mt-0 mb-2 text-lg font-semibold text-900">
          Crear Nuevo Cliente
        </h3>
        <p className="m-0 text-color-secondary">
          Complete la información del nuevo cliente
        </p>
      </div>

      <Card>
        {initialData?.existingCustomer && (
          <Message
            severity="warn"
            className="w-full mb-3"
            text="Actualmente usando cliente existente. Los cambios crearán un nuevo cliente."
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="formgrid grid">
            {/* Selector de Entidades de Seguridad */}
            <div className="col-12">
              <FormField label="Empresa" htmlFor="securityEntities" required>
                <SecurityEntitySelector
                  onSelectionChange={handleSecurityEntitiesChange}
                  entitiesToInclude={[EntityTypes.BUSINESS]}
                  initialValues={{
                    businessId: formData.businessId,
                    officeId: formData.officeId,
                    departmentId: formData.departmentId,
                    teamId: formData.teamId,
                  }}
                  labels={{
                    business: "Empresa",
                    office: "Oficina",
                    department: "Departamento",
                    team: "Equipo",
                  }}
                />
              </FormField>
            </div>

            <div className="col-12">
              <Divider />
            </div>

            {/* Nombre y Apellido en misma línea */}
            <div className="col-12 md:col-6">
              <FormField label="Nombres" htmlFor="name" required>
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos"
                  required
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
                  placeholder="Ej: Pérez García"
                />
              </FormField>
            </div>

            <div className="col-12">
              <FormField label="Carnet de Identidad" htmlFor="ci">
                <InputText
                  id="ci"
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  placeholder="Ej: 12345678901"
                />
              </FormField>
            </div>

            <div className="col-12">
              <Divider />
            </div>

            {/* Contacto */}
            <div className="col-12 md:col-6">
              <FormField label="Correo Electrónico" htmlFor="email">
                <InputText
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cliente@ejemplo.com"
                  type="email"
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Teléfono Móvil" htmlFor="phone">
                <InputText
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej: +53 12345678"
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-content-end mt-3">
            <Button
              label="Crear Cliente y Continuar"
              icon="pi pi-user-plus"
              type="submit"
              disabled={!isFormValid}
            />
          </div>
        </form>
      </Card>
    </>
  );
};
