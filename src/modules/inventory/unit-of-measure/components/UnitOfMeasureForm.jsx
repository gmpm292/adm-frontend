import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { UNIT_CATEGORIES } from "../categories";
import {
  CREATE_UNIT_OF_MEASURE,
  UPDATE_UNIT_OF_MEASURE,
} from "../graphql/queries";

/** Alta o edición de una unidad de medida (con `unit` edita) */
export function UnitOfMeasureForm({ unit, onHide, onSaved }) {
  const isEdit = !!unit;
  const [form, setForm] = useState({
    name: unit?.name ?? "",
    symbol: unit?.symbol ?? "",
    category: unit?.category ?? null,
    description: unit?.description ?? "",
    isActive: unit?.isActive ?? true,
  });
  const [submitted, setSubmitted] = useState(false);

  const [createUnit, createState] = useMutation(CREATE_UNIT_OF_MEASURE);
  const [updateUnit, updateState] = useMutation(UPDATE_UNIT_OF_MEASURE);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const errors = {
    name: form.name.trim() ? null : "Escribe un nombre",
    symbol: form.symbol.trim() ? null : "Escribe el símbolo",
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
      symbol: form.symbol.trim(),
      // Vacío borra la categoría
      category: form.category ?? "",
      description: form.description.trim(),
      isActive: form.isActive,
    };
    try {
      if (isEdit) {
        const { data } = await updateUnit({
          variables: { updateUnitOfMeasureInput: { id: unit.id, ...values } },
        });
        onSaved(data.updateUnitOfMeasure, { created: false });
      } else {
        const { data } = await createUnit({
          variables: { createUnitOfMeasureInput: values },
        });
        onSaved(data.createUnitOfMeasure, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar unidad" : "Nueva unidad"}
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
          <div className="col-12 md:col-8">
            <FormField
              label="Nombre"
              htmlFor="unit-name"
              required
              error={shown("name")}
            >
              <InputText
                id="unit-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Por ejemplo: Kilogramo"
                invalid={!!shown("name")}
                maxLength={50}
                autoFocus
              />
            </FormField>
          </div>
          <div className="col-12 md:col-4">
            <FormField
              label="Símbolo"
              htmlFor="unit-symbol"
              required
              error={shown("symbol")}
            >
              <InputText
                id="unit-symbol"
                value={form.symbol}
                onChange={(e) => set("symbol", e.target.value)}
                placeholder="kg"
                invalid={!!shown("symbol")}
                maxLength={10}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Categoría" htmlFor="unit-category">
              <Dropdown
                inputId="unit-category"
                value={form.category}
                options={UNIT_CATEGORIES}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => set("category", e.value ?? null)}
                placeholder="Sin categoría"
                showClear
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Descripción" htmlFor="unit-description">
              <InputTextarea
                id="unit-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                autoResize
                maxLength={255}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Activa"
              htmlFor="unit-active"
              hint="Las inactivas no se ofrecen al dar de alta productos"
            >
              <InputSwitch
                inputId="unit-active"
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
            label={isEdit ? "Guardar cambios" : "Guardar unidad"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
