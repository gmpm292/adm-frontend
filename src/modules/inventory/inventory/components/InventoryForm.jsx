import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { FormField, InfoRow } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import {
  CREATE_INVENTORY,
  GET_OFFICE_OPTIONS,
  GET_PRODUCT_OPTIONS,
  UPDATE_INVENTORY,
} from "../graphql/queries";
import { formatQuantity } from "../../format";

/**
 * Abre el inventario de un producto en una oficina o, con `inventory`, edita
 * su ubicación y su mínimo. Las existencias no se editan: cambian con
 * movimientos de entrada y salida.
 */
export function InventoryForm({ inventory, onHide, onSaved }) {
  const isEdit = !!inventory;
  const [form, setForm] = useState({
    productId: null,
    officeId: null,
    location: inventory?.location ?? "",
    currentStock: 0,
    minStock: inventory?.minStock ?? null,
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: productData, loading: loadingProducts } = useQuery(
    GET_PRODUCT_OPTIONS,
    { skip: isEdit, fetchPolicy: "network-only" },
  );
  const { data: officeData, loading: loadingOffices } = useQuery(
    GET_OFFICE_OPTIONS,
    { skip: isEdit },
  );
  const [createInventory, createState] = useMutation(CREATE_INVENTORY);
  const [updateInventory, updateState] = useMutation(UPDATE_INVENTORY);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const products = productData?.products?.data ?? [];
  const product = products.find((p) => p.id === form.productId);

  // Un producto de una oficina solo tiene inventario en ella; uno de toda la
  // empresa, en cualquiera de sus oficinas.
  const offices = (officeData?.offices?.data ?? []).filter((office) =>
    product?.office?.id
      ? office.id === product.office.id
      : !product?.business?.id || office.business?.id === product.business.id,
  );
  const officeId =
    form.officeId && offices.some((o) => o.id === form.officeId)
      ? form.officeId
      : offices.length === 1
        ? offices[0].id
        : null;
  const office = offices.find((o) => o.id === officeId);

  const errors = {
    productId: isEdit || form.productId ? null : "Elige el producto",
    officeId: isEdit || officeId ? null : "Elige la oficina",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    try {
      if (isEdit) {
        const { data } = await updateInventory({
          variables: {
            inventory: {
              id: inventory.id,
              location: form.location.trim() || null,
              minStock: form.minStock ?? null,
            },
          },
        });
        onSaved(data.updateInventory, { created: false });
      } else {
        const { data } = await createInventory({
          variables: {
            inventory: {
              productId: form.productId,
              businessId: office?.business?.id,
              officeId,
              location: form.location.trim() || undefined,
              currentStock: form.currentStock ?? 0,
              minStock: form.minStock ?? undefined,
            },
          },
        });
        onSaved(data.createInventory, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  const unit = isEdit ? inventory.product?.unitOfMeasure : product?.unitOfMeasure;

  return (
    <Dialog
      header={isEdit ? "Editar inventario" : "Nuevo inventario"}
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
        {isEdit ? (
          <ul className="ui-info-list mb-4">
            <InfoRow
              icon="pi pi-box"
              label={inventory.product?.name}
              detail={inventory.office?.name}
            >
              {formatQuantity(inventory.currentStock, unit)}
            </InfoRow>
          </ul>
        ) : (
          <div className="formgrid grid">
            <div className="col-12">
              <FormField
                label="Producto"
                htmlFor="inventory-product"
                required
                error={shown("productId")}
              >
                <Dropdown
                  inputId="inventory-product"
                  value={form.productId}
                  options={products.map((p) => ({
                    label: p.category?.name
                      ? `${p.name} · ${p.category.name}`
                      : p.name,
                    value: p.id,
                  }))}
                  onChange={(e) => set("productId", e.value)}
                  placeholder="Elige el producto"
                  emptyMessage="No hay productos"
                  emptyFilterMessage="Ningún producto coincide"
                  loading={loadingProducts}
                  invalid={!!shown("productId")}
                  filter
                  autoFocus
                />
              </FormField>
            </div>
            <div className="col-12">
              <FormField
                label="Oficina"
                htmlFor="inventory-office"
                required
                hint={
                  product?.office
                    ? "El producto es solo de esta oficina"
                    : undefined
                }
                error={shown("officeId")}
              >
                <Dropdown
                  inputId="inventory-office"
                  value={officeId}
                  options={offices.map((o) => ({
                    label: [o.name, o.business?.name]
                      .filter(Boolean)
                      .join(" · "),
                    value: o.id,
                  }))}
                  onChange={(e) => set("officeId", e.value)}
                  placeholder={
                    product ? "Elige la oficina" : "Elige primero el producto"
                  }
                  emptyMessage="No hay oficinas disponibles"
                  loading={loadingOffices}
                  disabled={!product || offices.length === 1}
                  invalid={!!shown("officeId")}
                />
              </FormField>
            </div>
          </div>
        )}

        <div className="formgrid grid">
          <div className="col-12">
            <FormField
              label="Ubicación"
              htmlFor="inventory-location"
              hint="Dónde se guarda dentro de la oficina: vitrina, almacén, estante..."
            >
              <InputText
                id="inventory-location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Por ejemplo: Vitrina principal"
                maxLength={100}
              />
            </FormField>
          </div>
          {!isEdit && (
            <div className="col-12 md:col-6">
              <FormField
                label="Existencias iniciales"
                htmlFor="inventory-stock"
                hint="Entran como un movimiento de entrada"
              >
                <InputNumber
                  inputId="inventory-stock"
                  value={form.currentStock}
                  onValueChange={(e) => set("currentStock", e.value)}
                  min={0}
                  suffix={unit?.symbol ? ` ${unit.symbol}` : undefined}
                />
              </FormField>
            </div>
          )}
          <div className={isEdit ? "col-12" : "col-12 md:col-6"}>
            <FormField
              label="Existencias mínimas"
              htmlFor="inventory-min"
              hint="Al llegar a esta cantidad se marca «Por reponer»"
            >
              <InputNumber
                inputId="inventory-min"
                value={form.minStock}
                onValueChange={(e) => set("minStock", e.value)}
                min={0}
                placeholder="Sin mínimo"
                suffix={unit?.symbol ? ` ${unit.symbol}` : undefined}
              />
            </FormField>
          </div>
        </div>
        {isEdit && (
          <p className="text-sm text-color-secondary mt-0">
            Las existencias no se editan aquí: cambian con los movimientos de
            entrada y salida.
          </p>
        )}

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
            label={isEdit ? "Guardar cambios" : "Abrir inventario"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
