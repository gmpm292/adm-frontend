import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { NoData } from "../../../components/ui";

/**
 * Tarjeta con un gráfico. Sin datos muestra el aviso en vez del gráfico:
 * nunca se dibuja una gráfica vacía ni con cifras de ejemplo.
 */
export function ChartCard({
  title,
  subTitle,
  type,
  data,
  options,
  empty,
  emptyMessage,
  tall,
}) {
  return (
    <Card title={title} subTitle={subTitle} className="h-full">
      {empty ? (
        <NoData message={emptyMessage} />
      ) : (
        <Chart
          type={type}
          data={data}
          options={options}
          className={tall ? "h-25rem" : "h-20rem"}
        />
      )}
    </Card>
  );
}
