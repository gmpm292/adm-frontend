import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CREATE_SCOPED_ACCESS } from "../graphql/queries";

import { Toast } from "primereact/toast";
import { GET_BUSINESSES } from "../../company/business/graphql/queries";
import { GET_ROLE_GUARDS } from "../../role-guard/graphql/queries";

// Niveles de acceso disponibles
const ACCESS_LEVELS = [
  { label: "Negocio", value: "BUSINESS" },
  { label: "Oficina", value: "OFFICE" },
  { label: "Departamento", value: "DEPARTMENT" },
  { label: "Equipo", value: "TEAM" },
  { label: "General", value: "GENERAL" },
  { label: "Personal", value: "PERSONAL" },
  { label: "Relacionado", value: "RELATED" },
];

// Estados de entidad
const ENTITY_STATUS = [
  { label: "Habilitado", value: "ENABLED" },
  { label: "Deshabilitado", value: "DISABLED" },
];

export const ScopedAccessCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    businessId: null,
    roleGuardId: null,
    accessLevels: [],
    entityStatus: "ENABLED",
  });
  const toast = useRef(null);
  const [createScopedAccess] = useMutation(CREATE_SCOPED_ACCESS);

  const [getBusinesses, { data: businessesData }] = useLazyQuery(
    GET_BUSINESSES,
    {
      variables: { options: { take: 100 } },
    }
  );

  const [getRoleGuards, { data: roleGuardsData }] = useLazyQuery(
    GET_ROLE_GUARDS,
    {
      variables: { options: { take: 1000 } },
    }
  );

  React.useEffect(() => {
    if (visible) {
      getBusinesses();
      getRoleGuards();
      setFormData({
        businessId: null,
        roleGuardId: null,
        accessLevels: [],
        entityStatus: "ENABLED",
      });
    }
  }, [visible, getBusinesses, getRoleGuards]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.businessId) {
        throw new Error("El negocio es requerido");
      }
      if (!formData.roleGuardId) {
        throw new Error("La operación es requerida");
      }
      if (!formData.accessLevels || formData.accessLevels.length === 0) {
        throw new Error("Debe seleccionar al menos un nivel de acceso");
      }

      await createScopedAccess({
        variables: {
          createScopedAccessInput: {
            businessId: parseInt(formData.businessId),
            roleGuardId: parseInt(formData.roleGuardId),
            accessLevels: formData.accessLevels,
            entityStatus: formData.entityStatus,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Nivel de acceso creado correctamente",
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

  const businesses = businessesData?.businesses?.data || [];
  const roleGuards = roleGuardsData?.roleGuards?.data || [];

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Nuevo Nivel de Acceso"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="businessId">Negocio *</label>
            <Dropdown
              id="businessId"
              value={formData.businessId}
              options={businesses}
              onChange={(e) => handleChange("businessId", e.value)}
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccione un negocio"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="roleGuardId">Operación *</label>
            <Dropdown
              id="roleGuardId"
              value={formData.roleGuardId}
              options={roleGuards}
              onChange={(e) => handleChange("roleGuardId", e.value)}
              optionLabel="queryOrEndPointURL"
              optionValue="id"
              placeholder="Seleccione una operación"
              className="w-full"
              filter
            />
          </div>

          <div className="p-field">
            <label htmlFor="accessLevels">Niveles de Acceso *</label>
            <MultiSelect
              id="accessLevels"
              value={formData.accessLevels}
              options={ACCESS_LEVELS}
              onChange={(e) => handleChange("accessLevels", e.value)}
              placeholder="Seleccione niveles de acceso"
              display="chip"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="entityStatus">Estado</label>
            <Dropdown
              id="entityStatus"
              value={formData.entityStatus}
              options={ENTITY_STATUS}
              onChange={(e) => handleChange("entityStatus", e.value)}
              placeholder="Seleccione estado"
              className="w-full"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
