import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { NoData } from "../../../../components/ui";
import { formatMoney } from "../../../statistics/format";
import { CustomerPicker } from "./CustomerPicker";

const PUBLICIST_TYPES = ["PUBLICIST", "COMMUNITY_MANAGER"];

/**
 * Ticket de la venta en curso: cliente, vendedor, productos, mensajería y
 * total, con las acciones para cobrarla o apartarla.
 */
export function SaleTicket({
  catalog,
  cart,
  dispatch,
  lines,
  totals,
  saleCurrency,
  blockReason,
  busy,
  onCharge,
  onPark,
  onSaveDraft,
  onClear,
}) {
  const set = (values) => dispatch({ type: "set", values });

  const workerOptions = catalog.workers.map((worker) => ({
    label: worker.name,
    value: worker.id,
  }));
  const couriers = catalog.workers.filter((w) => w.workerType === "COURIER");
  const courierOptions = (couriers.length ? couriers : catalog.workers).map(
    (worker) => ({ label: worker.name, value: worker.id }),
  );
  const publicistOptions = catalog.workers
    .filter((worker) => PUBLICIST_TYPES.includes(worker.workerType))
    .map((worker) => ({ label: worker.name, value: worker.id }));

  const total = totals.find((t) => t.currency === saleCurrency)?.total ?? 0;
  const otherTotals = totals.filter((t) => t.currency !== saleCurrency);
  const isEmpty = lines.length === 0;
  const hasLineErrors = lines.some((line) => line.error);

  return (
    <aside className="pos-ticket" aria-label="Venta actual">
      <div className="pos-ticket__section">
        <h2 className="pos-ticket__title">
          <span>Venta actual</span>
          {!isEmpty && (
            <Button
              label="Vaciar"
              icon="pi pi-trash"
              text
              size="small"
              severity="secondary"
              onClick={onClear}
            />
          )}
        </h2>
        <CustomerPicker
          office={catalog.office}
          customer={cart.customer}
          onChange={(customer) => set({ customer })}
        />
        {catalog.canChooseSeller && (
          <Dropdown
            value={cart.sellerId}
            options={workerOptions}
            onChange={(e) => set({ sellerId: e.value })}
            placeholder="Selecciona el vendedor"
            emptyMessage="La tienda no tiene trabajadores"
            filter={workerOptions.length > 8}
            invalid={!isEmpty && !cart.sellerId}
            aria-label="Vendedor"
          />
        )}
      </div>

      <div className="pos-ticket__lines">
        {isEmpty ? (
          <NoData message="Toca un producto para añadirlo a la venta" />
        ) : (
          lines.map((line) => (
            <div key={line.productId} className="pos-line">
              <div className="min-w-0">
                <span className="pos-line__name" title={line.product.name}>
                  {line.product.name}
                </span>
                <span className="pos-line__price">
                  {formatMoney(line.unitPrice, line.currency)} c/u
                </span>
              </div>
              <InputNumber
                value={line.quantity}
                onValueChange={(e) =>
                  e.value &&
                  dispatch({
                    type: "quantity",
                    productId: line.productId,
                    quantity: e.value,
                  })
                }
                min={1}
                max={Math.max(line.product.stock, 1)}
                showButtons
                buttonLayout="horizontal"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                useGrouping={false}
                aria-label={`Cantidad de ${line.product.name}`}
              />
              <div className="flex align-items-center gap-1">
                <span className="pos-line__subtotal">
                  {formatMoney(line.subtotal, line.currency)}
                </span>
                <Button
                  icon="pi pi-times"
                  text
                  rounded
                  severity="danger"
                  aria-label={`Quitar ${line.product.name}`}
                  onClick={() =>
                    dispatch({ type: "remove", productId: line.productId })
                  }
                />
              </div>
              {line.error && (
                <span className="pos-line__error">{line.error}</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pos-ticket__section">
        {publicistOptions.length > 0 && (
          <MultiSelect
            value={cart.publicistIds}
            options={publicistOptions}
            onChange={(e) => set({ publicistIds: e.value ?? [] })}
            placeholder="Publicistas (opcional)"
            display="chip"
            aria-label="Publicistas"
          />
        )}
        <div className="flex align-items-center justify-content-between gap-3">
          <label htmlFor="pos-delivery" className="pos-ticket__label">
            Lleva mensajería
          </label>
          <InputSwitch
            inputId="pos-delivery"
            checked={cart.hasDelivery}
            onChange={(e) =>
              set(
                e.value
                  ? { hasDelivery: true }
                  : {
                      hasDelivery: false,
                      deliveryWorkerId: null,
                      deliveryNotes: "",
                    },
              )
            }
          />
        </div>
        {cart.hasDelivery && (
          <>
            <Dropdown
              value={cart.deliveryWorkerId}
              options={courierOptions}
              onChange={(e) => set({ deliveryWorkerId: e.value ?? null })}
              placeholder="Selecciona el mensajero"
              emptyMessage="La tienda no tiene mensajeros"
              showClear
              aria-label="Mensajero"
            />
            <InputTextarea
              value={cart.deliveryNotes}
              onChange={(e) => set({ deliveryNotes: e.target.value })}
              placeholder="Dirección e indicaciones de la entrega"
              rows={2}
              autoResize
              aria-label="Indicaciones de la entrega"
            />
          </>
        )}
      </div>

      <div className="pos-ticket__section">
        <div>
          <div className="pos-total">
            <span className="pos-total__label">Total</span>
            <span className="pos-total__amount">
              {formatMoney(total, saleCurrency)}
            </span>
          </div>
          {otherTotals.length > 0 && (
            <div className="pos-total__alt">
              o{" "}
              {otherTotals
                .map((t) => formatMoney(t.total, t.currency))
                .join(" · ")}
            </div>
          )}
        </div>
        {!isEmpty && blockReason && (
          <small className="ui-field__hint">{blockReason}</small>
        )}
        <Button
          label="Cobrar"
          icon="pi pi-wallet"
          size="large"
          disabled={isEmpty || !!blockReason || busy}
          onClick={onCharge}
        />
        <div className="flex gap-2">
          <Button
            label="En espera"
            icon="pi pi-pause"
            severity="secondary"
            outlined
            className="flex-1"
            disabled={isEmpty || busy}
            tooltip="Aparta esta venta en este equipo para atender a otro cliente"
            tooltipOptions={{ position: "top", showOnDisabled: false }}
            onClick={onPark}
          />
          <Button
            label="Guardar borrador"
            icon="pi pi-save"
            severity="secondary"
            outlined
            className="flex-1"
            disabled={
              isEmpty ||
              busy ||
              hasLineErrors ||
              (catalog.canChooseSeller && !cart.sellerId)
            }
            tooltip="Reserva los productos; se cobra después desde Ventas"
            tooltipOptions={{ position: "top", showOnDisabled: false }}
            onClick={onSaveDraft}
          />
        </div>
      </div>
    </aside>
  );
}
