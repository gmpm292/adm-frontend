import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTS, DELETE_PRODUCTS } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { ProductEditForm } from "./ProductEditForm";
import { ProductCreateForm } from "./ProductCreateForm";
import { ProductDetailForm } from "./ProductDetailForm";
import { formatDate } from "../../../../utils/dateUtils";
import { formatCurrency } from "../../../../utils/numberUtils";

export function ProductTable() {
  const [getProducts, { loading, data, error }] = useLazyQuery(GET_PRODUCTS, {
    fetchPolicy: "network-only",
  });
  const [deleteProducts] = useMutation(DELETE_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState(null);
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

        const { data: responseData } = await getProducts({
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
          data: responseData?.products?.data,
          totalCount: responseData?.products?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching products:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getProducts]
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

  const handleEdit = (productId) => {
    setSelectedProductId(productId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (productId) => {
    setSelectedProductId(productId);
    setDetailDialogVisible(true);
  };

  const handleDelete = (productId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este producto?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteProducts({ variables: { ids: [productId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Producto eliminado correctamente",
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

  const dateBodyTemplate = (rowData, field) => {
    return formatDate(rowData[field]);
  };

  const priceBodyTemplate = (rowData, field) => {
    return formatCurrency(rowData[field]);
  };

  const categoryBodyTemplate = (rowData) => {
    return rowData.category?.name || "N/A";
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar producto"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar producto"
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
      field: "name",
      header: "Nombre",
      sortable: true,
      filter: true,
    },
    {
      field: "category.name",
      header: "Categoría",
      body: categoryBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "unitOfMeasure",
      header: "Unidad de Medida",
      sortable: true,
      filter: true,
    },
    {
      field: "costPrice",
      header: "Precio Costo",
      body: (rowData) => priceBodyTemplate(rowData, "costPrice"),
      sortable: true,
    },
    {
      field: "salePrice",
      header: "Precio Venta",
      body: (rowData) => priceBodyTemplate(rowData, "salePrice"),
      sortable: true,
    },
    {
      field: "createdAt",
      header: "Fecha de Creación",
      body: (rowData) => dateBodyTemplate(rowData, "createdAt"),
      sortable: true,
    },
  ];

  const addProductButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nuevo Producto"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.products?.data}
        totalRecords={data?.products?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "category.name", "unitOfMeasure"]}
        emptyMessage="No se encontraron productos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addProductButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <ProductEditForm
        productId={selectedProductId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <ProductCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <ProductDetailForm
        productId={selectedProductId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}

export default ProductTable;