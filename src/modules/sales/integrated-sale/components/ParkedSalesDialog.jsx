import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { NoData } from "../../../../components/ui";
import { formatDate } from "../../../../utils/dateUtils";

/**
 * Ventas apartadas en este equipo para atender a otro cliente. No reservan
 * productos: al retomarlas se vuelve a comprobar la disponibilidad.
 */
export function ParkedSalesDialog({
  sales,
  productsById,
  onResume,
  onRemove,
  onHide,
}) {
  const summaryOf = (sale) =>
    sale.lines
      .map((line) => {
        const name = productsById.get(line.productId)?.name ?? "Producto";
        return `${line.quantity} × ${name}`;
      })
      .join(", ");

  return (
    <Dialog
      header="Ventas en espera"
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      modal
    >
      {sales.length === 0 ? (
        <NoData message="No hay ventas en espera en esta tienda" />
      ) : (
        <ul className="ui-info-list">
          {sales.map((sale) => (
            <li key={sale.parkedId} className="ui-info-row">
              <span className="ui-info-row__icon">
                <i className="pi pi-shopping-cart" />
              </span>
              <span className="ui-info-row__text">
                <span className="ui-info-row__label">
                  {sale.customer?.fullName ?? "Cliente ocasional"}
                </span>
                <span className="ui-info-row__detail">
                  {summaryOf(sale)} · {formatDate(sale.savedAt)}
                </span>
              </span>
              <span className="ui-info-row__value flex gap-1">
                <Button
                  label="Retomar"
                  icon="pi pi-play"
                  size="small"
                  onClick={() => onResume(sale)}
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  aria-label="Descartar la venta en espera"
                  tooltip="Descartar"
                  tooltipOptions={{ position: "left" }}
                  onClick={() => onRemove(sale.parkedId)}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
