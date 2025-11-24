import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_SCOPED_ACCESS_BY_ID,
  UPDATE_SCOPED_ACCESS,
} from "../graphql/queries";
import { Toast } from "primereact/toast";

const ACCESS_LEVELS = [
  { label: "Negocio", value: "BUSINESS" },
  { label: "Oficina", value: "OFFICE" },
  { label: "Departamento", value: "DEPARTMENT" },
  { label: "Equipo", value: "TEAM" },
  { label: "General", value: "GENERAL" },
  { label: "Personal", value: "PERSONAL" },
  { label: "Relacionado", value: "RELATED" },
];

const ENTITY_STATUS = [
  { label: "Habilitado", value: "ENABLED" },
  { label: "Deshabilitado", value: "DISABLED" },
];

export const ScopedAccessEditForm = ({
  scopedAccessId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    accessLevels: [],
    entityStatus: "ENABLED",
  });
  const toast = useRef(null);
  const [updateScopedAccess] = useMutation(UPDATE_SCOPED_ACCESS);

  const { loading, error } = useQuery(GET_SCOPED_ACCESS_BY_ID, {
    variables: { id: scopedAccessId },
    skip: !scopedAccessId,
    onCompleted: (data) => {
      if (data?.scopedAccess) {
        setFormData({
          accessLevels: data.scopedAccess.accessLevels || [],
          entityStatus: data.scopedAccess.entityStatus || "ENABLED",
        });
      }
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.accessLevels || formData.accessLevels.length === 0) {
        throw new Error("Debe seleccionar al menos un nivel de acceso");
      }

      await updateScopedAccess({
        variables: {
          updateScopedAccessInput: {
            id: scopedAccessId,
            accessLevels: formData.accessLevels,
            entityStatus: formData.entityStatus,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Nivel de acceso actualizado correctamente",
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
        label="Guardar"
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
        header="Editar Niveles de Acceso"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar nivel de acceso</p>
        ) : (
          <div className="p-fluid">
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
        )}
      </Dialog>
    </>
  );
};
