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
import { SelectButton } from "primereact/selectbutton";
import { FormField, FormSection } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import {
  CREATE_PAYMENT_RULE,
  GET_RULE_FORM_OPTIONS,
  UPDATE_PAYMENT_RULE,
} from "../graphql/queries";
import {
  PAYMENT_TYPE,
  PAYMENT_TYPE_OPTIONS,
  SALE_PAYMENT_TYPES,
  SCOPE_FIXED,
  SCOPE_SHARED,
  WORKER_TYPE_OPTIONS,
  optionsOf,
} from "../../format";

// Quien cobra la comisión de una venta concreta, sin repartir
const SALE_ROLE_TYPES = ["AGENT", "PUBLICIST"];

const MONEY = { minFractionDigits: 2, maxFractionDigits: 2, locale: "es-ES" };

/** Copia campo a campo: lo que llega de Apollo trae `__typename` */
const toForm = (rule) => ({
  name: rule?.name ?? "",
  description: rule?.description ?? "",
  paymentType: rule?.paymentType ?? "PERCENTAGE",
  workerType: rule?.workerType ?? "AGENT",
  otherType: rule?.otherType ?? "",
  paymentCurrency: rule?.paymentCurrency ?? null,
  scope: rule?.scope ?? "BUSINESS",
  distributeProfits: rule?.distributeProfits ?? false,
  isActive: rule?.isActive ?? true,
  productId: rule?.product?.id ?? null,
  categoryId: rule?.category?.id ?? null,
  fixedAmount: rule?.conditions?.fixedAmount?.amount ?? null,
  percentage: rule?.conditions?.percentage?.percentage ?? null,
  priceRanges: (rule?.conditions?.priceRanges ?? []).map((r) => ({
    min: r.min,
    max: r.max ?? null,
    kind: r.percentage != null ? "percentage" : "amount",
    value: r.percentage ?? r.amount ?? null,
  })),
  saleQuantity: (rule?.conditions?.saleQuantity ?? []).map((q) => ({
    minProducts: q.minProducts,
    kind: q.percentagePerProduct != null ? "percentage" : "amount",
    value: q.percentagePerProduct ?? q.ratePerProduct ?? null,
  })),
});

const KIND_OPTIONS = (currency) => [
  { label: currency ?? "Importe", value: "amount" },
  { label: "%", value: "percentage" },
];

/** Alta o edición de una regla de pago (con `rule` edita) */
export function PaymentRuleForm({ rule, onHide, onSaved }) {
  const isEdit = !!rule;
  const [form, setForm] = useState(() => toForm(rule));
  const [submitted, setSubmitted] = useState(false);

  const { data: options, loading: loadingOptions } = useQuery(
    GET_RULE_FORM_OPTIONS,
    { errorPolicy: "all" },
  );
  const [createRule, createState] = useMutation(CREATE_PAYMENT_RULE);
  const [updateRule, updateState] = useMutation(UPDATE_PAYMENT_RULE);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const currencies = (options?.currencies?.data ?? [])
    .filter((c) => c.isActive || c.code === form.paymentCurrency)
    .map((c) => ({ label: `${c.code} · ${c.name}`, value: c.code }));
  const isSaleType = SALE_PAYMENT_TYPES.includes(form.paymentType);
  const canChooseSharing =
    isSaleType && SALE_ROLE_TYPES.includes(form.workerType);
  const shared = isSaleType && (form.distributeProfits || !canChooseSharing);
  const scopeLabels = isSaleType ? SCOPE_SHARED : SCOPE_FIXED;

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  const updateRow = (field, index, changes) =>
    setForm((current) => ({
      ...current,
      [field]: current[field].map((row, i) =>
        i === index ? { ...row, ...changes } : row,
      ),
    }));
  const removeRow = (field, index) =>
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, i) => i !== index),
    }));
  const addRow = (field, row) =>
    setForm((current) => ({ ...current, [field]: [...current[field], row] }));

  const positive = (value) => value != null && value > 0;
  const percent = (value) => positive(value) && value <= 100;
  const conditionError = (() => {
    switch (form.paymentType) {
      case "FIXED_AMOUNT":
        return positive(form.fixedAmount) ? null : "Escribe el importe";
      case "PERCENTAGE":
        return percent(form.percentage) ? null : "Un porcentaje de 0 a 100";
      case "PRICE_RANGE":
        if (!form.priceRanges.length) return "Añade al menos un tramo";
        return form.priceRanges.every(
          (r) =>
            r.min != null &&
            (r.max == null || r.max > r.min) &&
            (r.kind === "percentage" ? percent(r.value) : positive(r.value)),
        )
          ? null
          : "Completa cada tramo: desde, hasta (mayor) y cuánto paga";
      case "SALE_QUANTITY":
        if (!form.saleQuantity.length) return "Añade al menos un escalón";
        return form.saleQuantity.every(
          (q) =>
            q.minProducts >= 1 &&
            (q.kind === "percentage" ? percent(q.value) : positive(q.value)),
        )
          ? null
          : "Completa cada escalón: desde cuántas unidades y cuánto paga";
      default:
        return null;
    }
  })();
  const errors = {
    name: form.name.trim() ? null : "Escribe un nombre",
    paymentCurrency: form.paymentCurrency ? null : "Elige la moneda",
    conditions: conditionError,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const conditions = () => {
    switch (form.paymentType) {
      case "FIXED_AMOUNT":
        return { fixedAmount: { amount: form.fixedAmount } };
      case "PERCENTAGE":
        return { percentage: { percentage: form.percentage } };
      case "PRICE_RANGE":
        return {
          priceRanges: form.priceRanges.map((r) => ({
            min: r.min,
            max: r.max ?? null,
            currency: form.paymentCurrency,
            ...(r.kind === "percentage"
              ? { percentage: r.value }
              : { amount: r.value }),
          })),
        };
      default:
        return {
          saleQuantity: form.saleQuantity.map((q) => ({
            minProducts: q.minProducts,
            ...(q.kind === "percentage"
              ? { percentagePerProduct: q.value }
              : { ratePerProduct: q.value }),
          })),
        };
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    const values = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      paymentType: form.paymentType,
      workerType: form.workerType,
      otherType: form.workerType === "OTHER" ? form.otherType.trim() || null : null,
      paymentCurrency: form.paymentCurrency,
      scope: form.scope,
      distributeProfits: canChooseSharing ? form.distributeProfits : isSaleType,
      isActive: form.isActive,
      productId: isSaleType ? form.productId : null,
      categoryId: isSaleType ? form.categoryId : null,
      conditions: conditions(),
    };
    try {
      if (isEdit) {
        const { data } = await updateRule({
          variables: { rule: { id: rule.id, ...values } },
        });
        onSaved(data.updatePaymentRule, { created: false });
      } else {
        const { data } = await createRule({ variables: { rule: values } });
        onSaved(data.createPaymentRule, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  const kindToggle = (field, index, row) => (
    <SelectButton
      value={row.kind}
      options={KIND_OPTIONS(form.paymentCurrency)}
      onChange={(e) => e.value && updateRow(field, index, { kind: e.value })}
      allowEmpty={false}
      aria-label="Importe o porcentaje"
    />
  );

  return (
    <Dialog
      header={isEdit ? "Editar regla de pago" : "Nueva regla de pago"}
      visible
      onHide={onHide}
      className="ui-dialog--wide"
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

        <FormSection title="La regla">
          <div className="formgrid grid">
            <div className="col-12 md:col-8">
              <FormField
                label="Nombre"
                htmlFor="rule-name"
                required
                error={shown("name")}
              >
                <InputText
                  id="rule-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Por ejemplo: Comisión de vendedores"
                  invalid={!!shown("name")}
                  maxLength={100}
                  autoFocus
                />
              </FormField>
            </div>
            <div className="col-12 md:col-4">
              <FormField label="Activa" htmlFor="rule-active">
                <span className="flex align-items-center gap-2">
                  <InputSwitch
                    inputId="rule-active"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.value)}
                  />
                  {form.isActive ? "Se aplica" : "No se aplica"}
                </span>
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Cómo se paga"
                htmlFor="rule-type"
                required
                hint={PAYMENT_TYPE[form.paymentType]?.hint}
              >
                <Dropdown
                  inputId="rule-type"
                  value={form.paymentType}
                  options={PAYMENT_TYPE_OPTIONS}
                  onChange={(e) => set("paymentType", e.value)}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Moneda"
                htmlFor="rule-currency"
                required
                hint="En la que se paga y se miden los precios"
                error={shown("paymentCurrency")}
              >
                <Dropdown
                  inputId="rule-currency"
                  value={form.paymentCurrency}
                  options={currencies}
                  onChange={(e) => set("paymentCurrency", e.value)}
                  placeholder="Elige la moneda"
                  loading={loadingOptions}
                  invalid={!!shown("paymentCurrency")}
                />
              </FormField>
            </div>
            <div className="col-12">
              <FormField label="Descripción" htmlFor="rule-description">
                <InputTextarea
                  id="rule-description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  autoResize
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormSection title="Quién cobra">
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField
                label="Tipo de trabajador"
                htmlFor="rule-worker-type"
                required
              >
                <Dropdown
                  inputId="rule-worker-type"
                  value={form.workerType}
                  options={WORKER_TYPE_OPTIONS}
                  onChange={(e) => set("workerType", e.value)}
                />
              </FormField>
            </div>
            {form.workerType === "OTHER" && (
              <div className="col-12 md:col-6">
                <FormField
                  label="¿Cuál?"
                  htmlFor="rule-other-type"
                  hint="Igual que en la ficha del trabajador"
                >
                  <InputText
                    id="rule-other-type"
                    value={form.otherType}
                    onChange={(e) => set("otherType", e.target.value)}
                  />
                </FormField>
              </div>
            )}
            {canChooseSharing && (
              <div className="col-12">
                <FormField label="De cada venta cobra" htmlFor="rule-sharing">
                  <SelectButton
                    id="rule-sharing"
                    value={form.distributeProfits}
                    options={[
                      {
                        label:
                          form.workerType === "AGENT"
                            ? "Quien la vendió"
                            : "Sus publicistas",
                        value: false,
                      },
                      { label: "Se reparte entre todos", value: true },
                    ]}
                    onChange={(e) =>
                      e.value !== null && set("distributeProfits", e.value)
                    }
                    allowEmpty={false}
                  />
                </FormField>
              </div>
            )}
            {(!isSaleType || shared) && (
              <div className="col-12 md:col-6">
                <FormField
                  label={isSaleType ? "Se reparte" : "Se paga"}
                  htmlFor="rule-scope"
                  hint={
                    isSaleType
                      ? "Solo entre quienes vinieron ese día (asistencia «Presente» o «Llegó tarde»)"
                      : undefined
                  }
                >
                  <Dropdown
                    inputId="rule-scope"
                    value={form.scope}
                    options={optionsOf(scopeLabels)}
                    onChange={(e) => set("scope", e.value)}
                  />
                </FormField>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Cuánto"
          hint={
            isSaleType
              ? "Solo cuentan las líneas vendidas: las devueltas o canceladas no generan pago."
              : undefined
          }
        >
          {form.paymentType === "FIXED_AMOUNT" && (
            <div className="formgrid grid">
              <div className="col-12 md:col-6">
                <FormField
                  label="Importe por período"
                  htmlFor="rule-fixed"
                  required
                  error={shown("conditions")}
                >
                  <InputNumber
                    inputId="rule-fixed"
                    value={form.fixedAmount}
                    onChange={(e) => set("fixedAmount", e.value)}
                    min={0}
                    suffix={form.paymentCurrency ? ` ${form.paymentCurrency}` : undefined}
                    invalid={!!shown("conditions")}
                    {...MONEY}
                  />
                </FormField>
              </div>
            </div>
          )}

          {form.paymentType === "PERCENTAGE" && (
            <div className="formgrid grid">
              <div className="col-12 md:col-6">
                <FormField
                  label="Porcentaje de cada venta"
                  htmlFor="rule-percentage"
                  required
                  error={shown("conditions")}
                >
                  <InputNumber
                    inputId="rule-percentage"
                    value={form.percentage}
                    onChange={(e) => set("percentage", e.value)}
                    min={0}
                    max={100}
                    maxFractionDigits={2}
                    suffix=" %"
                    invalid={!!shown("conditions")}
                  />
                </FormField>
              </div>
            </div>
          )}

          {form.paymentType === "PRICE_RANGE" && (
            <>
              {form.priceRanges.map((row, index) => (
                <div className="formgrid grid align-items-end" key={index}>
                  <div className="col-6 md:col-3">
                    <FormField label="Precio desde" htmlFor={`range-min-${index}`}>
                      <InputNumber
                        inputId={`range-min-${index}`}
                        value={row.min}
                        onChange={(e) => updateRow("priceRanges", index, { min: e.value })}
                        min={0}
                        {...MONEY}
                      />
                    </FormField>
                  </div>
                  <div className="col-6 md:col-3">
                    <FormField label="Hasta" htmlFor={`range-max-${index}`}>
                      <InputNumber
                        inputId={`range-max-${index}`}
                        value={row.max}
                        onChange={(e) => updateRow("priceRanges", index, { max: e.value })}
                        min={0}
                        placeholder="Sin límite"
                        {...MONEY}
                      />
                    </FormField>
                  </div>
                  <div className="col-10 md:col-5">
                    <FormField label="Paga por unidad" htmlFor={`range-value-${index}`}>
                      <div className="flex gap-2">
                        <InputNumber
                          inputId={`range-value-${index}`}
                          value={row.value}
                          onChange={(e) => updateRow("priceRanges", index, { value: e.value })}
                          min={0}
                          {...MONEY}
                        />
                        {kindToggle("priceRanges", index, row)}
                      </div>
                    </FormField>
                  </div>
                  <div className="col-2 md:col-1">
                    <div className="ui-field">
                      <Button
                        type="button"
                        icon="pi pi-trash"
                        text
                        rounded
                        severity="danger"
                        aria-label="Quitar tramo"
                        tooltip="Quitar tramo"
                        onClick={() => removeRow("priceRanges", index)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {shown("conditions") && (
                <Message
                  severity="error"
                  text={shown("conditions")}
                  className="w-full mb-3"
                />
              )}
              <Button
                type="button"
                label="Añadir tramo de precio"
                icon="pi pi-plus"
                severity="secondary"
                text
                onClick={() => {
                  const last = form.priceRanges.at(-1);
                  addRow("priceRanges", {
                    min: last?.max ?? 0,
                    max: null,
                    kind: "amount",
                    value: null,
                  });
                }}
              />
            </>
          )}

          {form.paymentType === "SALE_QUANTITY" && (
            <>
              {form.saleQuantity.map((row, index) => (
                <div className="formgrid grid align-items-end" key={index}>
                  <div className="col-12 md:col-4">
                    <FormField
                      label="Desde la unidad nº"
                      htmlFor={`qty-min-${index}`}
                      hint="Contando todo el período"
                    >
                      <InputNumber
                        inputId={`qty-min-${index}`}
                        value={row.minProducts}
                        onChange={(e) =>
                          updateRow("saleQuantity", index, { minProducts: e.value })
                        }
                        min={1}
                      />
                    </FormField>
                  </div>
                  <div className="col-10 md:col-7">
                    <FormField label="Paga por unidad" htmlFor={`qty-value-${index}`}>
                      <div className="flex gap-2">
                        <InputNumber
                          inputId={`qty-value-${index}`}
                          value={row.value}
                          onChange={(e) =>
                            updateRow("saleQuantity", index, { value: e.value })
                          }
                          min={0}
                          {...MONEY}
                        />
                        {kindToggle("saleQuantity", index, row)}
                      </div>
                    </FormField>
                  </div>
                  <div className="col-2 md:col-1">
                    <div className="ui-field">
                      <Button
                        type="button"
                        icon="pi pi-trash"
                        text
                        rounded
                        severity="danger"
                        aria-label="Quitar escalón"
                        tooltip="Quitar escalón"
                        onClick={() => removeRow("saleQuantity", index)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {shown("conditions") && (
                <Message
                  severity="error"
                  text={shown("conditions")}
                  className="w-full mb-3"
                />
              )}
              <Button
                type="button"
                label="Añadir escalón"
                icon="pi pi-plus"
                severity="secondary"
                text
                onClick={() => {
                  const last = form.saleQuantity.at(-1);
                  addRow("saleQuantity", {
                    minProducts: last ? last.minProducts + 10 : 1,
                    kind: "amount",
                    value: null,
                  });
                }}
              />
            </>
          )}

          {isSaleType && (
            <div className="formgrid grid mt-3">
              <div className="col-12 md:col-6">
                <FormField
                  label="Solo el producto"
                  htmlFor="rule-product"
                  hint="Vacío: todos"
                >
                  <Dropdown
                    inputId="rule-product"
                    value={form.productId}
                    options={(options?.products?.data ?? []).map((p) => ({
                      label: p.name,
                      value: p.id,
                    }))}
                    onChange={(e) => set("productId", e.value ?? null)}
                    placeholder="Todos los productos"
                    loading={loadingOptions}
                    filter
                    showClear
                  />
                </FormField>
              </div>
              <div className="col-12 md:col-6">
                <FormField
                  label="Solo la categoría"
                  htmlFor="rule-category"
                  hint="Vacío: todas"
                >
                  <Dropdown
                    inputId="rule-category"
                    value={form.categoryId}
                    options={(options?.categories?.data ?? []).map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    onChange={(e) => set("categoryId", e.value ?? null)}
                    placeholder="Todas las categorías"
                    loading={loadingOptions}
                    filter
                    showClear
                  />
                </FormField>
              </div>
            </div>
          )}
        </FormSection>

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
            label={isEdit ? "Guardar cambios" : "Guardar regla"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
