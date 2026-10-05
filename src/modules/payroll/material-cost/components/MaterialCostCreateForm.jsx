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
import { FormField } from "../../../../components/ui";
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
        header="Crear Nuevo Material"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
        modal
      >
        <div className="formgrid grid">
          <div className="col-12">
            <FormField label="Nombre del Material" htmlFor="name" required>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </FormField>
          </div>

          <div className="col-12">
            <FormField label="Descripción" htmlFor="description">
              <InputTextarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                autoResize
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Unidad de Medida" htmlFor="unitOfMeasureId" required>
              <UnitOfMeasureDropdown
                id="unitOfMeasureId"
                value={formData.unitOfMeasureId}
                onChange={handleUnitChange}
                placeholder="Seleccione una unidad"
                onlyActive={true}
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Estado" htmlFor="isActive">
              <div className="flex align-items-center gap-2">
                <InputSwitch
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleStatusChange}
                />
                <span>
                  {formData.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Precio de Costo" htmlFor="costPrice" required>
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
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Moneda" htmlFor="currency" required>
              <CurrencyDropdown
                id="currency"
                value={formData.currency}
                onChange={handleCurrencyChange}
                placeholder="Moneda"
                onlyActive={true}
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
