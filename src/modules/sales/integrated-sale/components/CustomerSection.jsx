import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { EntityTypes } from "../../../../components/SecurityEntitySelector/entityTypes";

export const CustomerSection = ({ initialData, onSubmit, onStepChange }) => {
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
    <div className="customer-section">
      <div className="section-header">
        <h3>Crear Nuevo Cliente</h3>
        <p>Complete la información del nuevo cliente</p>
      </div>

      <Card>
        {initialData?.existingCustomer && (
          <div className="p-message p-message-warning mb-3">
            <div className="p-message-wrapper">
              <span className="p-message-icon pi pi-info-circle"></span>
              <div className="p-message-content">
                <p>
                  Actualmente usando cliente existente. Los cambios crearán un
                  nuevo cliente.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="p-grid">
            {/* Selector de Entidades de Seguridad */}
            <div className="p-col-12">
              <div className="p-field">
                <label htmlFor="securityEntities">Empresa *</label>
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
              </div>
            </div>

            <div className="p-col-12">
              <Divider />
            </div>

            {/* Nombre y Apellido en misma línea */}
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="name">Nombres *</label>
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>
            </div>

            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="lastName">Apellidos</label>
                <InputText
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ej: Pérez García"
                />
              </div>
            </div>

            {/* CI al lado derecho */}
            <div className="p-col-12">
              <div className="p-field">
                <label htmlFor="ci">Carnet de Identidad</label>
                <InputText
                  id="ci"
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  placeholder="Ej: 12345678901"
                />
              </div>
            </div>

            <div className="p-col-12">
              <Divider />
            </div>

            {/* Contacto */}
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="email">Correo Electrónico</label>
                <InputText
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cliente@ejemplo.com"
                  type="email"
                />
              </div>
            </div>

            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="phone">Teléfono Móvil</label>
                <InputText
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej: +53 12345678"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button
              label="Crear Cliente y Continuar"
              icon="pi pi-user-plus"
              type="submit"
              disabled={!isFormValid}
              className="p-button-primary"
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
