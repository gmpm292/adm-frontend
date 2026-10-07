import { useCallback, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { useHasRole } from "../../../../hooks/useHasRole";
import { GET_CURRENCIES } from "../graphql/queries";
import { CurrencyForm } from "./CurrencyForm";

const formatRate = (value) =>
  Number(value).toLocaleString("es-ES", { maximumFractionDigits: 6 });

const columns = [
  {
    field: "code",
    header: "Moneda",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{row.code}</span>
        <small className="text-color-secondary">{row.name}</small>
      </span>
    ),
  },
  { field: "symbol", header: "Símbolo", sortable: true },
  {
    field: "exchangeRateToCUP",
    header: "Tasa",
    sortable: true,
    body: (row) =>
      row.code === "CUP" ? (
        <span className="text-color-secondary">Referencia</span>
      ) : (
        `1 ${row.code} = ${formatRate(row.exchangeRateToCUP)} CUP`
      ),
  },
  {
    field: "isActive",
    header: "Estado",
    sortable: true,
    body: (row) =>
      row.isActive ? (
        <Tag value="Activa" severity="success" />
      ) : (
        <Tag value="Inactiva" severity="secondary" />
      ),
  },
];

/** Monedas y tasas: comunes a todas las empresas, las mantiene SUPER */
export function CurrencyTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER");
  // { currency } al editar, {} al crear
  const [form, setForm] = useState(null);
  const [fetchCurrencies, { loading, data, error }] = useLazyQuery(
    GET_CURRENCIES,
    { fetchPolicy: "network-only" }
  );

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchCurrencies({
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
          data: response?.currencies?.data,
          totalCount: response?.currencies?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchCurrencies]
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const handleSaved = (saved, { created }) => {
    setForm(null);
    handleRefresh();
    toast.current?.show({
      severity: "success",
      summary: created ? "Moneda creada" : "Moneda actualizada",
      detail: `${saved?.code} · ${saved?.name}`,
      life: 6000,
    });
  };

  const actionBodyTemplate = (row) => (
    <div className="actions-column">
      <Button
        icon="pi pi-pencil"
        text
        rounded
        tooltip="Editar moneda"
        tooltipOptions={{ position: "top" }}
        aria-label="Editar moneda"
        onClick={() => setForm({ currency: row })}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />

      <GenericDataTable
        columns={columns}
        data={data?.currencies?.data}
        totalRecords={data?.currencies?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["code", "name", "symbol"]}
        emptyMessage="No hay monedas"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} monedas"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "code", order: 1 }]}
        header={
          canEdit && (
            <Button
              label="Nueva moneda"
              icon="pi pi-plus"
              onClick={() => setForm({})}
            />
          )
        }
      >
        {canEdit && (
          <Column
            body={actionBodyTemplate}
            header="Acciones"
            className="w-6rem"
          />
        )}
      </GenericDataTable>

      {form && (
        <CurrencyForm
          currency={form.currency}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

export default CurrencyTable;
