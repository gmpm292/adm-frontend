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
  GET_PAYMENT_RULES,
  REMOVE_PAYMENT_RULES,
  RESTORE_PAYMENT_RULES,
} from "../graphql/queries";
import { PAYMENT_TYPE, ruleSummary, workerTypeLabel } from "../../format";
import { useHasRole } from "../../useHasRole";
import { PaymentRuleForm } from "./PaymentRuleForm";

const columns = [
  {
    field: "name",
    header: "Regla",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{row.name}</span>
        <small className="text-color-secondary">
          {PAYMENT_TYPE[row.paymentType]?.label}
        </small>
      </span>
    ),
  },
  {
    field: "workerType",
    header: "Quién cobra",
    sortable: true,
    body: (row) =>
      row.workerType === "OTHER" && row.otherType
        ? row.otherType
        : workerTypeLabel(row.workerType),
  },
  {
    field: "paymentCurrency",
    header: "Cuánto",
    sortable: false,
    body: (row) => (
      <span className="flex flex-column">
        <span>{ruleSummary(row)}</span>
        <small className="text-color-secondary">
          {[row.product?.name, row.category?.name].filter(Boolean).join(" · ") ||
            (row.paymentType === "FIXED_AMOUNT" ? "" : "Todos los productos")}
        </small>
      </span>
    ),
  },
  {
    field: "isActive",
    header: "Estado",
    sortable: true,
    body: (row) => (
      <Tag
        severity={row.isActive ? "success" : "secondary"}
        value={row.isActive ? "Activa" : "Inactiva"}
      />
    ),
  },
];

export function PaymentRuleTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const canDelete = hasRole("SUPER", "PRINCIPAL");
  const canRestore = hasRole("SUPER");
  const [fetchRules, { loading, data, error }] = useLazyQuery(
    GET_PAYMENT_RULES,
    { fetchPolicy: "network-only" },
  );
  const [removeRules] = useMutation(REMOVE_PAYMENT_RULES);
  const [restoreRules] = useMutation(RESTORE_PAYMENT_RULES);
  // { rule } al editar, {} al crear
  const [form, setForm] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchRules({
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
          data: response?.paymentRules?.data,
          totalCount: response?.paymentRules?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchRules],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved, { created }) => {
    setForm(null);
    handleRefresh();
    notify("success", created ? "Regla creada" : "Regla actualizada", saved?.name);
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar regla",
      message: `Se eliminará la regla «${row.name}». Los pagos ya calculados con ella se conservan.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeRules({ variables: { ids: [row.id] } });
          notify("success", "Regla eliminada", row.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreRules({ variables: { ids: [row.id] } });
      notify("success", "Regla restaurada", row.name);
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
            tooltip="Restaurar regla"
            tooltipOptions={{ position: "top" }}
            aria-label="Restaurar regla"
            onClick={() => handleRestore(row)}
          />
        )}
      </div>
    ) : (
      <div className="actions-column">
        {canEdit && (
          <Button
            icon="pi pi-pencil"
            text
            rounded
            tooltip="Editar regla"
            tooltipOptions={{ position: "top" }}
            aria-label="Editar regla"
            onClick={() => setForm({ rule: row })}
          />
        )}
        {canDelete && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar regla"
            tooltipOptions={{ position: "top" }}
            aria-label="Eliminar regla"
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
        data={data?.paymentRules?.data}
        totalRecords={data?.paymentRules?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "description"]}
        emptyMessage="No hay reglas de pago"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reglas"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "name", order: 1 }]}
        header={
          canEdit && (
            <Button
              label="Nueva regla"
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
          className="w-8rem"
        />
      </GenericDataTable>

      {form && (
        <PaymentRuleForm
          rule={form.rule}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
