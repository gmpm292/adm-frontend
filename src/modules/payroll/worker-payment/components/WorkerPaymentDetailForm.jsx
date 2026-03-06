import React from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_WORKER_PAYMENT_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Badge } from "primereact/badge";
import { Chip } from "primereact/chip";

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

const workerTypeLabels = {
  PUBLICIST: "Publicista",
  ECONOMIC: "Económico",
  SERVICE: "Servicio",
  COURIER: "Mensajero",
  TECHNICIAN: "Técnico",
  OPERATIVE: "Operativo",
  COMMUNITY_MANAGER: "Community Manager",
  PRINCIPAL: "Principal",
  ADMINISTRATIVE: "Administrativo",
  MANAGER: "Gerente",
  SUPERVISOR: "Supervisor",
  AGENT: "Agente",
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

// ==================== COMPONENTES SECCIÓN ====================

/**
 * Sección de información general
 */
const GeneralInfoSection = ({ payment }) => (
  <Panel header="Información General" className="mb-3">
    <div className="grid">
      <div className="col-12 md:col-6 lg:col-3">
        <div className="field">
          <label className="font-bold block text-secondary">ID del Pago</label>
          <Badge value={`#${payment.id}`} size="large" severity="info" />
        </div>
      </div>

      <div className="col-12 md:col-6 lg:col-3">
        <div className="field">
          <label className="font-bold block text-secondary">Monto</label>
          <span className="text-xl font-bold">
            {formatCurrency(payment.amount, payment.currency)}
          </span>
          {payment.exchangeRate && payment.exchangeRate !== 1 && (
            <div className="text-sm text-secondary">
              Tasa de cambio: {payment.exchangeRate}
            </div>
          )}
        </div>
      </div>

      <div className="col-12 md:col-6 lg:col-3">
        <div className="field">
          <label className="font-bold block text-secondary">Moneda</label>
          <Chip label={payment.currency || "USD"} />
        </div>
      </div>

      <div className="col-12 md:col-6 lg:col-3">
        <div className="field">
          <label className="font-bold block text-secondary">Estado</label>
          <Tag
            value={payment.paidDate ? "Pagado" : "Pendiente"}
            severity={payment.paidDate ? "success" : "warning"}
            icon={payment.paidDate ? "pi pi-check" : "pi pi-clock"}
            className="text-base"
          />
        </div>
      </div>
    </div>
  </Panel>
);

/**
 * Sección de tipo y método de pago
 */
const PaymentTypeSection = ({ payment }) => (
  <Panel header="Tipo y Método de Pago" className="mb-3">
    <div className="grid">
      <div className="col-12 md:col-4">
        <div className="field">
          <label className="font-bold block text-secondary">Concepto</label>
          <Tag
            value={
              paymentConceptLabels[payment.paymentConcept] ||
              payment.paymentConcept
            }
            severity={
              paymentConceptSeverities[payment.paymentConcept] || "secondary"
            }
            className="text-base"
          />
        </div>
      </div>

      <div className="col-12 md:col-4">
        <div className="field">
          <label className="font-bold block text-secondary">Método</label>
          <Tag
            value={
              paymentMethodLabels[payment.paymentMethod] ||
              payment.paymentMethod
            }
            severity={
              paymentMethodSeverities[payment.paymentMethod] || "secondary"
            }
            className="text-base"
          />
        </div>
      </div>

      <div className="col-12 md:col-4">
        <div className="field">
          <label className="font-bold block text-secondary">
            Fecha de Pago
          </label>
          <span>
            {payment.paidDate
              ? formatDate(payment.paidDate, true)
              : "No pagado"}
          </span>
        </div>
      </div>
    </div>
  </Panel>
);

/**
 * Sección del trabajador
 */
const WorkerSection = ({ worker }) => {
  if (!worker) return null;

  const fullName = getWorkerFullName(worker);
  const workerType =
    workerTypeLabels[worker.workerType] || worker.workerType || "N/A";

  return (
    <Panel header="Trabajador" className="mb-3">
      <div className="grid">
        <div className="col-12 md:col-6">
          <div className="field">
            <label className="font-bold block text-secondary">
              Nombre Completo
            </label>
            <span className="text-lg">{fullName}</span>
          </div>

          <div className="field">
            <label className="font-bold block text-secondary">
              Tipo de Trabajador
            </label>
            <Tag value={workerType} severity="info" />
          </div>

          {worker.workerType === "OTHER" && worker.otherType && (
            <div className="field">
              <label className="font-bold block text-secondary">
                Otro Tipo (especificado)
              </label>
              <span>{worker.otherType}</span>
            </div>
          )}
        </div>

        <div className="col-12 md:col-6">
          {worker.user ? (
            <>
              <div className="field">
                <label className="font-bold block text-secondary">
                  Usuario Asociado
                </label>
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-user"></i>
                  <span>{worker.user.email}</span>
                </div>
              </div>

              <div className="field">
                <label className="font-bold block text-secondary">Rol</label>
                <div className="flex flex-wrap gap-1">
                  {worker.user.role?.map((role) => (
                    <Chip key={role} label={role} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="field">
              <label className="font-bold block text-secondary">
                Trabajador Temporal
              </label>
              <div className="flex align-items-center gap-2">
                <i className="pi pi-user-plus"></i>
                <span>
                  {worker.tempEmail || "Sin email"} |{" "}
                  {worker.tempPhone || "Sin teléfono"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Divider />

      <div className="grid">
        <div className="col-12">
          <label className="font-bold block text-secondary">
            ID del Trabajador
          </label>
          <Badge value={`#${worker.id}`} severity="secondary" />
        </div>
      </div>
    </Panel>
  );
};

/**
 * Sección de período y venta
 */
const PeriodAndSaleSection = ({ payment }) => (
  <Panel header="Período y Venta" className="mb-3">
    <div className="grid">
      <div className="col-12 md:col-6">
        <label className="font-bold block text-secondary">
          Período de Nómina
        </label>
        {payment.payrollPeriod ? (
          <div className="flex flex-column">
            <span className="text-lg">{payment.payrollPeriod.name}</span>
            <small className="text-secondary">
              {formatDate(payment.payrollPeriod.startDate)} -{" "}
              {formatDate(payment.payrollPeriod.endDate)}
            </small>
            <small className="text-secondary">
              ID: {payment.payrollPeriod.id}
            </small>
          </div>
        ) : (
          <span>N/A</span>
        )}
      </div>

      <div className="col-12 md:col-6">
        <label className="font-bold block text-secondary">Venta Asociada</label>
        {payment.sale ? (
          <div className="flex flex-column">
            <span className="text-lg">Venta #{payment.sale.id}</span>
            <small className="text-secondary">
              Fecha: {formatDate(payment.sale.effectiveDate)}
            </small>
            <small className="text-secondary">
              Monto: {formatCurrency(payment.sale.totalAmount)}
            </small>
            {payment.sale.isConfirmed && (
              <Tag value="Confirmada" severity="success" className="mt-1" />
            )}
          </div>
        ) : (
          <span className="text-secondary">Pago no asociado a venta</span>
        )}
      </div>
    </div>
  </Panel>
);

/**
 * Sección de desglose (breakdown)
 */
const BreakdownSection = ({ breakdown }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return (
      <Panel header="Desglose" className="mb-3">
        <span className="text-secondary">
          No hay información de desglose disponible
        </span>
      </Panel>
    );
  }

  return (
    <Panel header="Desglose del Pago" className="mb-3">
      <Accordion>
        {/* Información de la regla */}
        {(breakdown.ruleName || breakdown.ruleType) && (
          <AccordionTab header="Información de la Regla">
            <div className="grid">
              {breakdown.ruleName && (
                <div className="col-12">
                  <label className="font-bold block text-secondary">
                    Regla
                  </label>
                  <span>{breakdown.ruleName}</span>
                </div>
              )}
              {breakdown.ruleType && (
                <div className="col-12">
                  <label className="font-bold block text-secondary">
                    Tipo de Regla
                  </label>
                  <Tag value={breakdown.ruleType} severity="info" />
                </div>
              )}
            </div>
          </AccordionTab>
        )}

        {/* Componentes del pago */}
        <AccordionTab header="Componentes">
          <div className="grid">
            {breakdown.baseSalary !== undefined && breakdown.baseSalary > 0 && (
              <div className="col-12 md:col-6">
                <label className="font-bold block text-secondary">
                  Salario Base
                </label>
                <span className="text-success">
                  {formatCurrency(breakdown.baseSalary)}
                </span>
              </div>
            )}

            {breakdown.commissions !== undefined &&
              breakdown.commissions > 0 && (
                <div className="col-12 md:col-6">
                  <label className="font-bold block text-secondary">
                    Comisiones
                  </label>
                  <span className="text-primary">
                    {formatCurrency(breakdown.commissions)}
                  </span>
                </div>
              )}

            {breakdown.bonuses !== undefined && breakdown.bonuses > 0 && (
              <div className="col-12 md:col-6">
                <label className="font-bold block text-secondary">Bonos</label>
                <span className="text-warning">
                  {formatCurrency(breakdown.bonuses)}
                </span>
              </div>
            )}

            {breakdown.deductions !== undefined && breakdown.deductions > 0 && (
              <div className="col-12 md:col-6">
                <label className="font-bold block text-secondary">
                  Deducciones
                </label>
                <span className="text-danger">
                  -{formatCurrency(breakdown.deductions)}
                </span>
              </div>
            )}
          </div>
        </AccordionTab>

        {/* Detalles de cálculo */}
        {breakdown.calculationSummary && (
          <AccordionTab header="Detalles del Cálculo">
            <pre className="bg-gray-100 p-3 border-round">
              {JSON.stringify(breakdown.calculationSummary, null, 2)}
            </pre>
          </AccordionTab>
        )}

        {/* Información adicional */}
        {Object.keys(breakdown).filter(
          (key) =>
            ![
              "ruleName",
              "ruleType",
              "baseSalary",
              "commissions",
              "bonuses",
              "deductions",
              "calculationSummary",
            ],
        ).length > 0 && (
          <AccordionTab header="Información Adicional">
            <pre className="bg-gray-100 p-3 border-round">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(breakdown).filter(
                    ([key]) =>
                      ![
                        "ruleName",
                        "ruleType",
                        "baseSalary",
                        "commissions",
                        "bonuses",
                        "deductions",
                        "calculationSummary",
                      ],
                  ),
                ),
                null,
                2,
              )}
            </pre>
          </AccordionTab>
        )}
      </Accordion>
    </Panel>
  );
};

/**
 * Sección de estructura organizativa
 */
const SecurityEntitiesSection = ({ payment }) => {
  const entities = [];

  if (payment.business)
    entities.push({
      type: "Negocio",
      name: payment.business.name,
      id: payment.business.id,
    });
  if (payment.office)
    entities.push({
      type: "Oficina",
      name: payment.office.name,
      id: payment.office.id,
    });
  if (payment.department)
    entities.push({
      type: "Departamento",
      name: payment.department.name,
      id: payment.department.id,
    });
  if (payment.team)
    entities.push({
      type: "Equipo",
      name: payment.team.name,
      id: payment.team.id,
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
      <div className="grid">
        {entities.map((entity, index) => (
          <div key={index} className="col-12 md:col-6 lg:col-3">
            <div className="field">
              <label className="font-bold block text-secondary">
                {entity.type}
              </label>
              <div className="flex flex-column">
                <span>{entity.name}</span>
                <small className="text-secondary">ID: {entity.id}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

/**
 * Sección de notas
 */
const NotesSection = ({ notes }) => {
  if (!notes) return null;

  return (
    <Panel header="Notas" className="mb-3">
      <div className="field">
        <p className="whitespace-pre-wrap bg-gray-50 p-3 border-round">
          {notes}
        </p>
      </div>
    </Panel>
  );
};

/**
 * Sección de auditoría
 */
const AuditSection = ({ payment }) => (
  <Panel header="Auditoría" className="mb-3">
    <div className="grid">
      <div className="col-12 md:col-6">
        <label className="font-bold block text-secondary">Creado por</label>
        <div className="flex flex-column">
          <span>{payment.createdBy?.name || "Sistema"}</span>
          <small className="text-secondary">
            {formatDate(payment.createdAt, true)}
          </small>
        </div>
      </div>

      <div className="col-12 md:col-6">
        <label className="font-bold block text-secondary">
          Última actualización
        </label>
        <div className="flex flex-column">
          <span>{payment.updatedBy?.name || "Sistema"}</span>
          <small className="text-secondary">
            {formatDate(payment.updatedAt, true)}
          </small>
        </div>
      </div>

      {payment.deletedAt && (
        <div className="col-12">
          <Divider />
          <div className="field">
            <label className="font-bold block text-secondary text-danger">
              Eliminado
            </label>
            <div className="flex flex-column">
              <span>{payment.deletedBy?.name || "Sistema"}</span>
              <small className="text-secondary">
                {formatDate(payment.deletedAt, true)}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  </Panel>
);

// ==================== COMPONENTE PRINCIPAL ====================

export const WorkerPaymentDetailForm = ({ paymentId, visible, onHide }) => {
  const [getWorkerPayment, { data, loading, error }] = useLazyQuery(
    GET_WORKER_PAYMENT_BY_ID,
    {
      variables: { id: paymentId },
      fetchPolicy: "network-only",
    },
  );

  React.useEffect(() => {
    if (visible && paymentId) {
      getWorkerPayment();
    }
  }, [visible, paymentId, getWorkerPayment]);

  const payment = data?.workerPayment;

  return (
    <Dialog
      header="Detalles del Pago al Trabajador"
      visible={visible}
      style={{ width: "900px", maxWidth: "95vw" }}
      onHide={onHide}
      modal
      className="worker-payment-detail-dialog"
    >
      {loading ? (
        <div className="flex justify-content-center align-items-center p-5">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <div className="p-3 bg-red-50 border-round text-red-600">
          <i className="pi pi-exclamation-triangle mr-2"></i>
          Error al cargar los detalles del pago: {error.message}
        </div>
      ) : payment ? (
        <div className="worker-payment-detail">
          {/* ID y estado general */}
          <div className="flex justify-content-between align-items-center mb-3">
            <Badge value={`ID: ${payment.id}`} size="large" severity="info" />
            {payment.paidDate ? (
              <Tag value="PAGADO" severity="success" icon="pi pi-check" />
            ) : (
              <Tag value="PENDIENTE" severity="warning" icon="pi pi-clock" />
            )}
          </div>

          <Divider />

          {/* Secciones de información */}
          <GeneralInfoSection payment={payment} />
          <PaymentTypeSection payment={payment} />
          <WorkerSection worker={payment.worker} />
          <PeriodAndSaleSection payment={payment} />
          <BreakdownSection breakdown={payment.breakdown} />
          <SecurityEntitiesSection payment={payment} />
          <NotesSection notes={payment.notes} />
          <AuditSection payment={payment} />
        </div>
      ) : (
        <div className="text-center p-5 text-secondary">
          <i className="pi pi-info-circle text-4xl mb-3"></i>
          <p>No se encontró información del pago solicitado.</p>
        </div>
      )}

      <style jsx="true">{`
        .worker-payment-detail-dialog .field {
          margin-bottom: 1rem;
        }

        .worker-payment-detail-dialog .field label {
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .worker-payment-detail-dialog .p-panel .p-panel-header {
          padding: 0.75rem 1rem;
        }

        .worker-payment-detail-dialog .p-panel .p-panel-content {
          padding: 1rem;
        }

        .worker-payment-detail-dialog pre {
          max-height: 300px;
          overflow: auto;
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
    </Dialog>
  );
};
