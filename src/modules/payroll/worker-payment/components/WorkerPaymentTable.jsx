import React, { useCallback, useState, useRef, useMemo } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_WORKER_PAYMENTS,
  REMOVE_WORKER_PAYMENTS,
} from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { WorkerPaymentEditForm } from "./WorkerPaymentEditForm";
import { WorkerPaymentCreateForm } from "./WorkerPaymentCreateForm";
import { WorkerPaymentDetailForm } from "./WorkerPaymentDetailForm";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";

// ==================== UTILITY FUNCTIONS ====================

/**
 * Obtiene el nombre completo del trabajador
 */
const getWorkerFullName = (worker) => {
  if (!worker) return "N/A";

  if (worker.user && (worker.user.name || worker.user.lastName)) {
    const fullName =
      `${worker.user.name || ""} ${worker.user.lastName || ""}`.trim();
    if (fullName) return fullName;
  }

  if (worker.tempFirstName || worker.tempLastName) {
    const tempFullName =
      `${worker.tempFirstName || ""} ${worker.tempLastName || ""}`.trim();
    if (tempFullName) return tempFullName;
  }

  if (worker.user && worker.user.email) {
    return worker.user.email;
  }

  if (worker.tempEmail) {
    return worker.tempEmail;
  }

  if (worker.id) {
    return `Trabajador #${worker.id}`;
  }

  return "Sin nombre";
};

// ==================== BODY TEMPLATES ====================

/**
 * Template para mostrar el ID
 */
const idBodyTemplate = (rowData) => {
  return <Badge value={`#${rowData.id}`} severity="info" />;
};

/**
 * Template para mostrar el trabajador con toda su información
 */
const workerBodyTemplate = (rowData) => {
  const worker = rowData.worker;
  if (!worker) return "N/A";

  const fullName = getWorkerFullName(worker);
  const workerType = worker.workerType || "N/A";

  return (
    <div className="flex flex-column">
      <span className="font-bold">{fullName}</span>
      <small className="text-secondary">
        Tipo: {workerType} | ID: {worker.id}
      </small>
      {worker.user && (
        <small className="text-secondary">Usuario: {worker.user.email}</small>
      )}
    </div>
  );
};

/**
 * Template para mostrar el monto con formato
 */
const amountBodyTemplate = (rowData) => {
  const amount = rowData.amount || 0;
  const currency = rowData.currency || "USD";

  return (
    <div className="flex flex-column">
      <span className="font-bold">
        {new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: currency,
        }).format(amount)}
      </span>
      {rowData.exchangeRate && rowData.exchangeRate !== 1 && (
        <small className="text-secondary">Tasa: {rowData.exchangeRate}</small>
      )}
    </div>
  );
};

/**
 * Template para el método de pago
 */
const paymentMethodBodyTemplate = (rowData) => {
  const methods = {
    CASH: { label: "Efectivo", severity: "success" },
    BANK_TRANSFER: { label: "Transferencia", severity: "info" },
    CHECK: { label: "Cheque", severity: "warning" },
    MOBILE_PAYMENT: { label: "Pago Móvil", severity: "info" },
    OTHER: { label: "Otro", severity: "secondary" },
    CARD: { label: "Tarjeta", severity: "info" },
    TRANSFER: { label: "Transferencia", severity: "info" },
  };

  const method = methods[rowData.paymentMethod] || {
    label: rowData.paymentMethod,
    severity: "secondary",
  };

  return <Tag value={method.label} severity={method.severity} />;
};

/**
 * Template para el tipo de pago (concepto)
 */
const paymentConceptBodyTemplate = (rowData) => {
  const concepts = {
    SALARY: { label: "Salario", severity: "info" },
    COMMISSION: { label: "Comisión", severity: "success" },
    BONUS: { label: "Bono", severity: "warning" },
    DISCOUNT: { label: "Descuento", severity: "danger" },
    OTHER: { label: "Otro", severity: "secondary" },
  };

  const concept = concepts[rowData.paymentConcept] || {
    label: rowData.paymentConcept || "N/A",
    severity: "secondary",
  };

  return <Tag value={concept.label} severity={concept.severity} />;
};

/**
 * Template para mostrar el período de nómina
 */
const payrollPeriodBodyTemplate = (rowData) => {
  const period = rowData.payrollPeriod;
  if (!period) return "N/A";

  return (
    <div className="flex flex-column">
      <span className="font-medium">{period.name}</span>
      <small className="text-secondary">ID: {period.id}</small>
    </div>
  );
};

/**
 * Template para la venta asociada
 */
const saleBodyTemplate = (rowData) => {
  const sale = rowData.sale;
  if (!sale) return <span className="text-secondary">Sin venta</span>;

  const saleDate = sale.effectiveDate
    ? new Date(sale.effectiveDate).toLocaleDateString()
    : "Fecha no disponible";

  return (
    <div className="flex flex-column">
      <span className="font-medium">Venta #{sale.id}</span>
      <small className="text-secondary">{saleDate}</small>
    </div>
  );
};

/**
 * Template para mostrar si está pagado o pendiente
 */
const paidStatusBodyTemplate = (rowData) => {
  const isPaid = !!rowData.paidDate;

  return (
    <Tag
      value={isPaid ? "Pagado" : "Pendiente"}
      severity={isPaid ? "success" : "warning"}
      icon={isPaid ? "pi pi-check" : "pi pi-clock"}
    />
  );
};

/**
 * Template para la fecha de pago
 */
const paidDateBodyTemplate = (rowData) => {
  if (!rowData.paidDate) return "—";
  return new Date(rowData.paidDate).toLocaleString();
};

/**
 * Template para la fecha de creación
 */
const dateBodyTemplate = (rowData) => {
  return (
    <div className="flex flex-column">
      <span>{new Date(rowData.createdAt).toLocaleDateString()}</span>
      <small className="text-secondary">
        {new Date(rowData.createdAt).toLocaleTimeString()}
      </small>
    </div>
  );
};

/**
 * Template para el desglose (breakdown)
 */
const breakdownBodyTemplate = (rowData) => {
  const breakdown = rowData.breakdown || {};
  const hasBreakdown = Object.keys(breakdown).length > 0;

  if (!hasBreakdown) return "—";

  return (
    <div className="flex flex-column gap-1">
      {breakdown.ruleName && (
        <small>
          <strong>Regla:</strong> {breakdown.ruleName}
        </small>
      )}
      {breakdown.baseSalary > 0 && (
        <small>
          <strong>Base:</strong> ${breakdown.baseSalary}
        </small>
      )}
      {breakdown.commissions > 0 && (
        <small>
          <strong>Comisiones:</strong> ${breakdown.commissions}
        </small>
      )}
      {breakdown.bonuses > 0 && (
        <small>
          <strong>Bonos:</strong> ${breakdown.bonuses}
        </small>
      )}
      {breakdown.deductions > 0 && (
        <small>
          <strong>Deducciones:</strong> ${breakdown.deductions}
        </small>
      )}
    </div>
  );
};

/**
 * Template para la estructura organizativa
 */
const securityEntitiesBodyTemplate = (rowData) => {
  const entities = [];

  if (rowData.business) entities.push(`🏢 ${rowData.business.name}`);
  if (rowData.office) entities.push(`🏢 ${rowData.office.name}`);
  if (rowData.department) entities.push(`📊 ${rowData.department.name}`);
  if (rowData.team) entities.push(`👥 ${rowData.team.name}`);

  return (
    <div className="flex flex-column">
      {entities.length > 0 ? (
        entities.map((entity, index) => <small key={index}>{entity}</small>)
      ) : (
        <span className="text-secondary">—</span>
      )}
    </div>
  );
};

/**
 * Template para las notas
 */
const notesBodyTemplate = (rowData) => {
  const notes = rowData.notes;
  if (!notes) return "—";

  return notes.length > 50 ? `${notes.substring(0, 50)}...` : notes;
};

/**
 * Template para el creador/actualizador
 */
const auditBodyTemplate = (rowData) => {
  const createdBy = rowData.createdBy;
  const updatedBy = rowData.updatedBy;

  return (
    <div className="flex flex-column">
      {createdBy && (
        <small>
          <strong>Creado:</strong> {createdBy.name}
        </small>
      )}
      {updatedBy && createdBy?.id !== updatedBy?.id && (
        <small>
          <strong>Actualizado:</strong> {updatedBy.name}
        </small>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export function WorkerPaymentTable() {
  const [getWorkerPayments, { loading, data, error }] = useLazyQuery(
    GET_WORKER_PAYMENTS,
    {
      fetchPolicy: "network-only",
    },
  );
  const [removeWorkerPayments] = useMutation(REMOVE_WORKER_PAYMENTS);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const toast = useRef(null);
  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

  // Definir todas las columnas importantes
  const columns = useMemo(
    () => [
      {
        field: "id",
        header: "ID",
        body: idBodyTemplate,
        sortable: true,
        style: { width: "80px" },
      },
      {
        field: "worker",
        header: "Trabajador",
        body: workerBodyTemplate,
        sortable: true,
        filter: true,
        filterField: "worker.user.name",
        style: { minWidth: "200px" },
      },
      {
        field: "amount",
        header: "Monto",
        body: amountBodyTemplate,
        sortable: true,
        style: { width: "120px" },
      },
      {
        field: "paymentConcept",
        header: "Tipo de Pago",
        body: paymentConceptBodyTemplate,
        sortable: true,
        filter: true,
        style: { width: "120px" },
      },
      {
        field: "paymentMethod",
        header: "Método",
        body: paymentMethodBodyTemplate,
        sortable: true,
        filter: true,
        style: { width: "120px" },
      },
      {
        field: "paidStatus",
        header: "Estado",
        body: paidStatusBodyTemplate,
        sortable: true,
        filter: true,
        style: { width: "100px" },
      },
      {
        field: "paidDate",
        header: "Fecha de Pago",
        body: paidDateBodyTemplate,
        sortable: true,
        style: { width: "160px" },
      },
      {
        field: "payrollPeriod",
        header: "Período",
        body: payrollPeriodBodyTemplate,
        sortable: true,
        filter: true,
        style: { minWidth: "150px" },
      },
      {
        field: "sale",
        header: "Venta",
        body: saleBodyTemplate,
        sortable: true,
        style: { width: "150px" },
      },
      {
        field: "breakdown",
        header: "Desglose",
        body: breakdownBodyTemplate,
        style: { minWidth: "200px" },
      },
      {
        field: "entities",
        header: "Organización",
        body: securityEntitiesBodyTemplate,
        style: { minWidth: "150px" },
        visible: false,
      },
      {
        field: "notes",
        header: "Notas",
        body: notesBodyTemplate,
        style: { minWidth: "150px" },
        visible: false,
      },
      {
        field: "createdAt",
        header: "Creado",
        body: dateBodyTemplate,
        sortable: true,
        style: { width: "150px" },
        visible: false,
      },
      {
        field: "audit",
        header: "Auditoría",
        body: auditBodyTemplate,
        style: { minWidth: "150px" },
        visible: false,
      },
    ],
    [],
  );

  const handleFetchData = useCallback(
    async (params) => {
      try {
        tableStateRef.current = {
          filters: params.filters || {},
          sorts: params.sorts || [],
          pagination: {
            first: params.skip,
            rows: params.take,
          },
        };

        const { data: responseData } = await getWorkerPayments({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              filters: params.filters,
              sorts: params.sorts,
            },
          },
        });

        return {
          data: responseData?.workerPayments?.data,
          totalCount: responseData?.workerPayments?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching worker payments:", err);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Error al cargar los pagos",
          life: 3000,
        });
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getWorkerPayments],
  );

  const handleRefresh = useCallback(() => {
    handleFetchData({
      skip: tableStateRef.current.pagination.first,
      take: tableStateRef.current.pagination.rows,
      filters: tableStateRef.current.filters,
      sorts: tableStateRef.current.sorts,
    });
  }, [handleFetchData]);

  const handleEditSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleCreateSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (id) => {
    setSelectedPaymentId(id);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (id) => {
    setSelectedPaymentId(id);
    setDetailDialogVisible(true);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este pago?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await removeWorkerPayments({ variables: { ids: [id] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Pago eliminado correctamente",
            life: 3000,
          });

          handleRefresh();
        } catch (err) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: err.message,
            life: 3000,
          });
        }
      },
    });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewDetails(rowData.id)}
        />
        {/* <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDelete(rowData.id)}
        /> */}
      </div>
    );
  };

  const addButton = (
    <Button
      icon="pi pi-plus"
      label="Nuevo Pago"
      tooltip="Registrar Nuevo Pago"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

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
          "worker.user.name",
          "worker.tempFirstName",
          "worker.tempLastName",
          "paymentMethod",
          "paymentConcept",
          "notes",
          "payrollPeriod.name",
          "business.name",
          "office.name",
        ]}
        emptyMessage="No se encontraron pagos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pagos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "8rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <WorkerPaymentEditForm
        paymentId={selectedPaymentId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <WorkerPaymentCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <WorkerPaymentDetailForm
        paymentId={selectedPaymentId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}
