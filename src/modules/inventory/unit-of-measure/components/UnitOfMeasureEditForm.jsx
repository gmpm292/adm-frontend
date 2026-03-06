import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_UNIT_OF_MEASURE,
  UPDATE_UNIT_OF_MEASURE,
} from "../graphql/queries";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";

const categoryOptions = [
  { label: "Peso", value: "peso" },
  { label: "Volumen", value: "volumen" },
  { label: "Longitud", value: "longitud" },
  { label: "Área", value: "área" },
  { label: "Unidades", value: "unidades" },
  { label: "Tiempo", value: "tiempo" },
  { label: "Energía", value: "energía" },
  { label: "Potencia", value: "potencia" },
  { label: "Temperatura", value: "temperatura" },
];

export const UnitOfMeasureEditForm = ({
  unitId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    symbol: "",
    category: null,
    description: "",
    isActive: true,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const toast = useRef(null);
  const [updateUnit] = useMutation(UPDATE_UNIT_OF_MEASURE);

  const [getUnit, { loading }] = useLazyQuery(GET_UNIT_OF_MEASURE, {
    variables: { id: unitId },
    skip: !unitId || !visible,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.unitOfMeasure) {
        const unit = data.unitOfMeasure;
        setFormData({
          id: unit.id,
          name: unit.name,
          symbol: unit.symbol,
          category: unit.category,
          description: unit.description || "",
          isActive: unit.isActive,
          businessId: unit.business?.id || null,
          officeId: unit.office?.id || null,
          departmentId: unit.department?.id || null,
          teamId: unit.team?.id || null,
        });
      }
    },
    onError: () => {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al cargar la unidad de medida",
        life: 3000,
      });
    },
  });

  useEffect(() => {
    if (visible && unitId) {
      getUnit();
    }
  }, [visible, unitId, getUnit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e) => {
    setFormData((prev) => ({ ...prev, category: e.value }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, isActive: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.symbol) {
        throw new Error("Nombre y símbolo son campos requeridos");
      }

      await updateUnit({
        variables: {
          updateUnitOfMeasureInput: {
            id: formData.id,
            name: formData.name,
            symbol: formData.symbol,
            category: formData.category,
            description: formData.description,
            isActive: formData.isActive,
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
        detail: "Unidad de medida actualizada correctamente",
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
        header="Editar Unidad de Medida"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
        modal
      >
        {loading ? (
          <div className="flex justify-content-center p-4">
            <ProgressSpinner />
          </div>
        ) : (
          <div className="p-fluid">
            <div className="field">
              <label htmlFor="name">Nombre*</label>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="symbol">Símbolo*</label>
              <InputText
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="category">Categoría</label>
              <Dropdown
                id="category"
                value={formData.category}
                options={categoryOptions}
                onChange={handleDropdownChange}
                placeholder="Seleccione una categoría"
                showClear
              />
            </div>

            <div className="field">
              <label htmlFor="description">Descripción</label>
              <InputTextarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                autoResize
              />
            </div>

            <div className="field">
              <label htmlFor="isActive">Estado</label>
              <div className="flex align-items-center">
                <InputSwitch
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleStatusChange}
                />
                <span className="ml-2">
                  {formData.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
              initialValues={{
                businessId: formData.businessId,
                officeId: formData.officeId,
                departmentId: formData.departmentId,
                teamId: formData.teamId,
              }}
            />
          </div>
        )}
      </Dialog>
    </>
  );
};
