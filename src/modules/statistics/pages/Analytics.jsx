import { useMemo } from "react";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import {
  InfoRow,
  LoadingScreen,
  NoData,
  PageHeader,
  RankingList,
  StatCard,
} from "../../../components/ui";
import { ChartCard } from "../components/ChartCard";
import { StatisticsFilters } from "../components/StatisticsFilters";
import { DASHBOARD_STATISTICS } from "../graphql/queries";
import { useStatistics } from "../hooks/useStatistics";
import { getAxis, getBaseChartOptions, getChartColors } from "../chartTheme";
import {
  ATTENDANCE_LABELS,
  formatChange,
  formatCompact,
  formatMoney,
  formatNumber,
  formatSeriesLabel,
  getChange,
} from "../format";

/** Texto de la variación de un indicador frente al periodo anterior */
const describeChange = (current, previous) => {
  const change = getChange(current, previous);
  if (change !== null) return { change, changeLabel: formatChange(change) };
  if (current > 0) return { change: 1, changeLabel: "Nuevo" };
  return {};
};

/**
 * Resumen del negocio: cómo van los ingresos y qué requiere atención
 */
export function Analytics() {
  const { statistics, loading, updatedAt, error, refetch, filters } =
    useStatistics(
    DASHBOARD_STATISTICS,
    "dashboardStatistics"
  );

  const revenueChart = useMemo(() => {
    if (!statistics) return null;

    const colors = getChartColors();
    const { granularity } = statistics.period;

    return {
      data: {
        labels: statistics.revenueSeries.map((point) =>
          formatSeriesLabel(point.period, granularity)
        ),
        datasets: [
          {
            label: "Ingresos",
            data: statistics.revenueSeries.map((point) => point.revenue),
            borderColor: colors.primary,
            backgroundColor: colors.area,
            pointBackgroundColor: colors.primary,
            pointRadius: statistics.revenueSeries.length > 45 ? 0 : 3,
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        ...getBaseChartOptions(colors, { legend: false }),
        scales: {
          x: getAxis(colors, { grid: false }),
          y: {
            ...getAxis(colors, { format: (value) => formatCompact(value) }),
            beginAtZero: true,
          },
        },
      },
    };
  }, [statistics]);

  const header = (
    <PageHeader
      title="Resumen del negocio"
      subtitle="Ingresos del periodo y lo que requiere tu atención."
    />
  );

  if (!statistics && loading) {
    return (
      <>
        {header}
        <LoadingScreen message="Calculando estadísticas..." />
      </>
    );
  }

  if (!statistics) {
    return (
      <>
        {header}
        <StatisticsFilters
          filters={filters}
          loading={loading}
          updatedAt={updatedAt}
          onRefresh={refetch}
        />
        {error ? (
          <Message
            severity="error"
            text="No se pudieron cargar las estadísticas. Inténtalo de nuevo."
            className="w-full"
          />
        ) : (
          <NoData message="Elige las dos fechas del periodo para ver el resumen" />
        )}
      </>
    );
  }

  const { currency } = statistics.period;
  const hasSales = statistics.salesCount > 0;
  const alertsCount =
    statistics.lowStockCount +
    statistics.draftSalesCount +
    statistics.pendingWorkerPayments.length;
  const attendanceTotal = statistics.attendance.reduce(
    (sum, row) => sum + row.count,
    0
  );

  return (
    <>
      {header}
      <StatisticsFilters
        filters={filters}
        loading={loading}
        updatedAt={updatedAt}
        onRefresh={refetch}
      />

      {error && (
        <Message
          severity="error"
          text="No se pudieron actualizar las estadísticas. Se muestran las últimas disponibles."
          className="w-full mb-4"
        />
      )}

      <div className="grid">
        <div className="col-12 md:col-6 xl:col-3">
          <StatCard
            label="Ingresos"
            icon="pi pi-wallet"
            value={formatMoney(statistics.revenue, currency)}
            hint="Sin ventas confirmadas en el periodo"
            {...describeChange(statistics.revenue, statistics.previousRevenue)}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <StatCard
            label="Ventas confirmadas"
            icon="pi pi-shopping-cart"
            value={formatNumber(statistics.salesCount)}
            hint="Sin ventas confirmadas en el periodo"
            {...describeChange(
              statistics.salesCount,
              statistics.previousSalesCount
            )}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <StatCard
            label="Ticket promedio"
            icon="pi pi-receipt"
            value={formatMoney(statistics.averageTicket, currency)}
            hint="Ingreso medio por venta"
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <StatCard
            label="Devoluciones"
            icon="pi pi-replay"
            value={formatNumber(statistics.refundedSalesCount)}
            hint={`${formatNumber(statistics.cancelledSalesCount)} ventas canceladas`}
          />
        </div>

        <div className="col-12 xl:col-8">
          <ChartCard
            title="Evolución de los ingresos"
            subTitle={
              currency
                ? `Ventas confirmadas, en ${currency}`
                : "Ventas confirmadas"
            }
            type="line"
            data={revenueChart.data}
            options={revenueChart.options}
            empty={!hasSales}
            emptyMessage="No hay ventas confirmadas en este periodo"
            tall
          />
        </div>

        <div className="col-12 xl:col-4">
          <Card
            title="Requiere atención"
            subTitle="Estado actual, sin importar el periodo"
            className="h-full"
          >
            {alertsCount === 0 ? (
              <NoData message="Todo en orden: no hay pendientes" />
            ) : (
              <ul className="ui-info-list">
                {statistics.lowStockCount > 0 && (
                  <InfoRow
                    icon="pi pi-box"
                    label="Existencias bajas"
                    detail="Productos en su mínimo o por debajo"
                  >
                    <Tag
                      severity="danger"
                      value={formatNumber(statistics.lowStockCount)}
                    />
                  </InfoRow>
                )}
                {statistics.draftSalesCount > 0 && (
                  <InfoRow
                    icon="pi pi-file-edit"
                    label="Ventas en borrador"
                    detail="Iniciadas y sin confirmar"
                  >
                    <Tag
                      severity="warning"
                      value={formatNumber(statistics.draftSalesCount)}
                    />
                  </InfoRow>
                )}
                {statistics.pendingWorkerPayments.map((payment) => (
                  <InfoRow
                    key={payment.currency}
                    icon="pi pi-users"
                    label="Pagos pendientes a trabajadores"
                    detail={`${formatNumber(payment.count)} pagos por realizar`}
                  >
                    {formatMoney(payment.amount, payment.currency)}
                  </InfoRow>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="col-12 xl:col-4">
          <Card
            title="Existencias por reponer"
            subTitle="Las más urgentes primero"
            className="h-full"
          >
            <RankingList
              emptyMessage="Ningún producto está por debajo de su mínimo"
              items={statistics.lowStock.map((item) => ({
                key: item.inventoryId,
                name: item.product,
                detail: item.location,
                value: item.minStock > 0 ? item.currentStock / item.minStock : 0,
                valueLabel: `${formatNumber(item.currentStock)} de ${formatNumber(item.minStock)} mín.`,
              }))}
            />
          </Card>
        </div>

        <div className="col-12 md:col-6 xl:col-4">
          <Card
            title="Nómina"
            subTitle="Pagado a trabajadores en el periodo"
            className="h-full"
          >
            {statistics.payrollPaid.length === 0 ? (
              <NoData message="No se registraron pagos en este periodo" />
            ) : (
              <ul className="ui-info-list">
                {statistics.payrollPaid.map((payment) => (
                  <InfoRow
                    key={payment.currency}
                    icon="pi pi-money-bill"
                    label={`Pagado en ${payment.currency}`}
                    detail={`${formatNumber(payment.count)} pagos realizados`}
                  >
                    {formatMoney(payment.amount, payment.currency)}
                  </InfoRow>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="col-12 md:col-6 xl:col-4">
          <Card
            title="Asistencia"
            subTitle="Registros del periodo"
            className="h-full"
          >
            <RankingList
              emptyMessage="No hay registros de asistencia en este periodo"
              items={statistics.attendance.map((row) => ({
                key: row.key,
                name: ATTENDANCE_LABELS[row.key] ?? row.key,
                value: row.count,
                valueLabel: `${formatNumber(row.count)} (${formatNumber(
                  Math.round((row.count / attendanceTotal) * 100)
                )} %)`,
              }))}
            />
          </Card>
        </div>

        <div className="col-12 md:col-4">
          <StatCard
            label="Trabajadores"
            icon="pi pi-id-card"
            value={formatNumber(statistics.activeWorkersCount)}
            hint="Registrados en nómina"
          />
        </div>
        <div className="col-12 md:col-4">
          <StatCard
            label="Productos"
            icon="pi pi-tags"
            value={formatNumber(statistics.productsCount)}
            hint="En el catálogo"
          />
        </div>
        <div className="col-12 md:col-4">
          <StatCard
            label="Clientes"
            icon="pi pi-user"
            value={formatNumber(statistics.customersCount)}
            hint="Registrados"
          />
        </div>
      </div>
    </>
  );
}
