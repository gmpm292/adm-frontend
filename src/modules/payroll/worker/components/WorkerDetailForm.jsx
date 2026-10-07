import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { InfoRow, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { GET_WORKER_BY_ID } from "../graphql/queries";
import {
  formatDateTime,
  formatMoney,
  workerName,
  workerTypeLabel,
} from "../../format";

/** Ficha de un trabajador: contacto, cuenta, trabajo y dónde trabaja */
export function WorkerDetailForm({ workerId, onHide, onEdit }) {
  const { data, loading, error } = useQuery(GET_WORKER_BY_ID, {
    variables: { id: workerId },
    fetchPolicy: "network-only",
  });
  const worker = data?.worker;
  const phone = worker?.user?.mobile ?? worker?.tempPhone;
  const email = worker?.user?.email ?? worker?.tempEmail;

  return (
    <Dialog
      header={worker ? workerName(worker) : "Trabajador"}
      visible
      onHide={onHide}
      className="w-full md:w-30rem"
      modal
      footer={
        worker && onEdit ? (
          <>
            <Button label="Cerrar" severity="secondary" onClick={onHide} />
            <Button label="Editar" icon="pi pi-pencil" onClick={onEdit} />
          </>
        ) : undefined
      }
    >
      {loading && !worker ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      ) : !worker ? (
        <NoData
          message={
            error ? getErrorMessage(error) : "No se encontró el trabajador"
          }
        />
      ) : (
        <ul className="ui-info-list">
          <InfoRow icon="pi pi-briefcase" label="Tipo">
            {worker.workerType === "OTHER" && worker.otherType
              ? worker.otherType
              : workerTypeLabel(worker.workerType)}
          </InfoRow>
          <InfoRow icon="pi pi-wallet" label="Salario base">
            {worker.baseSalary ? formatMoney(worker.baseSalary) : "Sin salario"}
          </InfoRow>
          <InfoRow
            icon="pi pi-map-marker"
            label="Oficina"
            detail={[worker.department?.name, worker.business?.name]
              .filter(Boolean)
              .join(" · ")}
          >
            {worker.office?.name ?? "Sin oficina"}
          </InfoRow>
          <InfoRow icon="pi pi-phone" label="Teléfono">
            {phone ?? "—"}
          </InfoRow>
          <InfoRow icon="pi pi-envelope" label="Correo">
            {email ?? "—"}
          </InfoRow>
          <InfoRow
            icon="pi pi-user"
            label="Cuenta en la aplicación"
            detail={worker.user?.email}
          >
            {worker.user ? (
              <Tag
                severity={worker.user.enabled ? "success" : "warning"}
                value={worker.user.enabled ? "Con acceso" : "Cuenta inactiva"}
              />
            ) : (
              "Sin cuenta"
            )}
          </InfoRow>
          <InfoRow
            icon="pi pi-calendar"
            label="Alta"
            detail={[worker.createdBy?.name, worker.createdBy?.lastName]
              .filter(Boolean)
              .join(" ")}
          >
            {formatDateTime(worker.createdAt)}
          </InfoRow>
        </ul>
      )}
    </Dialog>
  );
}
