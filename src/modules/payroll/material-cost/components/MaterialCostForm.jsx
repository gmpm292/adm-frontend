import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { useHasRole } from "../../../../hooks/useHasRole";
import { GET_BUSINESS_OPTIONS } from "../../../company/shared/queries";
import UnitOfMeasureDropdown from "../../../inventory/unit-of-measure/components/UnitOfMeasureDropdown";
import { CurrencyDropdown } from "../../currency/components/CurrencyDropdown";
import {
  CREATE_MATERIAL_COST,
  UPDATE_MATERIAL_COST,
} from "../graphql/queries";

/**
 * Alta o edición de un material (con `material` edita). El SUPER elige la
 * empresa al crearlo; los demás lo crean en la suya.
 */
export function MaterialCostForm({ material, onHide, onSaved }) {
  const isEdit = !!material;
  const hasRole = useHasRole();
  const chooseBusiness = !isEdit && hasRole("SUPER");
  const [form, setForm] = useState({
    businessId: null,
    name: material?.name ?? "",
    description: material?.description ?? "",
    unitOfMeasureId: material?.unitOfMeasure?.id ?? null,
    costPrice: material?.costPrice ?? null,
    currency: material?.currency?.code ?? "CUP",
    isActive: material?.isActive ?? true,
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: businessData, loading: loadingBusinesses } = useQuery(
    GET_BUSINESS_OPTIONS,
    { skip: !chooseBusiness }
  );
  const [createMaterial, createState] = useMutation(CREATE_MATERIAL_COST);
  const [updateMaterial, updateState] = useMutation(UPDATE_MATERIAL_COST);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const errors = {
    businessId: chooseBusiness && !form.businessId ? "Elige la empresa" : null,
    name: form.name.trim() ? null : "Escribe un nombre",
    unitOfMeasureId: form.unitOfMeasureId ? null : "Elige la unidad",
    costPrice: form.costPrice >= 0 && form.costPrice !== null
      ? null
      : "Indica el costo",
    currency: form.currency ? null : "Elige la moneda",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    const values = {
      name: form.name.trim(),
      description: form.description.trim(),
      unitOfMeasureId: form.unitOfMeasureId,
      costPrice: form.costPrice,
      currency: form.currency,
      isActive: form.isActive,
    };
    try {
      if (isEdit) {
        const { data } = await updateMaterial({
          variables: {
            updateMaterialCostInput: { id: material.id, ...values },
          },
        });
        onSaved(data.updateMaterialCost, { created: false });
      } else {
        const { data } = await createMaterial({
          variables: {
            createMaterialCostInput: {
              ...values,
              ...(chooseBusiness && { businessId: form.businessId }),
            },
          },
        });
        onSaved(data.createMaterialCost, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar material" : "Nuevo material"}
      visible
      onHide={onHide}
      className="w-full md:w-30rem"
      closable={!saving}
      modal
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <Message
            severity="error"
            text={getErrorMessage(error)}
            className="w-full mb-3"
          />
        )}
        <div className="formgrid grid">
          {chooseBusiness && (
            <div className="col-12">
              <FormField
                label="Empresa"
                htmlFor="material-business"
                required
                error={shown("businessId")}
              >
                <Dropdown
                  inputId="material-business"
                  value={form.businessId}
                  options={businessData?.businesses?.data ?? []}
                  optionLabel="name"
                  optionValue="id"
                  onChange={(e) => set("businessId", e.value)}
                  placeholder="Elige la empresa"
                  emptyMessage="No hay empresas"
                  loading={loadingBusinesses}
                  invalid={!!shown("businessId")}
                />
              </FormField>
            </div>
          )}
          <div className="col-12">
            <FormField
              label="Nombre"
              htmlFor="material-name"
              required
              error={shown("name")}
            >
              <InputText
                id="material-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Por ejemplo: Oro 18k"
                maxLength={100}
                invalid={!!shown("name")}
                autoFocus
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Unidad"
              htmlFor="material-unit"
              required
              hint="El costo es por cada unidad"
              error={shown("unitOfMeasureId")}
            >
              <UnitOfMeasureDropdown
                inputId="material-unit"
                value={form.unitOfMeasureId}
                onChange={(e) => set("unitOfMeasureId", e.value)}
                placeholder="Elige la unidad"
                invalid={!!shown("unitOfMeasureId")}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-7">
            <FormField
              label="Costo"
              htmlFor="material-cost"
              required
              error={shown("costPrice")}
            >
              <InputNumber
                inputId="material-cost"
                value={form.costPrice}
                // onChange: onValueChange llega tarde si se guarda enseguida
                onChange={(e) => set("costPrice", e.value)}
                minFractionDigits={2}
                maxFractionDigits={2}
                min={0}
                invalid={!!shown("costPrice")}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-5">
            <FormField
              label="Moneda"
              htmlFor="material-currency"
              required
              error={shown("currency")}
            >
              <CurrencyDropdown
                inputId="material-currency"
                value={form.currency}
                onChange={(e) => set("currency", e.value)}
                filter={false}
                invalid={!!shown("currency")}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Descripción" htmlFor="material-description">
              <InputTextarea
                id="material-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                autoResize
                maxLength={500}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Activo"
              htmlFor="material-active"
              hint="Los inactivos no se ofrecen al dar de alta productos"
            >
              <InputSwitch
                inputId="material-active"
                checked={form.isActive}
                onChange={(e) => set("isActive", !!e.value)}
              />
            </FormField>
          </div>
        </div>
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            onClick={onHide}
            disabled={saving}
          />
          <Button
            type="submit"
            label={isEdit ? "Guardar cambios" : "Guardar material"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
