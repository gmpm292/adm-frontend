import { useQuery } from "@apollo/client";
import { SelectButton } from "primereact/selectbutton";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useAuthContext } from "../../auth/components/AuthContext";
import { STATISTICS_BUSINESSES } from "../graphql/queries";
import { PERIOD_PRESETS } from "../hooks/useStatistics";

/**
 * Barra de filtros de las estadísticas: periodo, moneda y, para quien ve
 * varias empresas, la empresa.
 */
export function StatisticsFilters({ filters, loading, onRefresh }) {
  const { user } = useAuthContext();
  const seesAllBusinesses = user?.role?.includes("SUPER");

  const { data: businessesData } = useQuery(STATISTICS_BUSINESSES, {
    variables: { options: { skip: 0, take: null } },
    skip: !seesAllBusinesses,
  });
  const businesses = businessesData?.businesses?.data ?? [];

  return (
    <div className="ui-toolbar">
      <SelectButton
        value={filters.preset}
        options={PERIOD_PRESETS}
        onChange={(e) => filters.setPreset(e.value)}
        allowEmpty={false}
      />

      {filters.preset === "custom" && (
        <Calendar
          value={filters.customRange}
          onChange={(e) => filters.setCustomRange(e.value)}
          selectionMode="range"
          dateFormat="dd/mm/yy"
          placeholder="Desde - hasta"
          maxDate={new Date()}
          readOnlyInput
          showIcon
        />
      )}

      <div className="ui-toolbar__end">
        {seesAllBusinesses && businesses.length > 0 && (
          <Dropdown
            value={filters.businessId}
            options={businesses}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => filters.setBusinessId(e.value ?? null)}
            placeholder="Todas las empresas"
            showClear
          />
        )}

        {filters.currencies.length > 1 && (
          <Dropdown
            value={filters.currency}
            options={filters.currencies}
            onChange={(e) => filters.setCurrency(e.value)}
            tooltip="Moneda de los importes"
            tooltipOptions={{ position: "bottom" }}
          />
        )}

        <Button
          icon="pi pi-refresh"
          text
          severity="secondary"
          loading={loading}
          tooltip="Actualizar"
          tooltipOptions={{ position: "bottom" }}
          onClick={() => onRefresh()}
        />
      </div>
    </div>
  );
}
