import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_SALE_DETAILS_BY_SALE, DELETE_SALE_DETAILS } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { SaleDetailEditForm } from "./SaleDetailEditForm";
import { SaleDetailCreateForm } from "./SaleDetailCreateForm";

const formatCurrency = (value) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export function SaleDetailTable({ saleId }) {
  const [getSaleDetails, { loading, data, error }] = useLazyQuery(GET_SALE_DETAILS_BY_SALE, {
    variables: { saleId },
    fetchPolicy: "network-only",
  });
  const [deleteSaleDetails] = useMutation(DELETE_SALE_DETAILS);
  const [selectedSaleDetailId, setSelectedSaleDetailId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
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

        const { data: responseData } = await getSaleDetails({
          variables: {
            saleId: saleId
          }
        });

        return {
          data: responseData?.saleDetailsBySale,
          totalCount: responseData?.saleDetailsBySale?.length || 0,
        };
      } catch (err) {
        console.error("Error fetching sale details:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getSaleDetails, saleId]
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

  const handleEdit = (saleDetailId) => {
    setSelectedSaleDetailId(saleDetailId);
    setEditDialogVisible(true);
  };

  const handleDelete = (saleDetailId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este detalle de venta?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteSaleDetails({ variables: { ids: [saleDetailId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Detalle de venta eliminado correctamente",
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
          tooltip="Editar detalle"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar detalle"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDelete(rowData.id)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "product.name",
      header: "Producto",
      sortable: true,
      filter: true,
    },
    {
      field: "product.code",
      header: "Código",
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
      field: "discountPercentage",
      header: "Descuento (%)",
      body: (rowData) => rowData.discountPercentage ? `${rowData.discountPercentage}%` : '0%',
      sortable: true,
      filter: true,
    },
  ];

  const addSaleDetailButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Agregar producto"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.saleDetailsBySale}
        totalRecords={data?.saleDetailsBySale?.length || 0}
        loading={loading}
        error={error}
        globalFilterFields={["product.name", "product.code"]}
        emptyMessage="No se encontraron detalles de venta"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} detalles"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addSaleDetailButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <SaleDetailEditForm
        saleDetailId={selectedSaleDetailId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <SaleDetailCreateForm
        saleId={saleId}
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

export default SaleDetailTable;