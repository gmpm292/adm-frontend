import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { SelectButton } from "primereact/selectbutton";
import { FormField, InfoRow } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { useAuthContext } from "../../../auth/components/AuthContext";
import { usePrinting } from "../../../printing/printing.module";
import {
  CREATE_INVENTORY_MOVEMENT,
  GET_INVENTORY_OPTIONS,
} from "../graphql/queries";
import {
  MANUAL_REASONS,
  MOVEMENT_TYPE,
  formatDateTime,
  formatQuantity,
  inventoryPlace,
  personName,
  reasonLabel,
} from "../../format";

const TYPE_OPTIONS = ["IN", "OUT"].map((value) => ({
  label: MOVEMENT_TYPE[value].label,
  value,
  icon: MOVEMENT_TYPE[value].icon,
}));

/**
 * Registra a mano una entrada o una salida de existencias. Con `inventory`
 * el inventario ya viene elegido (desde la tabla de inventarios).
 */
export function MovementForm({ inventory, type = "IN", onHide, onSaved }) {
  const { user } = useAuthContext();
  const { printMovement } = usePrinting();
  const [form, setForm] = useState({
    type,
    inventoryId: inventory?.id ?? null,
    quantity: null,
    reason: null,
    referenceId: "",
    print: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const { data, loading: loadingInventories } = useQuery(
    GET_INVENTORY_OPTIONS,
    { skip: !!inventory, fetchPolicy: "network-only" },
  );
  const [createMovement, { loading: saving, error }] = useMutation(
    CREATE_INVENTORY_MOVEMENT,
  );

  const inventories = data?.inventories?.data ?? [];
  const selected =
    inventory ?? inventories.find((i) => i.id === form.inventoryId);
  const unit = selected?.product?.unitOfMeasure;
  const isOut = form.type === "OUT";
  const remaining =
    selected && form.quantity
      ? selected.currentStock + (isOut ? -form.quantity : form.quantity)
      : null;

  const errors = {
    inventoryId: selected ? null : "Elige el inventario",
    quantity: !(form.quantity > 0)
      ? "Escribe la cantidad"
      : isOut && selected && form.quantity > selected.currentStock
        ? `Solo hay ${formatQuantity(selected.currentStock, unit)}`
        : null,
    reason: form.reason ? null : "Elige el motivo",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleTypeChange = (value) => {
    if (!value) return; // SelectButton permite deseleccionar
    setForm((current) => ({
      ...current,
      type: value,
      // Un motivo que no exista en el otro tipo se borra
      reason: MANUAL_REASONS[value].includes(current.reason)
        ? current.reason
        : null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    let saved;
    try {
      const { data: result } = await createMovement({
        variables: {
          movement: {
            inventoryId: selected.id,
            type: form.type,
            quantity: form.quantity,
            reason: form.reason,
            referenceId: form.referenceId.trim() || undefined,
          },
        },
      });
      saved = result.createInventoryMovement;
    } catch {
      return; // El mensaje se muestra desde `error`
    }

    // El movimiento ya está guardado: un fallo al imprimir solo se avisa
    let printError = null;
    if (form.print) {
      try {
        const printed = await printMovement({
          numeroMovimiento: String(saved.id),
          fecha: formatDateTime(saved.createdAt),
          tipo: MOVEMENT_TYPE[form.type].label.toUpperCase(),
          cantidad: form.quantity,
          motivo: reasonLabel(form.reason),
          producto: selected.product?.name,
          ubicacion: inventoryPlace(selected),
          usuario: personName(user) ?? user?.email,
        });
        if (!printed) {
          printError =
            "Revisa que QZ Tray esté abierto y haya una impresora por defecto";
        }
      } catch (err) {
        printError = getErrorMessage(err, "No se pudo imprimir el comprobante");
      }
    }
    onSaved(saved, {
      type: form.type,
      quantity: form.quantity,
      product: selected.product,
      printError,
    });
  };

  return (
    <Dialog
      header="Registrar movimiento"
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

        <FormField label="Tipo de movimiento" htmlFor="movement-type">
          <SelectButton
            id="movement-type"
            value={form.type}
            options={TYPE_OPTIONS}
            onChange={(e) => handleTypeChange(e.value)}
            itemTemplate={(option) => (
              <span className="flex align-items-center gap-2">
                <i className={option.icon} />
                {option.label}
              </span>
            )}
          />
        </FormField>

        {inventory ? (
          <ul className="ui-info-list mb-4">
            <InfoRow
              icon="pi pi-box"
              label={inventory.product?.name}
              detail={inventoryPlace(inventory)}
            >
              {formatQuantity(inventory.currentStock, unit)}
            </InfoRow>
          </ul>
        ) : (
          <FormField
            label="Inventario"
            htmlFor="movement-inventory"
            required
            error={shown("inventoryId")}
          >
            <Dropdown
              inputId="movement-inventory"
              value={form.inventoryId}
              options={inventories.map((i) => ({
                label: `${i.product?.name} · ${inventoryPlace(i)}`,
                value: i.id,
                stock: formatQuantity(i.currentStock, i.product?.unitOfMeasure),
              }))}
              itemTemplate={(option) => (
                <div className="flex justify-content-between gap-3">
                  <span>{option.label}</span>
                  <span className="text-color-secondary white-space-nowrap">
                    {option.stock}
                  </span>
                </div>
              )}
              onChange={(e) => set("inventoryId", e.value)}
              placeholder="Elige el producto y su ubicación"
              emptyMessage="No hay inventarios: ábrelos en la pantalla Inventarios"
              emptyFilterMessage="Ningún inventario coincide"
              loading={loadingInventories}
              invalid={!!shown("inventoryId")}
              filter
              autoFocus
            />
          </FormField>
        )}

        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField
              label="Cantidad"
              htmlFor="movement-quantity"
              required
              hint={
                remaining !== null && !errors.quantity
                  ? `Quedarán ${formatQuantity(remaining, unit)}`
                  : undefined
              }
              error={shown("quantity")}
            >
              <InputNumber
                inputId="movement-quantity"
                value={form.quantity}
                onChange={(e) => set("quantity", e.value)}
                min={1}
                suffix={unit?.symbol ? ` ${unit.symbol}` : undefined}
                invalid={!!shown("quantity")}
                autoFocus={!!inventory}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField
              label="Motivo"
              htmlFor="movement-reason"
              required
              error={shown("reason")}
            >
              <Dropdown
                inputId="movement-reason"
                value={form.reason}
                options={MANUAL_REASONS[form.type].map((value) => ({
                  label: reasonLabel(value),
                  value,
                }))}
                onChange={(e) => set("reason", e.value)}
                placeholder="Elige el motivo"
                invalid={!!shown("reason")}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Referencia o nota"
              htmlFor="movement-reference"
              hint="Opcional: factura del proveedor, destino del traslado..."
            >
              <InputText
                id="movement-reference"
                value={form.referenceId}
                onChange={(e) => set("referenceId", e.target.value)}
                maxLength={255}
              />
            </FormField>
          </div>
        </div>

        <div className="flex align-items-center gap-2">
          <Checkbox
            inputId="movement-print"
            checked={form.print}
            onChange={(e) => set("print", e.checked)}
          />
          <label htmlFor="movement-print">Imprimir comprobante</label>
        </div>

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
            label={isOut ? "Registrar salida" : "Registrar entrada"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
