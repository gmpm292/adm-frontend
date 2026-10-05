import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_CONFIG, GET_CONFIG } from "../graphql/queries";
import { FormField } from "../../../components/ui";

const visibilityOptions = [
  { label: "Público", value: "PUBLIC" },
  { label: "Privado", value: "PRIVATE" },
];

const statusOptions = [
  { label: "Habilitado", value: "ENABLED" },
  { label: "Deshabilitado", value: "DISABLED" },
];

const categoryOptions = [
  { label: "General", value: "GENERAL" },
  { label: "Seguridad", value: "SECURITY" },
  { label: "Frontend", value: "FRONTEND" },
  { label: "Sistema", value: "SYSTEM" },
];

export const ConfigEditForm = ({ configId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: null,
    category: "GENERAL",
    group: "",
    description: "",
    values: {},
    configStatus: "ENABLED",
    configVisibility: "PUBLIC",
  });

  const [valueRows, setValueRows] = useState([]);
  const toast = useRef(null);
  const [updateConfig] = useMutation(UPDATE_CONFIG);

  const { loading, error, data } = useQuery(GET_CONFIG, {
    variables: { id: configId },
    skip: !configId,
  });

  useEffect(() => {
    if (data?.config) {
      const config = data.config;
      const values = config.values || {};
      
      setFormData({
        id: config.id,
        category: config.category,
        group: config.group,
        description: config.description,
        values: values,
        configStatus: config.configStatus,
        configVisibility: config.configVisibility,
      });

      // Convertir objeto a array para la tabla
      const rows = Object.entries(values).map(([key, value], index) => ({
        id: index, // Añadimos un id único para cada fila
        key,
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
      }));
      setValueRows(rows);
    }
  }, [data]);

  const handleValueChange = (rowId, newValue) => {
    const updatedRows = valueRows.map(row => {
      if (row.id === rowId) {
        return { ...row, value: newValue };
      }
      return row;
    });
    
    setValueRows(updatedRows);
    
    // Actualizar el objeto values en formData
    const updatedValues = {};
    updatedRows.forEach(row => {
      try {
        // Intentar parsear si es un objeto JSON
        updatedValues[row.key] = JSON.parse(row.value);
      } catch {
        // Si no es JSON válido, guardar como string
        updatedValues[row.key] = row.value;
      }
    });
    
    setFormData(prev => ({ ...prev, values: updatedValues }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e, field) => {
    setFormData((prev) => ({ ...prev, [field]: e.value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.group) {
        throw new Error("El grupo es un campo requerido");
      }

      await updateConfig({
        variables: {
          input: {
            id: formData.id,
            category: formData.category,
            group: formData.group,
            description: formData.description,
            values: formData.values,
            configStatus: formData.configStatus,
            configVisibility: formData.configVisibility,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Configuración actualizada correctamente",
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

  // Render de celda de clave (no editable)
  const keyTemplate = (rowData) => {
    return <span className="font-semibold">{rowData.key}</span>;
  };

  // Render de celda de valor (editable)
  const valueTemplate = (rowData) => {
    return (
      <InputText
        value={rowData.value}
        onChange={(e) => handleValueChange(rowData.id, e.target.value)}
        className="p-inputtext-sm w-full"
      />
    );
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar la configuración</div>;

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={`Editar Configuración - ${formData.group}`}
        visible={visible}
        className="w-full lg:w-8"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField label="Grupo" htmlFor="group" required>
              <InputText
                id="group"
                name="group"
                value={formData.group}
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
            <FormField label="Categoría" htmlFor="category" required>
              <Dropdown
                id="category"
                value={formData.category}
                options={categoryOptions}
                onChange={(e) => handleDropdownChange(e, "category")}
                optionLabel="label"
                placeholder="Seleccione categoría"
                required
              />
            </FormField>
          </div>

          <div className="col-12">
            <FormField label="Valores">
              <DataTable
                value={valueRows}
                emptyMessage="No hay valores configurados"
                className="p-datatable-sm"
                scrollable
                scrollHeight="28rem"
              >
                <Column
                  field="key"
                  header="Clave"
                  body={keyTemplate}
                  className="w-3"
                />
                <Column
                  field="value"
                  header="Valor"
                  body={valueTemplate}
                  className="w-9"
                />
              </DataTable>
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Visibilidad" htmlFor="configVisibility" required>
              <Dropdown
                id="configVisibility"
                value={formData.configVisibility}
                options={visibilityOptions}
                onChange={(e) => handleDropdownChange(e, "configVisibility")}
                optionLabel="label"
                placeholder="Seleccione visibilidad"
                required
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Estado" htmlFor="configStatus" required>
              <Dropdown
                id="configStatus"
                value={formData.configStatus}
                options={statusOptions}
                onChange={(e) => handleDropdownChange(e, "configStatus")}
                optionLabel="label"
                placeholder="Seleccione estado"
                required
              />
            </FormField>
          </div>
        </div>
      </Dialog>
    </>
  );
};