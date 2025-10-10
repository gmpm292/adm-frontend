import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_SALES, DELETE_SALES } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { SaleEditForm } from "./SaleEditForm";
import { SaleCreateForm } from "./SaleCreateForm";
import { SaleDetailForm } from "./SaleDetailForm";

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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const paymentMethodBodyTemplate = (rowData) => {
  return rowData.paymentMethod === "CASH"
    ? "Efectivo"
    : rowData.paymentMethod === "CARD"
    ? "Tarjeta"
    : rowData.paymentMethod === "TRANSFER"
    ? "Transferencia"
    : "";
};

export function SaleTable() {
  const [getSales, { loading, data, error }] = useLazyQuery(GET_SALES, {
    fetchPolicy: "network-only",
  });
  const [deleteSales] = useMutation(DELETE_SALES);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const toast = useRef(null);
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

        const { data: responseData } = await getSales({
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
          data: responseData?.sales?.data,
          totalCount: responseData?.sales?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching sales:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getSales]
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

  const handleEdit = (saleId) => {
    setSelectedSaleId(saleId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (saleId) => {
    setSelectedSaleId(saleId);
    setDetailDialogVisible(true);
  };

  const handleDelete = (saleId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta venta?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteSales({ variables: { ids: [saleId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Venta eliminada correctamente",
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
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar venta"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar venta"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDelete(rowData.id)}
        />
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewDetails(rowData.id)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "effectiveDate",
      header: "Fecha",
      body: (rowData) => formatDate(rowData.effectiveDate),
      sortable: true,
      filter: true,
    },
    {
      field: "totalAmount",
      header: "Total",
      body: (rowData) => formatCurrency(rowData.totalAmount),
      sortable: true,
      filter: true,
    },
    {
      field: "paymentMethod",
      header: "Método de Pago",
      body: paymentMethodBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "salesUser.name",
      header: "Vendedor",
      sortable: true,
      filter: true,
    },
    {
      field: "customer.name",
      header: "Cliente",
      sortable: true,
      filter: true,
    },
  ];

  const addSaleButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear nueva venta"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.sales?.data}
        totalRecords={data?.sales?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={[
          "invoiceNumber",
          "salesUser.name",
          "customer.name",
        ]}
        emptyMessage="No se encontraron ventas"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ventas"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addSaleButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <SaleEditForm
        saleId={selectedSaleId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <SaleCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <SaleDetailForm
        saleId={selectedSaleId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}

export default SaleTable;
