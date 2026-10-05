import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_SALE_DETAILS_BY_SALE,
  DELETE_SALE_DETAILS,
} from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { SaleDetailEditForm } from "./SaleDetailEditForm";
import { SaleDetailCreateForm } from "./SaleDetailCreateForm";
import { Chip } from "primereact/chip";

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
    return <span className="text-color-secondary">Sin publicistas</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {rowData.publicists.map((publicist) => (
        <Chip key={publicist.id} label={publicist.name} className="text-xs" />
      ))}
    </div>
  );
};

export function SaleDetailTable({ saleId }) {
  const [getSaleDetails, { loading, data, error }] = useLazyQuery(
    GET_SALE_DETAILS_BY_SALE,
    {
      variables: { saleId },
      fetchPolicy: "network-only",
    }
  );
  const [deleteSaleDetails] = useMutation(DELETE_SALE_DETAILS);
  const [selectedSaleDetailId, setSelectedSaleDetailId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const toast = useRef(null);

  // Estado para el tableStateRef como en el ejemplo
  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

  // Función handleFetchData corregida
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
            saleId: saleId,
          },
        });

        return {
          data: responseData?.saleDetailsBySale,
          totalCount: responseData?.saleDetailsBySale?.length || 0,
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
    [getSaleDetails, saleId]
  );

  // Función handleRefresh corregida - IMPORTANTE: pasar todos los parámetros necesarios
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
          text
          rounded
          tooltip="Editar detalle"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
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
        globalFilterFields={["product.name", "product.id"]} // Actualizado
        emptyMessage="No se encontraron detalles de venta"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} detalles"
        onRefresh={handleRefresh} // ✅ Pasar la función handleRefresh
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addSaleDetailButton}
        refreshable={true} // ✅ Asegurar que sea refreshable
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-10rem"
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
