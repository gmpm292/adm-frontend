import { useCallback, useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { getErrorMessage } from "../../../../utils/errors";
import {
  GET_WORKER_PAYMENTS,
  MARK_WORKER_PAYMENTS_AS_PAID,
  REMOVE_WORKER_PAYMENTS,
} from "../graphql/queries";
import {
  PAYMENT_CONCEPT,
  formatDate,
  formatMoney,
  workerName,
} from "../../format";
import { useHasRole } from "../../../../hooks/useHasRole";
import { WorkerPaymentForm } from "./WorkerPaymentForm";
import { WorkerPaymentDetailForm } from "./WorkerPaymentDetailForm";

const STATUS_OPTIONS = [
  { label: "Pendientes", value: "pending" },
  { label: "Pagados", value: "paid" },
  { label: "Todos", value: "all" },
];

const columns = [
  {
    field: "worker.tempFirstName",
    header: "Trabajador",
    sortable: true,
    body: (row) => (
      <span className="font-medium text-900">{workerName(row.worker)}</span>
    ),
  },
  {
    field: "paymentConcept",
    header: "Concepto",
    sortable: true,
    body: (row) => (
      <span className="flex flex-column">
        <span>{PAYMENT_CONCEPT[row.paymentConcept] ?? row.paymentConcept}</span>
        <small className="text-color-secondary">
          {[row.breakdown?.ruleName, row.sale?.id && `Venta #${row.sale.id}`]
            .filter(Boolean)
            .join(" · ")}
        </small>
      </span>
    ),
  },
  {
    field: "amount",
    header: "Importe",
    sortable: true,
    bodyClassName: "white-space-nowrap font-medium",
    body: (row) =>
      `${row.paymentConcept === "DISCOUNT" ? "−" : ""}${formatMoney(row.amount, row.currency)}`,
  },
  {
    field: "payrollPeriod.name",
    header: "Período",
    sortable: true,
    body: (row) =>
      row.payrollPeriod?.name ?? (
        <span className="text-color-secondary">Sin período</span>
      ),
  },
  {
    field: "paidDate",
    header: "Estado",
    sortable: true,
    body: (row) =>
      row.paidDate ? (
        <span className="flex flex-column align-items-start gap-1">
          <Tag severity="success" value="Pagado" />
          <small className="text-color-secondary">
            {formatDate(row.paidDate)}
          </small>
        </span>
      ) : (
        <Tag severity="warning" value="Pendiente" />
      ),
  },
];

export function WorkerPaymentTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canPay = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const canCreate = hasRole("SUPER", "PRINCIPAL", "ADMIN", "MANAGER");
  const canDelete = hasRole("SUPER", "PRINCIPAL");
  const [status, setStatus] = useState("pending");
  const statusRef = useRef(status);
  const [fetchPayments, { loading, data, error }] = useLazyQuery(
    GET_WORKER_PAYMENTS,
    { fetchPolicy: "network-only" },
  );
  const [markAsPaid] = useMutation(MARK_WORKER_PAYMENTS_AS_PAID);
  const [removePayments] = useMutation(REMOVE_WORKER_PAYMENTS);
  // { payment } al corregir, {} al registrar
  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      const byStatus =
        statusRef.current === "all"
          ? []
          : [
              {
                property: "paidDate",
                operator:
                  statusRef.current === "paid" ? "IS_NOT_NULL" : "IS_NULL",
              },
            ];
      try {
        const { data: response } = await fetchPayments({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              filters: [...(params.filters ?? []), ...byStatus],
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.workerPayments?.data,
          totalCount: response?.workerPayments?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchPayments],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  useEffect(() => {
    statusRef.current = status;
    if (lastParams.current) {
      handleFetchData({ ...lastParams.current, skip: 0 });
    }
  }, [status, handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved, { created }) => {
    setForm(null);
    handleRefresh();
    notify("success", created ? "Pago registrado" : "Pago corregido", saved?.name);
  };

  const handlePay = (row) =>
    confirmDialog({
      header: "Marcar como pagado",
      message: `¿Ya se le pagaron ${formatMoney(row.amount, row.currency)} a ${workerName(row.worker)}? Quedará con la fecha de hoy.`,
      icon: "pi pi-check-circle",
      acceptLabel: "Sí, pagado",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await markAsPaid({ variables: { ids: [row.id] } });
          notify("success", "Pago hecho", workerName(row.worker));
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo marcar", getErrorMessage(err));
        }
      },
    });

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar pago",
      message: `Se eliminará este pago pendiente de ${workerName(row.worker)}.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removePayments({ variables: { ids: [row.id] } });
          notify("success", "Pago eliminado", workerName(row.worker));
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const actionBodyTemplate = (row) => {
    const open = row.payrollPeriod && !row.payrollPeriod.isClosed;
    const pending = !row.paidDate;
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="secondary"
          tooltip="Ver detalle"
          tooltipOptions={{ position: "top" }}
          aria-label="Ver detalle"
          onClick={() => setDetail(row)}
        />
        {canPay && pending && open && (
          <Button
            icon="pi pi-check-circle"
            text
            rounded
            severity="success"
            tooltip="Marcar como pagado"
            tooltipOptions={{ position: "top" }}
            aria-label="Marcar como pagado"
            onClick={() => handlePay(row)}
          />
        )}
        {canPay && pending && open && (
          <Button
            icon="pi pi-pencil"
            text
            rounded
            tooltip="Corregir"
            tooltipOptions={{ position: "top" }}
            aria-label="Corregir pago"
            onClick={() => setForm({ payment: row })}
          />
        )}
        {canDelete && pending && open && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar"
            tooltipOptions={{ position: "top" }}
            aria-label="Eliminar pago"
            onClick={() => handleDelete(row)}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.workerPayments?.data}
        totalRecords={data?.workerPayments?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={[
          "worker.tempFirstName",
          "worker.tempLastName",
          "user.name",
          "user.lastName",
          "notes",
        ]}
        emptyMessage={
          status === "pending" ? "No hay pagos pendientes" : "No hay pagos"
        }
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pagos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "createdAt", order: -1 }]}
        header={
          <div className="flex flex-wrap align-items-center gap-3">
            {canCreate && (
              <Button
                label="Registrar pago"
                icon="pi pi-plus"
                onClick={() => setForm({})}
              />
            )}
            <SelectButton
              value={status}
              options={STATUS_OPTIONS}
              onChange={(e) => e.value && setStatus(e.value)}
              allowEmpty={false}
              aria-label="Estado de los pagos"
            />
          </div>
        }
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-10rem"
        />
      </GenericDataTable>

      {form && (
        <WorkerPaymentForm
          payment={form.payment}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
      {detail && (
        <WorkerPaymentDetailForm
          payment={detail}
          onHide={() => setDetail(null)}
        />
      )}
    </>
  );
}
