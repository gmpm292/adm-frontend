import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { GET_INVENTORY_OPTIONS, TRANSFER_INVENTORY } from "../graphql/queries";
import { formatQuantity, inventoryPlace } from "../../format";

/**
 * Traslada existencias de un inventario a otro del mismo producto y la misma
 * empresa: salida en el primero y entrada en el segundo, a la vez. Con
 * `inventory` el origen ya viene elegido (desde la tabla de inventarios).
 */
export function TransferForm({ inventory, onHide, onSaved }) {
  const [form, setForm] = useState({
    fromId: inventory?.id ?? null,
    toId: null,
    quantity: null,
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { data, loading } = useQuery(GET_INVENTORY_OPTIONS, {
    fetchPolicy: "network-only",
  });
  const [transfer, { loading: saving, error }] =
    useMutation(TRANSFER_INVENTORY);

  const inventories = data?.inventories?.data ?? [];
  const from = inventories.find((i) => i.id === form.fromId);
  // Destinos posibles: el mismo producto, en la misma empresa
  const destinations = from
    ? inventories.filter(
        (i) =>
          i.id !== from.id &&
          i.product?.id === from.product?.id &&
          i.business?.id === from.business?.id,
      )
    : [];
  const to = destinations.find((i) => i.id === form.toId);
  const unit = from?.product?.unitOfMeasure;

  const errors = {
    fromId: from ? null : "Elige el inventario de origen",
    toId: to ? null : "Elige el inventario de destino",
    quantity: !(form.quantity > 0)
      ? "Escribe la cantidad"
      : from && form.quantity > from.currentStock
        ? `Solo hay ${formatQuantity(from.currentStock, unit)}`
        : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const option = (i) => ({
    label: `${i.product?.name} · ${inventoryPlace(i)}`,
    value: i.id,
    stock: formatQuantity(i.currentStock, i.product?.unitOfMeasure),
  });
  const itemTemplate = (item) => (
    <div className="flex justify-content-between gap-3">
      <span>{item.label}</span>
      <span className="text-color-secondary white-space-nowrap">
        {item.stock}
      </span>
    </div>
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;
    try {
      await transfer({
        variables: {
          transfer: {
            fromInventoryId: from.id,
            toInventoryId: to.id,
            quantity: form.quantity,
            note: form.note.trim() || undefined,
          },
        },
      });
    } catch {
      return; // El mensaje se muestra desde `error`
    }
    onSaved({ from, to, quantity: form.quantity });
  };

  return (
    <Dialog
      header="Trasladar entre inventarios"
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

        <FormField
          label="Desde"
          htmlFor="transfer-from"
          required
          error={shown("fromId")}
        >
          <Dropdown
            inputId="transfer-from"
            value={form.fromId}
            options={inventories.filter((i) => i.currentStock > 0).map(option)}
            itemTemplate={itemTemplate}
            onChange={(e) =>
              setForm((current) => ({ ...current, fromId: e.value, toId: null }))
            }
            placeholder="Inventario del que salen"
            emptyMessage="No hay inventarios con existencias"
            emptyFilterMessage="Ningún inventario coincide"
            loading={loading}
            invalid={!!shown("fromId")}
            filter
            autoFocus={!inventory}
          />
        </FormField>

        <FormField
          label="Hacia"
          htmlFor="transfer-to"
          required
          hint="El mismo producto, en otro inventario de la empresa"
          error={shown("toId")}
        >
          <Dropdown
            inputId="transfer-to"
            value={form.toId}
            options={destinations.map(option)}
            itemTemplate={itemTemplate}
            onChange={(e) => set("toId", e.value)}
            placeholder={from ? "Inventario al que entran" : "Elige antes el origen"}
            emptyMessage="Este producto no tiene otro inventario. Ábrelo en Inventarios con otra ubicación (por ejemplo «Almacén») y existencias en 0."
            emptyFilterMessage="Ningún inventario coincide"
            disabled={!from}
            invalid={!!shown("toId")}
            filter
          />
        </FormField>

        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField
              label="Cantidad"
              htmlFor="transfer-quantity"
              required
              hint={
                from && form.quantity > 0 && !errors.quantity
                  ? `Quedarán ${formatQuantity(from.currentStock - form.quantity, unit)} en el origen`
                  : undefined
              }
              error={shown("quantity")}
            >
              <InputNumber
                inputId="transfer-quantity"
                value={form.quantity}
                onChange={(e) => set("quantity", e.value)}
                min={1}
                suffix={unit?.symbol ? ` ${unit.symbol}` : undefined}
                invalid={!!shown("quantity")}
                autoFocus={!!inventory}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Nota"
              htmlFor="transfer-note"
              hint="Opcional: el motivo del traslado"
            >
              <InputText
                id="transfer-note"
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                maxLength={150}
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            onClick={onHide}
            disabled={saving}
          />
          <Button type="submit" label="Trasladar" loading={saving} />
        </div>
      </form>
    </Dialog>
  );
}
