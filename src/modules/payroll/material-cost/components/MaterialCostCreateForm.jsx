import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { useMutation } from "@apollo/client";
import { CREATE_MATERIAL_COST } from "../graphql/queries";
import { Toast } from "primereact/toast";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";

import { CurrencyDropdown } from "../../../payroll/currency/components/CurrencyDropdown";
import UnitOfMeasureDropdown from "../../../inventory/unit-of-measure/components/UnitOfMeasureDropdown";

export const MaterialCostCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitOfMeasureId: null,
    costPrice: 0,
    currency: null,
    isActive: true,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const toast = useRef(null);
  const [createMaterial] = useMutation(CREATE_MATERIAL_COST);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, costPrice: e.value }));
  };

  const handleUnitChange = (e) => {
    setFormData((prev) => ({ ...prev, unitOfMeasureId: e.value }));
  };

  const handleCurrencyChange = (e) => {
    setFormData((prev) => ({ ...prev, currency: e.value }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, isActive: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        throw new Error("El nombre es requerido");
      }
      if (!formData.unitOfMeasureId) {
        throw new Error("La unidad de medida es requerida");
      }
      if (!formData.currency) {
        throw new Error("La moneda es requerida");
      }
      if (formData.costPrice <= 0) {
        throw new Error("El precio debe ser mayor a 0");
      }

      await createMaterial({
        variables: {
          createMaterialCostInput: formData,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Material creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        name: "",
        description: "",
        unitOfMeasureId: null,
        costPrice: 0,
        currency: null,
        isActive: true,
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
        header="Crear Nuevo Material"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="name">Nombre del Material*</label>
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
            <label htmlFor="unitOfMeasureId">Unidad de Medida*</label>
            <UnitOfMeasureDropdown
              id="unitOfMeasureId"
              value={formData.unitOfMeasureId}
              onChange={handleUnitChange}
              placeholder="Seleccione una unidad"
              onlyActive={true}
            />
          </div>

          <div className="grid">
            <div className="col-8">
              <div className="field">
                <label htmlFor="costPrice">Precio de Costo*</label>
                <InputNumber
                  id="costPrice"
                  value={formData.costPrice}
                  onValueChange={handleNumberChange}
                  mode="decimal"
                  min={0}
                  minFractionDigits={2}
                  maxFractionDigits={4}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="col-4">
              <div className="field">
                <label htmlFor="currency">Moneda*</label>
                <CurrencyDropdown
                  id="currency"
                  value={formData.currency}
                  onChange={handleCurrencyChange}
                  placeholder="Moneda"
                  onlyActive={true}
                />
              </div>
            </div>
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
          />
        </div>
      </Dialog>
    </>
  );
};
