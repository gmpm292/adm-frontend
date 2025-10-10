import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_SALE_DETAILS } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Chip } from "primereact/chip";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value) => {
    // ✅ Agregar validación para valores nulos o undefined
    if (value === null || value === undefined) {
      return "$0.00";
    }

    // ✅ Asegurar que value sea un número
    const numericValue =
      typeof value === "number" ? value : parseFloat(value) || 0;

    return numericValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

const publicistsBodyTemplate = (rowData) => {
  if (!rowData.publicists || rowData.publicists.length === 0) {
    return <span className="text-gray-400">Sin publicistas</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {rowData.publicists.map((publicist) => (
        <Chip key={publicist.id} label={publicist.name} className="text-xs" />
      ))}
    </div>
  );
};

export function SaleDetailGeneralTable() {
  const [getSaleDetails, { loading, data, error }] = useLazyQuery(
    GET_SALE_DETAILS,
    {
      fetchPolicy: "network-only",
    }
  );
  const toast = useRef(null);
  const navigate = useNavigate();

  // Estado para el tableStateRef
  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

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

        const { data: responseData } = await getSaleDetails({
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
          data: responseData?.saleDetails?.data,
          totalCount: responseData?.saleDetails?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching sale details:", err);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Error al cargar los detalles de venta",
          life: 3000,
        });
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getSaleDetails]
  );

  // Función handleRefresh corregida
  const handleRefresh = useCallback(() => {
    handleFetchData({
      skip: tableStateRef.current.pagination.first,
      take: tableStateRef.current.pagination.rows,
      filters: tableStateRef.current.filters,
      sorts: tableStateRef.current.sorts,
    });
  }, [handleFetchData]);

  const handleViewSaleDetails = (saleId) => {
    navigate(`/sales/sales/${saleId}/details`);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-external-link"
          className="p-button-rounded p-button-text"
          tooltip="Ver Detalles Completos"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewSaleDetails(rowData.sale.id)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "sale.invoiceNumber",
      header: "Factura",
      sortable: true,
      filter: true,
    },
    {
      field: "product.name",
      header: "Producto",
      sortable: true,
      filter: true,
    },
    {
      field: "product.id", // Cambiado de "product.code" a "product.id"
      header: "ID Producto",
      sortable: true,
      filter: true,
    },
    {
      field: "quantity",
      header: "Cantidad",
      sortable: true,
      filter: true,
    },
    {
      field: "unitPrice",
      header: "Precio Unitario",
      body: (rowData) => formatCurrency(rowData.unitPrice),
      sortable: true,
      filter: true,
    },
    {
      field: "subtotal",
      header: "Subtotal",
      body: (rowData) => formatCurrency(rowData.subtotal),
      sortable: true,
      filter: true,
    },
    {
      field: "publicists",
      header: "Publicistas",
      body: publicistsBodyTemplate,
      sortable: false,
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <GenericDataTable
        columns={columns}
        data={data?.saleDetails?.data}
        totalRecords={data?.saleDetails?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={[
          "product.name",
          "product.id",
          "sale.invoiceNumber",
        ]}
        emptyMessage="No se encontraron detalles de venta"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} detalles"
        onRefresh={handleRefresh} // ✅ Pasar handleRefresh
        onFetchData={handleFetchData}
        initialPageSize={10}
        refreshable={true} // ✅ Asegurar que sea refreshable
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "8rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>
    </>
  );
}

export default SaleDetailGeneralTable;
