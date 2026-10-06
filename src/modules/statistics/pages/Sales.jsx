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
import { SALES_STATISTICS } from "../graphql/queries";
import { useStatistics } from "../hooks/useStatistics";
import { getAxis, getBaseChartOptions, getChartColors } from "../chartTheme";
import {
  formatMoney,
  formatNumber,
  PAYMENT_METHOD_LABELS,
  SALE_STATUS,
} from "../format";

const pluralize = (count, singular, plural) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;

/**
 * Reporte de ventas: qué se vende, quién vende, a quién y cómo se cobra
 */
export function Sales() {
  const { statistics, loading, updatedAt, error, refetch, filters } =
    useStatistics(
    SALES_STATISTICS,
    "salesStatistics"
  );

  const charts = useMemo(() => {
    if (!statistics) return null;

    const colors = getChartColors();

    return {
      products: {
        data: {
          labels: statistics.topProducts.map((product) => product.name),
          datasets: [
            {
              label: "Unidades vendidas",
              data: statistics.topProducts.map((product) => product.quantity),
              backgroundColor: colors.primary,
              borderRadius: 4,
              maxBarThickness: 22,
            },
          ],
        },
        options: {
          ...getBaseChartOptions(colors, { legend: false }),
          indexAxis: "y",
          scales: {
            x: { ...getAxis(colors), beginAtZero: true },
            y: getAxis(colors, { grid: false }),
          },
        },
      },
      categories: {
        data: {
          labels: statistics.byCategory.map((category) => category.name),
          datasets: [
            {
              data: statistics.byCategory.map((category) => category.quantity),
              backgroundColor: colors.series,
              borderColor: colors.surface,
              borderWidth: 2,
            },
          ],
        },
        options: { ...getBaseChartOptions(colors), cutout: "62%" },
      },
    };
  }, [statistics]);

  const header = (
    <PageHeader
      title="Reporte de ventas"
      subtitle="Qué se vende, quién vende, a quién y cómo se cobra."
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
          <NoData message="Elige las dos fechas del periodo para ver el reporte" />
        )}
      </>
    );
  }

  const { currency } = statistics.period;
  const customersCount =
    statistics.newCustomersCount + statistics.returningCustomersCount;

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
            hint="Ventas confirmadas del periodo"
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <StatCard
            label="Ventas confirmadas"
            icon="pi pi-shopping-cart"
            value={formatNumber(statistics.salesCount)}
            hint={`${formatNumber(statistics.anonymousSalesCount)} sin cliente registrado`}
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
            label="Con mensajería"
            icon="pi pi-truck"
            value={formatNumber(statistics.deliveriesCount)}
            hint="Ventas entregadas a domicilio"
          />
        </div>

        <div className="col-12 xl:col-8">
          <ChartCard
            title="Productos más vendidos"
            subTitle="Unidades vendidas en el periodo"
            type="bar"
            data={charts.products.data}
            options={charts.products.options}
            empty={statistics.topProducts.length === 0}
            emptyMessage="No se vendieron productos en este periodo"
            tall
          />
        </div>

        <div className="col-12 xl:col-4">
          <ChartCard
            title="Ventas por categoría"
            subTitle="Unidades vendidas"
            type="doughnut"
            data={charts.categories.data}
            options={charts.categories.options}
            empty={statistics.byCategory.length === 0}
            emptyMessage="No hay ventas por categoría en este periodo"
            tall
          />
        </div>

        <div className="col-12 md:col-6 xl:col-4">
          <Card
            title="Ventas por vendedor"
            subTitle="Ingresos generados"
            className="h-full"
          >
            <RankingList
              emptyMessage="Ningún vendedor registró ventas en este periodo"
              items={statistics.bySeller.map((seller) => ({
                key: seller.id ?? seller.name,
                name: seller.name,
                detail: pluralize(seller.count, "venta", "ventas"),
                value: seller.amount,
                valueLabel: formatMoney(seller.amount, currency),
              }))}
            />
          </Card>
        </div>

        <div className="col-12 md:col-6 xl:col-4">
          <Card
            title="Mejores clientes"
            subTitle="Por importe comprado"
            className="h-full"
          >
            <RankingList
              emptyMessage="No hay compras de clientes registrados en este periodo"
              items={statistics.topCustomers.map((customer) => ({
                key: customer.id,
                name: customer.name,
                detail: pluralize(customer.count, "compra", "compras"),
                value: customer.amount,
                valueLabel: formatMoney(customer.amount, currency),
              }))}
            />
          </Card>
        </div>

        <div className="col-12 xl:col-4">
          <Card
            title="Métodos de pago"
            subTitle="Importe cobrado con cada uno"
            className="h-full"
          >
            <RankingList
              emptyMessage="No hay cobros registrados en este periodo"
              items={statistics.byPaymentMethod.map((method) => ({
                key: method.key,
                name: PAYMENT_METHOD_LABELS[method.key] ?? method.key,
                detail: pluralize(method.count, "cobro", "cobros"),
                value: method.amount,
                valueLabel: formatMoney(method.amount, currency),
              }))}
            />
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card
            title="Clientes"
            subTitle="Quiénes compraron en el periodo"
            className="h-full"
          >
            {customersCount + statistics.anonymousSalesCount === 0 ? (
              <NoData message="No hay compras en este periodo" />
            ) : (
              <ul className="ui-info-list">
                <InfoRow
                  icon="pi pi-user-plus"
                  label="Clientes nuevos"
                  detail="Compraron por primera vez"
                >
                  {formatNumber(statistics.newCustomersCount)}
                </InfoRow>
                <InfoRow
                  icon="pi pi-sync"
                  label="Clientes recurrentes"
                  detail="Ya habían comprado antes"
                >
                  {formatNumber(statistics.returningCustomersCount)}
                </InfoRow>
                <InfoRow
                  icon="pi pi-question-circle"
                  label="Ventas sin cliente"
                  detail="No se registró quién compró"
                >
                  {formatNumber(statistics.anonymousSalesCount)}
                </InfoRow>
              </ul>
            )}
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card
            title="Estado de las ventas"
            subTitle="Todas las ventas del periodo, en cualquier moneda"
            className="h-full"
          >
            {statistics.byStatus.length === 0 ? (
              <NoData message="No se registraron ventas en este periodo" />
            ) : (
              <ul className="ui-info-list">
                {statistics.byStatus.map((status) => (
                  <InfoRow
                    key={status.key}
                    label={
                      <Tag
                        severity={SALE_STATUS[status.key]?.severity}
                        value={SALE_STATUS[status.key]?.label ?? status.key}
                      />
                    }
                  >
                    {pluralize(status.count, "venta", "ventas")}
                  </InfoRow>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
