import { useMemo, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { ProgressSpinner } from "primereact/progressspinner";
import { FormField, FormSection, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { CategorySelector } from "../../category/components/CategorySelector";
import UnitOfMeasureDropdown from "../../unit-of-measure/components/UnitOfMeasureDropdown";
import MaterialCostDropdown from "../../../payroll/material-cost/components/MaterialCostDropdown";
import { CREATE_INVENTORY } from "../../inventory/graphql/queries";
import { GET_OFFICE_OPTIONS } from "../../../company/shared/queries";
import {
  CREATE_PRODUCT,
  GET_ACTIVE_CURRENCIES,
  GET_MATERIAL_COST_BY_ID,
  GET_PRODUCT_BY_ID,
  UPDATE_PRODUCT,
} from "../graphql/queries";
import { formatMoney } from "../../format";

const round2 = (value) => Math.round(value * 100) / 100;

/** Margen sobre el precio de venta: (venta − costo) / venta */
const marginOf = (cost, price) =>
  cost > 0 && price > 0 ? round2(((price - cost) / price) * 100) : null;

/** Estado inicial del formulario a partir del producto guardado */
const toForm = (product) => ({
  name: product?.name ?? "",
  category: product?.category ?? null,
  unitOfMeasureId: product?.unitOfMeasure?.id ?? null,
  materialCostId: product?.materialCost?.id ?? null,
  materialQuantity: 1,
  warranty: product?.warranty ?? "",
  costPrice: product?.costPrice ?? null,
  costCurrency: product?.costCurrency ?? null,
  basePrice: product?.basePrice ?? null,
  baseCurrency: product?.baseCurrency ?? null,
  acceptedCurrencies: product?.pricingConfig?.acceptedCurrencies ?? [],
  fixedPrices: Object.fromEntries(
    (product?.pricingConfig?.fixedPrices ?? []).map((p) => [
      p.currency,
      p.amount,
    ]),
  ),
  exchangeRateMargin: product?.pricingConfig?.exchangeRateMargin ?? 0,
  decimalPlaces: product?.pricingConfig?.decimalPlaces ?? 2,
  minQuantity: product?.saleRules?.minQuantity ?? null,
  maxQuantity: product?.saleRules?.maxQuantity ?? null,
  bulkDiscounts: (product?.saleRules?.bulkDiscounts ?? []).map((d) => ({
    minQty: d.minQty,
    discount: d.discount,
    applicableCurrencies: d.applicableCurrencies,
  })),
  attributes: Object.entries(product?.attributes ?? {}).map(([key, value]) => ({
    key,
    value: String(value),
  })),
  inventoryOffices: [],
});

/**
 * Alta o edición de un producto (con `productId` edita). Al crear se puede
 * abrir a la vez su inventario en una o varias oficinas.
 */
export function ProductForm({ productId, onHide, onSaved }) {
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    skip: !productId,
    fetchPolicy: "network-only",
  });

  if (productId && !data?.product) {
    return (
      <Dialog
        header="Editar producto"
        visible
        onHide={onHide}
        className="ui-dialog--wide"
        modal
      >
        {loading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner strokeWidth="4" />
          </div>
        ) : (
          <NoData
            message={
              error ? getErrorMessage(error) : "No se encontró el producto"
            }
          />
        )}
      </Dialog>
    );
  }

  return (
    <ProductFormDialog
      product={data?.product}
      onHide={onHide}
      onSaved={onSaved}
    />
  );
}

function ProductFormDialog({ product, onHide, onSaved }) {
  const isEdit = !!product;
  const client = useApolloClient();
  const [form, setForm] = useState(() => toForm(product));
  const [material, setMaterial] = useState(product?.materialCost ?? null);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: currencyData, loading: loadingCurrencies } = useQuery(
    GET_ACTIVE_CURRENCIES,
  );
  const { data: officeData, loading: loadingOffices } = useQuery(
    GET_OFFICE_OPTIONS,
    { skip: isEdit },
  );
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [createInventory] = useMutation(CREATE_INVENTORY);

  const currencies = useMemo(
    () =>
      (currencyData?.currencies?.data ?? [])
        .filter((c) => c.isActive || form.acceptedCurrencies.includes(c.code))
        .map((c) => ({ label: `${c.code} · ${c.name}`, value: c.code })),
    [currencyData, form.acceptedCurrencies],
  );
  const currencyCodes = currencies.map((c) => ({
    label: c.value,
    value: c.value,
  }));

  // La moneda de venta siempre se acepta; el resto, las elegidas
  const accepted = form.baseCurrency
    ? [
        form.baseCurrency,
        ...form.acceptedCurrencies.filter((c) => c !== form.baseCurrency),
      ]
    : form.acceptedCurrencies;
  const otherCurrencies = accepted.filter((c) => c !== form.baseCurrency);

  // Oficinas donde puede estar el producto: las de su categoría
  const category = form.category;
  const officeOptions = (officeData?.offices?.data ?? [])
    .filter((office) =>
      category?.office?.id
        ? office.id === category.office.id
        : !category?.business?.id ||
          office.business?.id === category.business.id,
    )
    .map((office) => ({
      label: [office.name, office.business?.name].filter(Boolean).join(" · "),
      value: office.id,
      businessId: office.business?.id,
    }));

  const sameCurrency =
    form.costCurrency && form.costCurrency === form.baseCurrency;
  const margin = sameCurrency
    ? marginOf(form.costPrice, form.basePrice)
    : null;

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const errors = {
    category: form.category ? null : "Elige la categoría",
    name: form.name.trim() ? null : "Escribe el nombre",
    unitOfMeasureId: form.unitOfMeasureId ? null : "Elige la unidad de medida",
    costPrice:
      form.costPrice === null || form.costPrice === undefined
        ? "Escribe el costo"
        : !form.costCurrency
          ? "Elige la moneda del costo"
          : null,
    basePrice: !(form.basePrice > 0)
      ? "El precio de venta debe ser mayor que cero"
      : !form.baseCurrency
        ? "Elige la moneda de venta"
        : null,
    quantities:
      form.minQuantity && form.maxQuantity && form.minQuantity > form.maxQuantity
        ? "La cantidad mínima no puede ser mayor que la máxima"
        : null,
    bulkDiscounts: form.bulkDiscounts.some(
      (d) =>
        !d.minQty ||
        !(d.discount > 0) ||
        d.discount > 100 ||
        !d.applicableCurrencies.length,
    )
      ? "Completa cada descuento: desde cuántas unidades, el porcentaje y sus monedas"
      : null,
    attributes: form.attributes.some((a) => !a.key.trim() || !a.value.trim())
      ? "Completa o quita las características vacías"
      : new Set(form.attributes.map((a) => a.key.trim().toLowerCase())).size !==
          form.attributes.length
        ? "Hay dos características con el mismo nombre"
        : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  // Al elegir un material, el costo sale de su precio por la cantidad usada
  const applyMaterial = (nextMaterial, quantity) => {
    if (!nextMaterial) return;
    setForm((current) => ({
      ...current,
      costPrice: round2((quantity || 1) * nextMaterial.costPrice),
      costCurrency: nextMaterial.currency?.code ?? current.costCurrency,
      baseCurrency:
        current.baseCurrency ?? nextMaterial.currency?.code ?? null,
      unitOfMeasureId:
        nextMaterial.unitOfMeasure?.id ?? current.unitOfMeasureId,
    }));
  };

  const handleMaterialChange = async (materialCostId) => {
    set("materialCostId", materialCostId ?? null);
    if (!materialCostId) {
      setMaterial(null);
      return;
    }
    const { data: materialData } = await client.query({
      query: GET_MATERIAL_COST_BY_ID,
      variables: { id: materialCostId },
    });
    setMaterial(materialData?.materialCost ?? null);
    applyMaterial(materialData?.materialCost, form.materialQuantity);
  };

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

  const buildInput = () => {
    const fixedPrices = otherCurrencies
      .filter((code) => form.fixedPrices[code] > 0)
      .map((code) => ({ currency: code, amount: form.fixedPrices[code] }));
    const hasRules =
      form.minQuantity || form.maxQuantity || form.bulkDiscounts.length;
    return {
      categoryId: form.category.id,
      name: form.name.trim(),
      unitOfMeasureId: form.unitOfMeasureId,
      costPrice: form.costPrice,
      costCurrency: form.costCurrency,
      basePrice: form.basePrice,
      baseCurrency: form.baseCurrency,
      warranty: form.warranty.trim() || null,
      attributes: form.attributes.length
        ? Object.fromEntries(
            form.attributes.map((a) => [a.key.trim(), a.value.trim()]),
          )
        : null,
      pricingConfig: {
        acceptedCurrencies: accepted,
        fixedPrices,
        exchangeRateMargin: form.exchangeRateMargin ?? 0,
        decimalPlaces: form.decimalPlaces ?? 2,
      },
      saleRules: hasRules
        ? {
            minQuantity: form.minQuantity || null,
            maxQuantity: form.maxQuantity || null,
            bulkDiscounts: form.bulkDiscounts,
          }
        : null,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSaveError(null);
    if (hasErrors) return;

    setSaving(true);
    try {
      const input = buildInput();
      if (isEdit) {
        const { data: saved } = await updateProduct({
          variables: {
            product: {
              id: product.id,
              ...input,
              materialCostId: form.materialCostId ?? null,
            },
          },
        });
        onSaved(saved.updateProduct, { created: false });
        return;
      }

      const { data: saved } = await createProduct({
        variables: {
          product: {
            ...input,
            ...(form.materialCostId && { materialCostId: form.materialCostId }),
          },
        },
      });
      const created = saved.createProduct;

      // El producto ya existe: si falla un inventario se avisa, sin deshacer
      let inventoryError = null;
      for (const officeId of form.inventoryOffices) {
        const office = officeOptions.find((o) => o.value === officeId);
        try {
          await createInventory({
            variables: {
              inventory: {
                productId: created.id,
                currentStock: 0,
                businessId: office?.businessId,
                officeId,
              },
            },
          });
        } catch (err) {
          inventoryError = getErrorMessage(err);
        }
      }
      onSaved(created, { created: true, inventoryError });
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header={isEdit ? `Editar ${product.name}` : "Nuevo producto"}
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      closable={!saving}
      modal
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormSection title="Datos del producto">
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField
                label="Categoría"
                htmlFor="product-category"
                required
                error={shown("category")}
              >
                <CategorySelector
                  selectedCategoryId={form.category?.id}
                  onCategorySelect={(category) => set("category", category)}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Nombre"
                htmlFor="product-name"
                required
                error={shown("name")}
              >
                <InputText
                  id="product-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  invalid={!!shown("name")}
                  maxLength={100}
                  autoFocus={!isEdit}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Unidad de medida"
                htmlFor="product-unit"
                required
                hint={
                  form.materialCostId
                    ? "La del material elegido"
                    : "Cómo se cuenta en el inventario"
                }
                error={shown("unitOfMeasureId")}
              >
                <UnitOfMeasureDropdown
                  inputId="product-unit"
                  value={form.unitOfMeasureId}
                  onChange={(e) => set("unitOfMeasureId", e.value)}
                  placeholder="Elige la unidad"
                  disabled={!!form.materialCostId}
                  invalid={!!shown("unitOfMeasureId")}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Garantía"
                htmlFor="product-warranty"
                hint="Vacío si no tiene"
              >
                <InputText
                  id="product-warranty"
                  value={form.warranty}
                  onChange={(e) => set("warranty", e.target.value)}
                  placeholder="Por ejemplo: 30 días"
                  maxLength={100}
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Costo y precio"
          hint="Si el producto se hace con un material, su costo se calcula solo."
        >
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField label="Material" htmlFor="product-material">
                <MaterialCostDropdown
                  inputId="product-material"
                  value={form.materialCostId}
                  onChange={(e) => handleMaterialChange(e.value)}
                  placeholder="Sin material"
                  showClear
                />
              </FormField>
            </div>
            {form.materialCostId && (
              <div className="col-12 md:col-6">
                <FormField
                  label="Cantidad de material"
                  htmlFor="product-material-qty"
                  hint="Por cada unidad del producto"
                >
                  <InputNumber
                    inputId="product-material-qty"
                    value={form.materialQuantity}
                    onChange={(e) => {
                      set("materialQuantity", e.value);
                      applyMaterial(material, e.value);
                    }}
                    min={0}
                    maxFractionDigits={3}
                  />
                </FormField>
              </div>
            )}
            <div className="col-12 md:col-6">
              <FormField
                label="Costo"
                htmlFor="product-cost"
                required
                error={shown("costPrice")}
              >
                <div className="p-inputgroup">
                  <InputNumber
                    inputId="product-cost"
                    value={form.costPrice}
                    onChange={(e) => set("costPrice", e.value)}
                    min={0}
                    minFractionDigits={2}
                    locale="es-ES"
                    maxFractionDigits={2}
                    invalid={!!shown("costPrice")}
                  />
                  <Dropdown
                    value={form.costCurrency}
                    options={currencyCodes}
                    onChange={(e) => set("costCurrency", e.value)}
                    placeholder="Moneda"
                    loading={loadingCurrencies}
                    className="w-7rem flex-none"
                    aria-label="Moneda del costo"
                  />
                </div>
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Precio de venta"
                htmlFor="product-price"
                required
                error={shown("basePrice")}
              >
                <div className="p-inputgroup">
                  <InputNumber
                    inputId="product-price"
                    value={form.basePrice}
                    onChange={(e) => set("basePrice", e.value)}
                    min={0}
                    minFractionDigits={2}
                    locale="es-ES"
                    maxFractionDigits={2}
                    invalid={!!shown("basePrice")}
                  />
                  <Dropdown
                    value={form.baseCurrency}
                    options={currencyCodes}
                    onChange={(e) => set("baseCurrency", e.value)}
                    placeholder="Moneda"
                    loading={loadingCurrencies}
                    className="w-7rem flex-none"
                    aria-label="Moneda de venta"
                  />
                </div>
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Margen"
                htmlFor="product-margin"
                hint={
                  !sameCurrency
                    ? "Se calcula cuando costo y precio están en la misma moneda"
                    : margin !== null
                      ? `Ganancia por unidad: ${formatMoney(form.basePrice - form.costPrice, form.baseCurrency)}`
                      : "Escríbelo para calcular el precio de venta"
                }
              >
                <InputNumber
                  inputId="product-margin"
                  value={margin}
                  onChange={(e) => {
                    if (e.value === null || e.value >= 100) return;
                    if (form.costPrice > 0) {
                      set("basePrice", round2(form.costPrice / (1 - e.value / 100)));
                    }
                  }}
                  suffix=" %"
                  max={99.99}
                  maxFractionDigits={2}
                  disabled={!sameCurrency || !(form.costPrice > 0)}
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Cobro en otras monedas"
          hint="El precio en otra moneda se calcula con la tasa de cambio, salvo que le pongas un precio fijo."
        >
          <div className="formgrid grid">
            <div className="col-12">
              <FormField label="Monedas aceptadas" htmlFor="product-currencies">
                <MultiSelect
                  inputId="product-currencies"
                  value={otherCurrencies}
                  options={currencies.filter(
                    (c) => c.value !== form.baseCurrency,
                  )}
                  onChange={(e) => set("acceptedCurrencies", e.value)}
                  placeholder={
                    form.baseCurrency
                      ? `Solo ${form.baseCurrency}`
                      : "Elige primero la moneda de venta"
                  }
                  display="chip"
                  disabled={!form.baseCurrency}
                  loading={loadingCurrencies}
                />
              </FormField>
            </div>
            {otherCurrencies.map((code) => (
              <div className="col-12 md:col-6" key={code}>
                <FormField
                  label={`Precio fijo en ${code}`}
                  htmlFor={`product-fixed-${code}`}
                >
                  <InputNumber
                    inputId={`product-fixed-${code}`}
                    value={form.fixedPrices[code] ?? null}
                    onChange={(e) =>
                      set("fixedPrices", { ...form.fixedPrices, [code]: e.value })
                    }
                    min={0}
                    minFractionDigits={2}
                    locale="es-ES"
                    maxFractionDigits={2}
                    placeholder="Por tasa de cambio"
                  />
                </FormField>
              </div>
            ))}
            {otherCurrencies.length > 0 && (
              <>
                <div className="col-12 md:col-6">
                  <FormField
                    label="Recargo sobre la tasa de cambio"
                    htmlFor="product-rate-margin"
                    hint="Se suma al precio convertido"
                  >
                    <InputNumber
                      inputId="product-rate-margin"
                      value={form.exchangeRateMargin}
                      onChange={(e) => set("exchangeRateMargin", e.value)}
                      suffix=" %"
                      min={0}
                      maxFractionDigits={2}
                    />
                  </FormField>
                </div>
                <div className="col-12 md:col-6">
                  <FormField
                    label="Decimales del precio convertido"
                    htmlFor="product-decimals"
                  >
                    <InputNumber
                      inputId="product-decimals"
                      value={form.decimalPlaces}
                      onChange={(e) => set("decimalPlaces", e.value)}
                      min={0}
                      max={6}
                    />
                  </FormField>
                </div>
              </>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Reglas de venta"
          hint="Opcional: límites por venta y descuentos al comprar varias unidades."
        >
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField
                label="Cantidad mínima por venta"
                htmlFor="product-min"
                error={shown("quantities")}
              >
                <InputNumber
                  inputId="product-min"
                  value={form.minQuantity}
                  onChange={(e) => set("minQuantity", e.value)}
                  min={1}
                  placeholder="Sin mínimo"
                  invalid={!!shown("quantities")}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField label="Cantidad máxima por venta" htmlFor="product-max">
                <InputNumber
                  inputId="product-max"
                  value={form.maxQuantity}
                  onChange={(e) => set("maxQuantity", e.value)}
                  min={1}
                  placeholder="Sin máximo"
                  invalid={!!shown("quantities")}
                />
              </FormField>
            </div>
          </div>
          {form.bulkDiscounts.map((discount, index) => (
            <div className="formgrid grid align-items-end" key={index}>
              <div className="col-6 md:col-3">
                <FormField
                  label="Desde (unidades)"
                  htmlFor={`discount-qty-${index}`}
                >
                  <InputNumber
                    inputId={`discount-qty-${index}`}
                    value={discount.minQty}
                    onChange={(e) =>
                      updateRow("bulkDiscounts", index, { minQty: e.value })
                    }
                    min={1}
                  />
                </FormField>
              </div>
              <div className="col-6 md:col-3">
                <FormField label="Descuento" htmlFor={`discount-pct-${index}`}>
                  <InputNumber
                    inputId={`discount-pct-${index}`}
                    value={discount.discount}
                    onChange={(e) =>
                      updateRow("bulkDiscounts", index, { discount: e.value })
                    }
                    suffix=" %"
                    min={0}
                    max={100}
                    maxFractionDigits={2}
                  />
                </FormField>
              </div>
              <div className="col-10 md:col-5">
                <FormField
                  label="En las monedas"
                  htmlFor={`discount-currencies-${index}`}
                >
                  <MultiSelect
                    inputId={`discount-currencies-${index}`}
                    value={discount.applicableCurrencies}
                    options={accepted.map((code) => ({
                      label: code,
                      value: code,
                    }))}
                    onChange={(e) =>
                      updateRow("bulkDiscounts", index, {
                        applicableCurrencies: e.value,
                      })
                    }
                    placeholder="Monedas"
                  />
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
                    aria-label="Quitar descuento"
                    tooltip="Quitar descuento"
                    onClick={() => removeRow("bulkDiscounts", index)}
                  />
                </div>
              </div>
            </div>
          ))}
          {shown("bulkDiscounts") && (
            <Message
              severity="error"
              text={shown("bulkDiscounts")}
              className="w-full mb-3"
            />
          )}
          <Button
            type="button"
            label="Añadir descuento por cantidad"
            icon="pi pi-plus"
            severity="secondary"
            text
            onClick={() =>
              addRow("bulkDiscounts", {
                minQty: null,
                discount: null,
                applicableCurrencies: accepted,
              })
            }
          />
        </FormSection>

        <FormSection
          title="Características"
          hint="Opcional: talla, color, material... Se muestran en la ficha del producto."
        >
          {form.attributes.map((attribute, index) => (
            <div className="formgrid grid align-items-end" key={index}>
              <div className="col-5">
                <FormField label="Característica" htmlFor={`attr-key-${index}`}>
                  <InputText
                    id={`attr-key-${index}`}
                    value={attribute.key}
                    onChange={(e) =>
                      updateRow("attributes", index, { key: e.target.value })
                    }
                    placeholder="Color"
                    maxLength={50}
                  />
                </FormField>
              </div>
              <div className="col-5 md:col-6">
                <FormField label="Valor" htmlFor={`attr-value-${index}`}>
                  <InputText
                    id={`attr-value-${index}`}
                    value={attribute.value}
                    onChange={(e) =>
                      updateRow("attributes", index, { value: e.target.value })
                    }
                    placeholder="Rojo"
                    maxLength={100}
                  />
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
                    aria-label="Quitar característica"
                    tooltip="Quitar característica"
                    onClick={() => removeRow("attributes", index)}
                  />
                </div>
              </div>
            </div>
          ))}
          {shown("attributes") && (
            <Message
              severity="error"
              text={shown("attributes")}
              className="w-full mb-3"
            />
          )}
          <Button
            type="button"
            label="Añadir característica"
            icon="pi pi-plus"
            severity="secondary"
            text
            onClick={() => addRow("attributes", { key: "", value: "" })}
          />
        </FormSection>

        {!isEdit && (
          <FormSection
            title="Inventario"
            hint="Abre ya su inventario donde se vaya a vender. Empieza vacío: las existencias entran después con un movimiento de entrada."
          >
            <FormField label="Oficinas" htmlFor="product-offices">
              <MultiSelect
                inputId="product-offices"
                value={form.inventoryOffices}
                options={officeOptions}
                onChange={(e) => set("inventoryOffices", e.value)}
                placeholder={
                  form.category
                    ? "Ninguna por ahora"
                    : "Elige primero la categoría"
                }
                emptyMessage="No hay oficinas disponibles"
                display="chip"
                loading={loadingOffices}
                disabled={!form.category}
                filter={officeOptions.length > 8}
              />
            </FormField>
          </FormSection>
        )}

        {saveError && (
          <Message severity="error" text={saveError} className="w-full mt-3" />
        )}
        {submitted && hasErrors && (
          <Message
            severity="warn"
            text="Revisa los campos marcados."
            className="w-full mt-3"
          />
        )}

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            onClick={onHide}
            disabled={saving}
          />
          <Button
            type="submit"
            label={isEdit ? "Guardar cambios" : "Guardar producto"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
