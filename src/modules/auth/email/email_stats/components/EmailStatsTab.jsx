import { useRef } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { EmptyState, StatCard } from "../../../../../components/ui";
import { getErrorMessage } from "../../../../../utils/errors";
import { formatDateTime } from "../../../../sales/format";
import {
  GET_EMAILS,
  GET_EMAIL_STATS,
  RETRY_FAILED_EMAILS,
} from "../graphql/email-stats.queries";

const EMPTY = <span className="text-color-secondary">—</span>;

const EMAIL_STATUS = {
  SENT: { label: "Enviado", severity: "success" },
  PENDING: { label: "Pendiente", severity: "warning" },
  RETRYING: { label: "Reintentando", severity: "info" },
  FAILED: { label: "Fallido", severity: "danger" },
};

/** Estadísticas de envío de correo, con el historial y el botón de reintento */
export function EmailStatsTab() {
  const toast = useRef(null);
  const { data: statsData, loading: loadingStats } = useQuery(
    GET_EMAIL_STATS,
    { fetchPolicy: "network-only" },
  );
  const {
    data: emailsData,
    loading: loadingEmails,
    refetch,
  } = useQuery(GET_EMAILS, { fetchPolicy: "network-only" });
  const [retryFailed, { loading: retrying }] = useMutation(
    RETRY_FAILED_EMAILS,
  );

  const stats = statsData?.emailStats;
  const emails = emailsData?.emails ?? [];

  const handleRetry = async () => {
    try {
      await retryFailed();
      toast.current?.show({
        severity: "success",
        summary: "Reintento iniciado",
        detail: "Los correos fallidos se están reenviando",
        life: 6000,
      });
      refetch();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "No se pudo reintentar",
        detail: getErrorMessage(err),
        life: 6000,
      });
    }
  };

  return (
    <div className="flex flex-column gap-4">
      <Toast ref={toast} />

      <div className="grid">
        <div className="col-6 md:col-3">
          <StatCard
            label="Total"
            value={loadingStats ? "—" : (stats?.total ?? 0)}
            icon="pi pi-envelope"
          />
        </div>
        <div className="col-6 md:col-3">
          <StatCard
            label="Enviados"
            value={loadingStats ? "—" : (stats?.sent ?? 0)}
            icon="pi pi-check-circle"
          />
        </div>
        <div className="col-6 md:col-3">
          <StatCard
            label="Fallidos"
            value={loadingStats ? "—" : (stats?.failed ?? 0)}
            icon="pi pi-times-circle"
          />
        </div>
        <div className="col-6 md:col-3">
          <StatCard
            label="Tasa de éxito"
            value={
              loadingStats || stats?.successRate == null
                ? "—"
                : `${(stats.successRate * 100).toFixed(1)}%`
            }
            icon="pi pi-chart-line"
          />
        </div>
      </div>

      {!!stats?.failed && (
        <Message
          severity="warn"
          className="w-full justify-content-start"
          content={
            <div className="flex align-items-center justify-content-between w-full gap-3">
              <span>
                Hay {stats.failed} correo{stats.failed === 1 ? "" : "s"}{" "}
                fallido{stats.failed === 1 ? "" : "s"}.
              </span>
              <Button
                label="Reintentar fallidos"
                icon="pi pi-refresh"
                size="small"
                severity="warning"
                onClick={handleRetry}
                loading={retrying}
              />
            </div>
          }
        />
      )}

      <DataTable
        value={emails}
        loading={loadingEmails}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage={
          <EmptyState icon="pi pi-inbox" title="Aún no se ha enviado ningún correo" />
        }
        sortField="createdAt"
        sortOrder={-1}
      >
        <Column field="to" header="Para" sortable />
        <Column field="subject" header="Asunto" sortable />
        <Column
          field="status"
          header="Estado"
          sortable
          body={(row) => {
            const status = EMAIL_STATUS[row.status];
            return status ? (
              <Tag severity={status.severity} value={status.label} />
            ) : (
              EMPTY
            );
          }}
        />
        <Column
          field="createdAt"
          header="Creado"
          sortable
          body={(row) => formatDateTime(row.createdAt)}
        />
        <Column
          field="sentAt"
          header="Enviado"
          sortable
          body={(row) => (row.sentAt ? formatDateTime(row.sentAt) : EMPTY)}
        />
        <Column
          field="retryCount"
          header="Reintentos"
          sortable
          body={(row) => row.retryCount ?? 0}
        />
        <Column
          field="error.message"
          header="Error"
          body={(row) => row.error?.message || EMPTY}
        />
      </DataTable>
    </div>
  );
}
