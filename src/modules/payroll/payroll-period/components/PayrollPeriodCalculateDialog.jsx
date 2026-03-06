// payroll-period/components/PayrollPeriodCalculateDialog.jsx
import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { useMutation } from "@apollo/client";
import {
  PROCESS_PERIOD_PAYMENTS,
  PROCESS_PERIOD_SALES,
} from "../graphql/queries";

export const PayrollPeriodCalculateDialog = ({
  period,
  visible,
  onHide,
  onSuccess,
}) => {
  const toast = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Estados para los resultados - ahora serán específicos del período
  const [paymentResults, setPaymentResults] = useState(null);
  const [salesResults, setSalesResults] = useState(null);

  // Estados de carga
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);

  const [processPeriodPayments] = useMutation(PROCESS_PERIOD_PAYMENTS);
  const [processPeriodSales] = useMutation(PROCESS_PERIOD_SALES);

  // Limpiar resultados cuando cambia el período o se cierra el diálogo
  useEffect(() => {
    if (!visible) {
      // Cuando se cierra el diálogo, limpiamos todos los resultados
      setPaymentResults(null);
      setSalesResults(null);
      setActiveIndex(0); // Reset a la primera pestaña
    }
  }, [visible]);

  useEffect(() => {
    if (period?.id) {
      // Cuando cambia el período, limpiamos los resultados anteriores
      setPaymentResults(null);
      setSalesResults(null);
      setActiveIndex(0);
    }
  }, [period?.id]);

  const handleCalculatePayments = async () => {
    if (!period?.id) return;

    setLoadingPayments(true);
    setPaymentResults(null); // Limpiar resultados anteriores antes de calcular

    try {
      const { data } = await processPeriodPayments({
        variables: {
          input: {
            payrollPeriodId: period.id,
          },
        },
      });

      setPaymentResults(data?.processPeriodPayments);

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: `Cálculo de pagos fijos completado. ${data?.processPeriodPayments?.successCount} exitosos, ${data?.processPeriodPayments?.errorCount} errores.`,
        life: 5000,
      });

      // Notificar al padre que se completó un cálculo exitosamente
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Error al calcular pagos fijos: ${err.message}`,
        life: 5000,
      });
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleCalculateSales = async () => {
    if (!period?.id) return;

    setLoadingSales(true);
    setSalesResults(null); // Limpiar resultados anteriores antes de calcular

    try {
      const { data } = await processPeriodSales({
        variables: {
          payrollPeriodId: period.id,
        },
      });

      setSalesResults(data?.processPeriodSales);

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: `Cálculo de pagos por ventas completado. ${data?.processPeriodSales?.successful} de ${data?.processPeriodSales?.totalSales} ventas procesadas.`,
        life: 5000,
      });

      // Notificar al padre que se completó un cálculo exitosamente
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Error al calcular pagos por ventas: ${err.message}`,
        life: 5000,
      });
    } finally {
      setLoadingSales(false);
    }
  };

  // Templates para las tablas
  const statusBodyTemplate = (rowData) => {
    const severity = rowData.status === "SUCCESS" ? "success" : "danger";
    return (
      <Tag
        value={rowData.status}
        severity={severity}
        icon={rowData.status === "SUCCESS" ? "pi pi-check" : "pi pi-times"}
      />
    );
  };

  const errorBodyTemplate = (rowData) => {
    if (!rowData.errors || rowData.errors.length === 0) return "—";
    return (
      <div className="flex flex-column">
        {rowData.errors.map((error, index) => (
          <small key={index} className="text-red-500">
            {error}
          </small>
        ))}
      </div>
    );
  };

  const saleStatusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.success ? "Éxito" : "Falló"}
        severity={rowData.success ? "success" : "danger"}
        icon={rowData.success ? "pi pi-check" : "pi pi-times"}
      />
    );
  };

  const amountBodyTemplate = (rowData) => {
    const amount = rowData.amount || rowData.totalAmount || 0;
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const workerNameBodyTemplate = (rowData) => {
    return rowData.workerName || `Trabajador #${rowData.workerId}`;
  };

  const conceptBodyTemplate = (rowData) => {
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

  const footer = (
    <div>
      <Button
        label="Cerrar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
    </div>
  );

  const headerElement = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-calculator" style={{ fontSize: "1.5rem" }}></i>
      <span className="text-xl font-bold">
        Calcular Pagos: {period?.name || "Período de Nómina"}
      </span>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={headerElement}
        visible={visible}
        style={{ width: "80vw", maxWidth: "1200px" }}
        footer={footer}
        onHide={onHide}
        modal
        maximizable
        closable
      >
        <TabView
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
        >
          {/* Pestaña de Pagos Fijos */}
          <TabPanel
            header="Pagos Fijos"
            leftIcon="pi pi-money-bill mr-2"
          >
            <div className="flex flex-column gap-3">
              <div className="flex justify-content-between align-items-center">
                <span className="text-secondary">
                  Calcular pagos basados en salarios base y reglas de pago
                </span>
                <Button
                  label="Calcular Pagos Fijos"
                  icon="pi pi-calculator"
                  onClick={handleCalculatePayments}
                  loading={loadingPayments}
                  disabled={loadingSales || !period?.id}
                  className="p-button-primary"
                />
              </div>

              <Divider />

              {loadingPayments && (
                <div className="flex justify-content-center p-4">
                  <ProgressSpinner />
                </div>
              )}

              {paymentResults && (
                <div className="flex flex-column gap-3">
                  <div className="grid">
                    <div className="col-4">
                      <div className="p-3 surface-200 border-round text-center">
                        <span className="text-secondary block">
                          Total Procesados
                        </span>
                        <span className="text-2xl font-bold">
                          {paymentResults.totalCount}
                        </span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 surface-200 border-round text-center">
                        <span className="text-secondary block">Exitosos</span>
                        <span className="text-2xl font-bold text-green-600">
                          {paymentResults.successCount}
                        </span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 surface-200 border-round text-center">
                        <span className="text-secondary block">
                          Con Errores
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                          {paymentResults.errorCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DataTable
                    value={paymentResults.data}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage="No hay resultados para mostrar"
                    className="p-datatable-sm"
                  >
                    <Column
                      field="workerId"
                      header="ID Trabajador"
                      sortable
                      style={{ width: "120px" }}
                    />
                    <Column
                      header="Trabajador"
                      body={workerNameBodyTemplate}
                      sortable
                      style={{ minWidth: "200px" }}
                    />
                    <Column
                      header="Concepto"
                      body={conceptBodyTemplate}
                      sortable
                      style={{ width: "120px" }}
                    />
                    <Column
                      header="Monto"
                      body={amountBodyTemplate}
                      sortable
                      style={{ width: "150px" }}
                    />
                    <Column
                      field="currency"
                      header="Moneda"
                      sortable
                      style={{ width: "100px" }}
                    />
                    <Column
                      header="Estado"
                      body={statusBodyTemplate}
                      sortable
                      style={{ width: "120px" }}
                    />
                    <Column
                      header="Errores"
                      body={errorBodyTemplate}
                      style={{ minWidth: "200px" }}
                    />
                  </DataTable>
                </div>
              )}

              {!loadingPayments && !paymentResults && (
                <div className="text-center p-4 surface-200 border-round">
                  <i className="pi pi-info-circle text-3xl text-secondary mb-2"></i>
                  <p className="text-secondary">
                    Haz clic en "Calcular Pagos Fijos" para procesar los pagos
                    del período
                  </p>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Pestaña de Pagos por Ventas */}
          <TabPanel header="Pagos por Ventas" leftIcon="pi pi-chart-line mr-2">
            <div className="flex flex-column gap-3">
              <div className="flex justify-content-between align-items-center">
                <span className="text-secondary">
                  Calcular comisiones y pagos basados en ventas del período
                </span>
                <Button
                  label="Calcular Pagos por Ventas"
                  icon="pi pi-calculator"
                  onClick={handleCalculateSales}
                  loading={loadingSales}
                  disabled={loadingPayments || !period?.id}
                  className="p-button-success"
                />
              </div>

              <Divider />

              {loadingSales && (
                <div className="flex justify-content-center p-4">
                  <ProgressSpinner />
                </div>
              )}

              {salesResults && (
                <div className="flex flex-column gap-3">
                  <div className="grid">
                    <div className="col-3">
                      <div className="p-3 surface-200 border-round text-center">
                        <span className="text-secondary block">
                          Ventas Totales
                        </span>
                        <span className="text-2xl font-bold">
                          {salesResults.totalSales}
                        </span>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-3 surface-200 border-round text-center">
                        <span className="text-secondary block">Exitosas</span>
                        <span className="text-2xl font-bold text-green-600">
                          {salesResults.successful}
                        </span>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-3 surface-200 border-round text-center">
                        <span className="text-secondary block">Fallidas</span>
                        <span className="text-2xl font-bold text-red-600">
                          {salesResults.failed}
                        </span>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-3 surface-200 border-round text-center">
                        <span className="text-secondary block">
                          Total Pagos Creados
                        </span>
                        <span className="text-2xl font-bold">
                          {salesResults.totalPaymentsCreated}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid">
                    <div className="col-12">
                      <div className="p-3 surface-200 border-round text-center">
                        <span className="text-secondary block">
                          Monto Total Pagado
                        </span>
                        <span className="text-3xl font-bold text-primary">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "USD",
                          }).format(salesResults.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DataTable
                    value={salesResults.results}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage="No hay resultados para mostrar"
                    className="p-datatable-sm"
                  >
                    <Column
                      field="saleId"
                      header="ID Venta"
                      sortable
                      style={{ width: "120px" }}
                    />
                    <Column
                      header="Estado"
                      body={saleStatusBodyTemplate}
                      sortable
                      style={{ width: "120px" }}
                    />
                    <Column
                      field="paymentsCreated"
                      header="Pagos Creados"
                      sortable
                      style={{ width: "150px" }}
                    />
                    <Column
                      header="Monto Total"
                      body={amountBodyTemplate}
                      sortable
                      style={{ width: "150px" }}
                    />
                    <Column
                      field="error"
                      header="Error"
                      style={{ minWidth: "250px" }}
                    />
                  </DataTable>
                </div>
              )}

              {!loadingSales && !salesResults && (
                <div className="text-center p-4 surface-200 border-round">
                  <i className="pi pi-info-circle text-3xl text-secondary mb-2"></i>
                  <p className="text-secondary">
                    Haz clic en "Calcular Pagos por Ventas" para procesar las
                    ventas del período
                  </p>
                </div>
              )}
            </div>
          </TabPanel>
        </TabView>
      </Dialog>
    </>
  );
};
