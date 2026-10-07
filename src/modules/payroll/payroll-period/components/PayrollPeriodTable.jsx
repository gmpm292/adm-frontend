import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { getErrorMessage } from "../../../../utils/errors";
import {
  GET_PAYROLL_PERIODS,
  REMOVE_PAYROLL_PERIODS,
  RESTORE_PAYROLL_PERIODS,
} from "../graphql/queries";
import { formatTotals, periodRange, totalsByCurrency } from "../../format";
import { useHasRole } from "../../../../hooks/useHasRole";
import { PayrollPeriodForm } from "./PayrollPeriodForm";
import { PayrollPeriodDetailForm } from "./PayrollPeriodDetailForm";

/** Abierto, pendiente de calcular o cerrado */
const periodStatus = (period) => {
  if (period.isClosed) return { label: "Cerrado", severity: "secondary" };
  if (new Date(period.endDate) > new Date()) {
    return { label: "En curso", severity: "info" };
  }
  if (!period.payments?.length) {
    return { label: "Por calcular", severity: "warning" };
  }
  if (period.payments.some((p) => !p.paidDate)) {
    return { label: "Por pagar", severity: "warning" };
  }
  return { label: "Listo para cerrar", severity: "success" };
};

const columns = [
  {
    field: "name",
    header: "Período",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{row.name}</span>
        <small className="text-color-secondary">{periodRange(row)}</small>
      </span>
    ),
  },
  {
    field: "isClosed",
    header: "Estado",
    sortable: true,
    body: (row) => {
      const status = periodStatus(row);
      return <Tag severity={status.severity} value={status.label} />;
    },
  },
  {
    field: "payments",
    header: "Pagos",
    sortable: false,
    body: (row) =>
      row.payments?.length ? (
        <span className="flex flex-column">
          <span>{formatTotals(totalsByCurrency(row.payments))}</span>
          <small className="text-color-secondary">
            {row.payments.length} pagos
          </small>
        </span>
      ) : (
        <span className="text-color-secondary">Sin pagos</span>
      ),
  },
  {
    field: "business.name",
    header: "Empresa",
    sortable: true,
    visible: false,
    body: (row) => row.business?.name ?? "—",
  },
];

export function PayrollPeriodTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const canDelete = hasRole("SUPER", "PRINCIPAL");
  const canRestore = hasRole("SUPER");
  const [fetchPeriods, { loading, data, error }] = useLazyQuery(
    GET_PAYROLL_PERIODS,
    { fetchPolicy: "network-only" },
  );
  const [removePeriods] = useMutation(REMOVE_PAYROLL_PERIODS);
  const [restorePeriods] = useMutation(RESTORE_PAYROLL_PERIODS);
  // { period } al editar, {} al crear
  const [form, setForm] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchPeriods({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              withDeleted: params.showDeleted,
              filters: params.filters,
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.payrollPeriods?.data,
          totalCount: response?.payrollPeriods?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchPeriods],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved, { created }) => {
    setForm(null);
    handleRefresh();
    notify(
      "success",
      created ? "Período creado" : "Período actualizado",
      saved?.name,
    );
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar período",
      message: `Se eliminará el período «${row.name}». Solo es posible si aún no tiene pagos.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removePeriods({ variables: { ids: [row.id] } });
          notify("success", "Período eliminado", row.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restorePeriods({ variables: { ids: [row.id] } });
      notify("success", "Período restaurado", row.name);
      handleRefresh();
    } catch (err) {
      notify("error", "No se pudo restaurar", getErrorMessage(err));
    }
  };

  const actionBodyTemplate = (row) =>
    row.deletedAt ? (
      <div className="actions-column">
        {canRestore && (
          <Button
            icon="pi pi-history"
            text
            rounded
            severity="success"
            tooltip="Restaurar período"
            tooltipOptions={{ position: "top" }}
            aria-label="Restaurar período"
            onClick={() => handleRestore(row)}
          />
        )}
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="secondary"
          tooltip={row.isClosed ? "Ver pagos" : "Ver, calcular y cerrar"}
          tooltipOptions={{ position: "top" }}
          aria-label="Ver período"
          onClick={() => setDetailId(row.id)}
        />
        {canEdit && !row.isClosed && (
          <Button
            icon="pi pi-pencil"
            text
            rounded
            tooltip="Editar período"
            tooltipOptions={{ position: "top" }}
            aria-label="Editar período"
            onClick={() => setForm({ period: row })}
          />
        )}
        {canDelete && !row.payments?.length && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar período"
            tooltipOptions={{ position: "top" }}
            aria-label="Eliminar período"
            onClick={() => handleDelete(row)}
          />
        )}
      </div>
    );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.payrollPeriods?.data}
        totalRecords={data?.payrollPeriods?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "description"]}
        emptyMessage="No hay períodos de nómina"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} períodos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "startDate", order: -1 }]}
        header={
          canEdit && (
            <Button
              label="Nuevo período"
              icon="pi pi-plus"
              onClick={() => setForm({})}
            />
          )
        }
        showDeleted={canRestore}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-10rem"
        />
      </GenericDataTable>

      {form && (
        <PayrollPeriodForm
          period={form.period}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
      {detailId && (
        <PayrollPeriodDetailForm
          periodId={detailId}
          canManage={canEdit}
          onHide={() => setDetailId(null)}
          onChanged={handleRefresh}
        />
      )}
    </>
  );
}
