// payroll-period/components/PayrollPeriodDetailForm.jsx
import React from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_PAYROLL_PERIOD_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Badge } from "primereact/badge";
import { Chip } from "primereact/chip";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

// ==================== LABELS ====================

const paymentMethodLabels = {
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia Bancaria",
  CHECK: "Cheque",
  MOBILE_PAYMENT: "Pago Móvil",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  OTHER: "Otro",
};

const paymentConceptLabels = {
  SALARY: "Salario",
  COMMISSION: "Comisión",
  BONUS: "Bono",
  DISCOUNT: "Descuento",
  OTHER: "Otro",
};

const paymentMethodSeverities = {
  CASH: "success",
  BANK_TRANSFER: "info",
  CHECK: "warning",
  MOBILE_PAYMENT: "info",
  CARD: "info",
  TRANSFER: "info",
  OTHER: "secondary",
};

const paymentConceptSeverities = {
  SALARY: "info",
  COMMISSION: "success",
  BONUS: "warning",
  DISCOUNT: "danger",
  OTHER: "secondary",
};

const officeTypeLabels = {
  MAIN: "Principal",
  BRANCH: "Sucursal",
  WAREHOUSE: "Almacén",
  STORE: "Tienda",
  OTHER: "Otro",
};

const departmentTypeLabels = {
  SALES: "Ventas",
  MARKETING: "Marketing",
  OPERATIONS: "Operaciones",
  FINANCE: "Finanzas",
  HR: "Recursos Humanos",
  IT: "Tecnología",
  OTHER: "Otro",
};

const teamTypeLabels = {
  SALES: "Ventas",
  SUPPORT: "Soporte",
  DEVELOPMENT: "Desarrollo",
  MANAGEMENT: "Gerencia",
  OTHER: "Otro",
};

// ==================== HELPER FUNCTIONS ====================

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

/**
 * Formatea un monto como moneda
 */
const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) return "N/A";

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea una fecha
 */
const formatDate = (date, includeTime = false) => {
  if (!date) return "N/A";

  const options = includeTime
    ? {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    : {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };

  return new Date(date).toLocaleDateString("es-ES", options);
};

// ==================== TEMPLATES PARA TABLA DE PAGOS ====================

const paymentAmountTemplate = (rowData) => {
  return (
    <span className="font-bold">
      {formatCurrency(rowData.amount, rowData.currency)}
    </span>
  );
};

const paymentMethodTemplate = (rowData) => {
  return (
    <Tag
      value={
        paymentMethodLabels[rowData.paymentMethod] || rowData.paymentMethod
      }
      severity={paymentMethodSeverities[rowData.paymentMethod] || "secondary"}
    />
  );
};

const paymentConceptTemplate = (rowData) => {
  return (
    <Tag
      value={
        paymentConceptLabels[rowData.paymentConcept] || rowData.paymentConcept
      }
      severity={paymentConceptSeverities[rowData.paymentConcept] || "secondary"}
    />
  );
};

const paymentStatusTemplate = (rowData) => {
  return (
    <Tag
      value={rowData.paidDate ? "Pagado" : "Pendiente"}
      severity={rowData.paidDate ? "success" : "warning"}
      icon={rowData.paidDate ? "pi pi-check" : "pi pi-clock"}
    />
  );
};

const paymentWorkerTemplate = (rowData) => {
  const worker = rowData.worker;
  if (!worker) return "N/A";

  return (
    <div className="flex flex-column">
      <span className="font-medium">{getWorkerFullName(worker)}</span>
      <small className="text-secondary">ID: {worker.id}</small>
    </div>
  );
};

// ==================== COMPONENTES SECCIÓN ====================

/**
 * Sección de información general del período
 */
const GeneralInfoSection = ({ period }) => (
  <Panel header="Información General" className="mb-3">
    <div className="grid">
      <div className="col-12 md:col-6 lg:col-3">
        <div className="field">
          <label className="font-bold block text-secondary">
            ID del Período
          </label>
          <Badge value={`#${period.id}`} size="large" severity="info" />
        </div>
      </div>

      <div className="col-12 md:col-6 lg:col-3">
        <div className="field">
          <label className="font-bold block text-secondary">Nombre</label>
          <span className="text-lg font-medium">{period.name}</span>
        </div>
      </div>

      <div className="col-12 md:col-6 lg:col-3">
        <div className="field">
          <label className="font-bold block text-secondary">Estado</label>
          <Tag
            value={period.isClosed ? "Cerrado" : "Abierto"}
            severity={period.isClosed ? "danger" : "success"}
            icon={period.isClosed ? "pi pi-lock" : "pi pi-lock-open"}
            className="text-base"
          />
        </div>
      </div>

      <div className="col-12 md:col-6 lg:col-3">
        <div className="field">
          <label className="font-bold block text-secondary">Descripción</label>
          <span>{period.description || "Sin descripción"}</span>
        </div>
      </div>
    </div>
  </Panel>
);

/**
 * Sección de fechas del período
 */
const DateRangeSection = ({ period }) => (
  <Panel header="Período" className="mb-3">
    <div className="grid">
      <div className="col-12 md:col-6">
        <div className="field">
          <label className="font-bold block text-secondary">
            Fecha de Inicio
          </label>
          <div className="flex align-items-center gap-2">
            <i className="pi pi-calendar"></i>
            <span className="text-lg">{formatDate(period.startDate)}</span>
          </div>
          <small className="text-secondary block mt-1">
            {formatDate(period.startDate, true)}
          </small>
        </div>
      </div>

      <div className="col-12 md:col-6">
        <div className="field">
          <label className="font-bold block text-secondary">Fecha de Fin</label>
          <div className="flex align-items-center gap-2">
            <i className="pi pi-calendar"></i>
            <span className="text-lg">{formatDate(period.endDate)}</span>
          </div>
          <small className="text-secondary block mt-1">
            {formatDate(period.endDate, true)}
          </small>
        </div>
      </div>
    </div>

    {period.startDate && period.endDate && (
      <div className="mt-2">
        <Divider />
        <div className="flex align-items-center gap-2">
          <i className="pi pi-clock text-secondary"></i>
          <span className="text-secondary">
            Duración:{" "}
            {Math.ceil(
              (new Date(period.endDate) - new Date(period.startDate)) /
                (1000 * 60 * 60 * 24),
            )}{" "}
            días
          </span>
        </div>
      </div>
    )}
  </Panel>
);

/**
 * Sección de estructura organizativa
 */
const SecurityEntitiesSection = ({ period }) => {
  const entities = [];

  if (period.business)
    entities.push({
      type: "Negocio",
      name: period.business.name,
      id: period.business.id,
      details: period.business,
    });
  if (period.office)
    entities.push({
      type: "Oficina",
      name: period.office.name,
      id: period.office.id,
      details: period.office,
    });
  if (period.department)
    entities.push({
      type: "Departamento",
      name: period.department.name,
      id: period.department.id,
      details: period.department,
    });
  if (period.team)
    entities.push({
      type: "Equipo",
      name: period.team.name,
      id: period.team.id,
      details: period.team,
    });

  if (entities.length === 0) {
    return (
      <Panel header="Estructura Organizativa" className="mb-3">
        <span className="text-secondary">
          No hay información organizativa disponible
        </span>
      </Panel>
    );
  }

  return (
    <Panel header="Estructura Organizativa" className="mb-3">
      <Accordion>
        {entities.map((entity, index) => (
          <AccordionTab key={index} header={`${entity.type}: ${entity.name}`}>
            <div className="grid">
              <div className="col-12">
                <label className="font-bold block text-secondary">ID</label>
                <Badge value={`#${entity.id}`} severity="info" />
              </div>

              {entity.details.taxId && (
                <div className="col-12 md:col-6">
                  <label className="font-bold block text-secondary">
                    RIF/NIT
                  </label>
                  <span>{entity.details.taxId}</span>
                </div>
              )}

              {entity.details.address && (
                <div className="col-12">
                  <label className="font-bold block text-secondary">
                    Dirección
                  </label>
                  <span>{entity.details.address}</span>
                </div>
              )}

              {entity.details.contactPhone && (
                <div className="col-12 md:col-6">
                  <label className="font-bold block text-secondary">
                    Teléfono
                  </label>
                  <span>{entity.details.contactPhone}</span>
                </div>
              )}

              {entity.details.contactEmail && (
                <div className="col-12 md:col-6">
                  <label className="font-bold block text-secondary">
                    Email
                  </label>
                  <span>{entity.details.contactEmail}</span>
                </div>
              )}

              {entity.details.officeType && (
                <div className="col-12 md:col-6">
                  <label className="font-bold block text-secondary">
                    Tipo de Oficina
                  </label>
                  <Tag
                    value={
                      officeTypeLabels[entity.details.officeType] ||
                      entity.details.officeType
                    }
                  />
                </div>
              )}

              {entity.details.departmentType && (
                <div className="col-12 md:col-6">
                  <label className="font-bold block text-secondary">
                    Tipo de Departamento
                  </label>
                  <Tag
                    value={
                      departmentTypeLabels[entity.details.departmentType] ||
                      entity.details.departmentType
                    }
                  />
                </div>
              )}

              {entity.details.teamType && (
                <div className="col-12 md:col-6">
                  <label className="font-bold block text-secondary">
                    Tipo de Equipo
                  </label>
                  <Tag
                    value={
                      teamTypeLabels[entity.details.teamType] ||
                      entity.details.teamType
                    }
                  />
                </div>
              )}
            </div>
          </AccordionTab>
        ))}
      </Accordion>
    </Panel>
  );
};

/**
 * Sección de pagos del período
 */
const PaymentsSection = ({ payments }) => {
  if (!payments || payments.length === 0) {
    return (
      <Panel header="Pagos del Período" className="mb-3">
        <div className="text-center p-3 text-secondary">
          <i className="pi pi-money-bill text-3xl mb-2"></i>
          <p>No hay pagos registrados en este período</p>
        </div>
      </Panel>
    );
  }

  // Calcular resúmenes
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidCount = payments.filter((p) => p.paidDate).length;
  const pendingCount = payments.length - paidCount;
  const currencies = [
    ...new Set(payments.map((p) => p.currency).filter(Boolean)),
  ];

  return (
    <Panel header="Pagos del Período" className="mb-3">
      <div className="grid mb-3">
        <div className="col-12 md:col-3">
          <div className="p-3 surface-200 border-round text-center">
            <span className="text-secondary block">Total Pagos</span>
            <span className="text-2xl font-bold">{payments.length}</span>
          </div>
        </div>
        <div className="col-12 md:col-3">
          <div className="p-3 surface-200 border-round text-center">
            <span className="text-secondary block">Pagados</span>
            <span className="text-2xl font-bold text-green-600">
              {paidCount}
            </span>
          </div>
        </div>
        <div className="col-12 md:col-3">
          <div className="p-3 surface-200 border-round text-center">
            <span className="text-secondary block">Pendientes</span>
            <span className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </span>
          </div>
        </div>
        <div className="col-12 md:col-3">
          <div className="p-3 surface-200 border-round text-center">
            <span className="text-secondary block">Monto Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(totalAmount, currencies[0] || "USD")}
            </span>
          </div>
        </div>
      </div>

      <DataTable
        value={payments}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25]}
        emptyMessage="No hay pagos para mostrar"
        className="p-datatable-sm"
        size="small"
      >
        <Column field="id" header="ID" sortable style={{ width: "80px" }} />
        <Column
          header="Trabajador"
          body={paymentWorkerTemplate}
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column
          header="Monto"
          body={paymentAmountTemplate}
          sortable
          style={{ width: "150px" }}
        />
        <Column
          header="Concepto"
          body={paymentConceptTemplate}
          sortable
          style={{ width: "120px" }}
        />
        <Column
          header="Método"
          body={paymentMethodTemplate}
          sortable
          style={{ width: "120px" }}
        />
        <Column
          header="Estado"
          body={paymentStatusTemplate}
          sortable
          style={{ width: "120px" }}
        />
        <Column
          field="paidDate"
          header="Fecha Pago"
          body={(rowData) =>
            rowData.paidDate ? formatDate(rowData.paidDate) : "—"
          }
          sortable
          style={{ width: "120px" }}
        />
      </DataTable>
    </Panel>
  );
};

/**
 * Sección de auditoría
 */
const AuditSection = ({ period }) => (
  <Panel header="Auditoría" className="mb-3">
    <div className="grid">
      <div className="col-12 md:col-6">
        <label className="font-bold block text-secondary">Creado por</label>
        <div className="flex flex-column">
          <span className="font-medium">
            {period.createdBy?.name || period.createdBy?.email || "Sistema"}
          </span>
          <small className="text-secondary">
            {formatDate(period.createdAt, true)}
          </small>
        </div>
      </div>

      <div className="col-12 md:col-6">
        <label className="font-bold block text-secondary">
          Última actualización
        </label>
        <div className="flex flex-column">
          <span className="font-medium">
            {period.updatedBy?.name || period.updatedBy?.email || "Sistema"}
          </span>
          <small className="text-secondary">
            {formatDate(period.updatedAt, true)}
          </small>
        </div>
      </div>

      {period.deletedAt && (
        <div className="col-12">
          <Divider />
          <div className="field">
            <label className="font-bold block text-secondary text-danger">
              Eliminado
            </label>
            <div className="flex flex-column">
              <span className="font-medium">
                {period.deletedBy?.name || period.deletedBy?.email || "Sistema"}
              </span>
              <small className="text-secondary">
                {formatDate(period.deletedAt, true)}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  </Panel>
);

// ==================== COMPONENTE PRINCIPAL ====================

export const PayrollPeriodDetailForm = ({
  payrollPeriodId,
  visible,
  onHide,
}) => {
  const [getPayrollPeriod, { data, loading, error }] = useLazyQuery(
    GET_PAYROLL_PERIOD_BY_ID,
    {
      variables: { id: payrollPeriodId },
      fetchPolicy: "network-only",
    },
  );

  React.useEffect(() => {
    if (visible && payrollPeriodId) {
      getPayrollPeriod();
    }
  }, [visible, payrollPeriodId, getPayrollPeriod]);

  const period = data?.payrollPeriod;

  return (
    <Dialog
      header="Detalles del Período de Nómina"
      visible={visible}
      style={{ width: "1000px", maxWidth: "95vw" }}
      onHide={onHide}
      modal
      className="payroll-period-detail-dialog"
      maximizable
    >
      {loading ? (
        <div className="flex justify-content-center align-items-center p-5">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <div className="p-3 bg-red-50 border-round text-red-600">
          <i className="pi pi-exclamation-triangle mr-2"></i>
          Error al cargar los detalles del período: {error.message}
        </div>
      ) : period ? (
        <div className="payroll-period-detail">
          {/* Badge de estado principal */}
          <div className="flex justify-content-between align-items-center mb-3">
            <Badge value={`ID: ${period.id}`} size="large" severity="info" />
            {period.isClosed ? (
              <Tag
                value="CERRADO"
                severity="danger"
                icon="pi pi-lock"
                size="large"
              />
            ) : (
              <Tag
                value="ABIERTO"
                severity="success"
                icon="pi pi-lock-open"
                size="large"
              />
            )}
          </div>

          <Divider />

          {/* Secciones de información */}
          <GeneralInfoSection period={period} />
          <DateRangeSection period={period} />
          <SecurityEntitiesSection period={period} />
          <PaymentsSection payments={period.payments} />
          <AuditSection period={period} />
        </div>
      ) : (
        <div className="text-center p-5 text-secondary">
          <i className="pi pi-info-circle text-4xl mb-3"></i>
          <p>No se encontró información del período de nómina solicitado.</p>
        </div>
      )}

      <style jsx="true">{`
        .payroll-period-detail-dialog .field {
          margin-bottom: 1rem;
        }

        .payroll-period-detail-dialog .field label {
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .payroll-period-detail-dialog .p-panel .p-panel-header {
          padding: 0.75rem 1rem;
        }

        .payroll-period-detail-dialog .p-panel .p-panel-content {
          padding: 1rem;
        }

        .payroll-period-detail-dialog .p-accordion .p-accordion-header {
          padding: 0.5rem;
        }

        .payroll-period-detail-dialog
          .p-datatable
          .p-datatable-thead
          > tr
          > th {
          padding: 0.5rem;
          font-size: 0.875rem;
        }

        .payroll-period-detail-dialog
          .p-datatable
          .p-datatable-tbody
          > tr
          > td {
          padding: 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
    </Dialog>
  );
};
