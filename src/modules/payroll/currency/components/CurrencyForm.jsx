import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { CREATE_CURRENCY, UPDATE_CURRENCY } from "../graphql/queries";

// Moneda de referencia: su tasa es 1 y no se desactiva
const BASE_CURRENCY = "CUP";

/**
 * Alta o edición de una moneda (con `currency` edita). El código no cambia
 * después: productos y pagos lo guardan.
 */
export function CurrencyForm({ currency, onHide, onSaved }) {
  const isEdit = !!currency;
  const isBase = currency?.code === BASE_CURRENCY;
  const [form, setForm] = useState({
    code: currency?.code ?? "",
    name: currency?.name ?? "",
    symbol: currency?.symbol ?? "",
    exchangeRateToCUP: currency?.exchangeRateToCUP ?? null,
    isActive: currency?.isActive ?? true,
  });
  const [submitted, setSubmitted] = useState(false);

  const [createCurrency, createState] = useMutation(CREATE_CURRENCY);
  const [updateCurrency, updateState] = useMutation(UPDATE_CURRENCY);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const code = form.code.trim().toUpperCase();
  const errors = {
    code: /^[A-Z]{3}$/.test(code) ? null : "Tres letras, como USD",
    name: form.name.trim() ? null : "Escribe el nombre",
    symbol: form.symbol.trim() ? null : "Escribe el símbolo",
    exchangeRateToCUP:
      form.exchangeRateToCUP > 0 ? null : "Indica cuántos CUP vale",
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
      exchangeRateToCUP: form.exchangeRateToCUP,
      isActive: form.isActive,
    };
    try {
      if (isEdit) {
        const { data } = await updateCurrency({
          variables: { updateCurrencyInput: { id: currency.id, ...values } },
        });
        onSaved(data.updateCurrency, { created: false });
      } else {
        const { data } = await createCurrency({
          variables: { createCurrencyInput: { code, ...values } },
        });
        onSaved(data.createCurrency, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? `Editar ${currency.code}` : "Nueva moneda"}
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
          <div className="col-12 md:col-4">
            <FormField
              label="Código"
              htmlFor="currency-code"
              required
              hint={isEdit ? "No se cambia" : undefined}
              error={shown("code")}
            >
              <InputText
                id="currency-code"
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
                disabled={isEdit}
                invalid={!!shown("code")}
                autoFocus={!isEdit}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-8">
            <FormField
              label="Nombre"
              htmlFor="currency-name"
              required
              error={shown("name")}
            >
              <InputText
                id="currency-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Dólar estadounidense"
                maxLength={50}
                invalid={!!shown("name")}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-4">
            <FormField
              label="Símbolo"
              htmlFor="currency-symbol"
              required
              error={shown("symbol")}
            >
              <InputText
                id="currency-symbol"
                value={form.symbol}
                onChange={(e) => set("symbol", e.target.value)}
                placeholder="US$"
                maxLength={10}
                invalid={!!shown("symbol")}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-8">
            <FormField
              label="Tasa"
              htmlFor="currency-rate"
              required
              hint={
                isBase
                  ? "Moneda de referencia: siempre 1"
                  : `Cuántos CUP vale 1 ${code || "unidad"}`
              }
              error={shown("exchangeRateToCUP")}
            >
              <InputNumber
                inputId="currency-rate"
                value={form.exchangeRateToCUP}
                // onChange: onValueChange llega tarde si se guarda enseguida
                onChange={(e) => set("exchangeRateToCUP", e.value)}
                minFractionDigits={0}
                maxFractionDigits={6}
                min={0}
                max={9999.999999}
                suffix=" CUP"
                disabled={isBase}
                invalid={!!shown("exchangeRateToCUP")}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Activa"
              htmlFor="currency-active"
              hint={
                isBase
                  ? "La moneda de referencia no se desactiva"
                  : "No se puede desactivar mientras la acepten productos"
              }
            >
              <InputSwitch
                inputId="currency-active"
                checked={form.isActive}
                onChange={(e) => set("isActive", !!e.value)}
                disabled={isBase}
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
            label={isEdit ? "Guardar cambios" : "Guardar moneda"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
