import { useCallback, useState, useRef } from "react";
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
import { Tag } from "primereact/tag";
import { SALE_DETAIL_STATUS, formatMoney, workerName } from "../../format";
import { getErrorMessage } from "../../../../utils/errors";

const EMPTY = <span className="text-color-secondary">—</span>;

const money = (field) => (row) =>
  row[field] != null ? formatMoney(row[field], row.currency) : EMPTY;

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
      message: "El producto se quitará de la venta y volverá a estar disponible.",
      header: "Quitar producto",
      acceptLabel: "Quitar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
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
            detail: getErrorMessage(err),
            life: 3000,
          });
        }
      },
    });
  };

  // Solo se cambian las líneas de una venta que sigue en borrador
  const actionBodyTemplate = (rowData) => {
    if (rowData.saleDetailStatus !== "DRAFT") return null;
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip="Cambiar cantidad"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          tooltip="Quitar producto"
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
    },
    {
      field: "quantity",
      header: "Cantidad",
    },
    {
      field: "unitPrice",
      header: "Precio",
      body: money("unitPrice"),
    },
    {
      field: "subtotal",
      header: "Importe",
      body: money("subtotal"),
    },
    {
      field: "publicists",
      header: "Publicistas",
      body: (row) =>
        row.publicists?.length
          ? row.publicists.map(workerName).join(", ")
          : EMPTY,
    },
    {
      field: "saleDetailStatus",
      header: "Estado",
      body: (row) => {
        const status = SALE_DETAIL_STATUS[row.saleDetailStatus];
        return status ? (
          <Tag severity={status.severity} value={status.label} />
        ) : (
          EMPTY
        );
      },
    },
  ];

  const isDraft = data?.saleDetailsBySale?.[0]?.sale?.saleStatus === "DRAFT";
  const addSaleDetailButton = isDraft && (
    <Button
      label="Agregar producto"
      icon="pi pi-plus"
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
        globalFilterFields={[]}
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
