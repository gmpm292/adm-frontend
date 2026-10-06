import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { FormField, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { CustomerPicker } from "../../integrated-sale/components/CustomerPicker";
import { GET_SALE_CATALOG } from "../../integrated-sale/graphql/queries";
import { saleLabel } from "../../format";
import { GET_SALE_BY_ID, UPDATE_SALE } from "../graphql/queries";

/** Formulario ya con la venta cargada: su estado inicial sale de ella */
function SaleEditFields({ sale, workers, onHide, onSaved }) {
  const isDraft = sale.saleStatus === "DRAFT";
  const [customer, setCustomer] = useState(sale.customer);
  const [hasDelivery, setHasDelivery] = useState(!!sale.hasDelivery);
  const [deliveryWorkerId, setDeliveryWorkerId] = useState(
    sale.deliveryWorker?.id ?? null,
  );
  const [deliveryNotes, setDeliveryNotes] = useState(sale.deliveryNotes ?? "");
  const [updateSale, { loading, error }] = useMutation(UPDATE_SALE);

  const couriers = workers.filter((w) => w.workerType === "COURIER");
  const courierOptions = (couriers.length ? couriers : workers).map((w) => ({
    label: w.name,
    value: w.id,
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await updateSale({
        variables: {
          sale: {
            id: sale.id,
            // El cliente solo puede cambiarse mientras la venta no se cobra
            ...(isDraft && { customerId: customer?.id ?? null }),
            hasDelivery,
            deliveryWorkerId: hasDelivery ? deliveryWorkerId : null,
            deliveryNotes: hasDelivery ? deliveryNotes.trim() : "",
          },
        },
      });
      onSaved(data.updateSale);
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-column gap-3">
      {error && (
        <Message
          severity="error"
          text={getErrorMessage(error)}
          className="w-full"
        />
      )}

      {isDraft && sale.office && sale.business && (
        <FormField label="Cliente">
          <CustomerPicker
            office={{ id: sale.office.id, businessId: sale.business.id }}
            customer={customer}
            onChange={setCustomer}
          />
        </FormField>
      )}

      <div className="flex align-items-center justify-content-between gap-3">
        <label htmlFor="sale-delivery" className="ui-field__label">
          Lleva mensajería
        </label>
        <InputSwitch
          inputId="sale-delivery"
          checked={hasDelivery}
          onChange={(e) => setHasDelivery(e.value)}
        />
      </div>

      {hasDelivery && (
        <>
          <FormField
            label="Mensajero"
            htmlFor="sale-courier"
            hint={
              isDraft ? "Hace falta para poder cobrar la venta" : undefined
            }
          >
            <Dropdown
              inputId="sale-courier"
              value={deliveryWorkerId}
              options={courierOptions}
              onChange={(e) => setDeliveryWorkerId(e.value ?? null)}
              placeholder="Selecciona el mensajero"
              emptyMessage="La tienda no tiene mensajeros"
              showClear
            />
          </FormField>
          <FormField label="Indicaciones de la entrega" htmlFor="sale-notes">
            <InputTextarea
              id="sale-notes"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Dirección, horario, persona que recibe..."
              rows={3}
              autoResize
            />
          </FormField>
        </>
      )}

      <div className="flex justify-content-end gap-2 mt-2">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          onClick={onHide}
          disabled={loading}
        />
        <Button type="submit" label="Guardar cambios" loading={loading} />
      </div>
    </form>
  );
}

/**
 * Datos generales de una venta: su cliente (solo en borrador) y su
 * mensajería. Los productos y el cobro tienen sus propias acciones.
 */
export function SaleEditForm({ saleId, onHide, onSaved }) {
  const { data, loading, error } = useQuery(GET_SALE_BY_ID, {
    variables: { id: saleId },
    fetchPolicy: "network-only",
  });
  const sale = data?.sale;

  const { data: catalogData, loading: loadingCatalog } = useQuery(
    GET_SALE_CATALOG,
    { variables: { officeId: sale?.office?.id }, skip: !sale },
  );
  const workers = catalogData?.saleCatalog?.workers;

  return (
    <Dialog
      header={sale ? `Editar ${saleLabel(sale)}` : "Editar venta"}
      visible
      onHide={onHide}
      className="w-full md:w-30rem"
      modal
    >
      {sale && workers ? (
        <SaleEditFields
          sale={sale}
          workers={workers}
          onHide={onHide}
          onSaved={onSaved}
        />
      ) : loading || loadingCatalog ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      ) : (
        <NoData
          message={error ? getErrorMessage(error) : "No se encontró la venta"}
        />
      )}
    </Dialog>
  );
}
