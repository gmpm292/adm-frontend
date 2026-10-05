import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_DELIVERIES, DELETE_SALES } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { FilterMatchMode } from "primereact/api";

// Importaciones de componentes reutilizables del módulo sale
import { SaleEditForm } from "../../sale/components/SaleEditForm";
import { SaleDetailForm } from "../../sale/components/SaleDetailForm";
import { MakeSaleComponent } from "../../sale/components/MakeSaleComponent";
import { ValidatePaymentButton } from "../../sale/components/ValidatePaymentButton";
import { DeliveryFilterButton } from "./DeliveryFilterButton";

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return "$0.00";
  }
  const numericValue =
    typeof value === "number" ? value : parseFloat(value) || 0;
  return numericValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime()) || date.getTime() === 0) {
    return "-";
  }
  return date.toLocaleDateString();
};

const paymentMethodBodyTemplate = (rowData) => {
  const methodMap = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    OTHER: "Otro",
  };
  return methodMap[rowData.paymentMethod] || rowData.paymentMethod || "-";
};

const canProcessSale = (sale) => {
  return !sale.effectiveDate;
};

const deliveryStatusBodyTemplate = (rowData) => {
  const isProcessed = !!rowData.effectiveDate;

  if (isProcessed) {
    return (
      <Tag severity="success" value="Entregado" icon="pi pi-check-circle" />
    );
  } else {
    return <Tag severity="warning" value="Pendiente" icon="pi pi-clock" />;
  }
};

// Función para mapear match modes a operadores del backend
const mapMatchModeToOperator = (matchMode) => {
  const modeMap = {
    startsWith: "STARTS_WITH",
    contains: "CONTAINS",
    endsWith: "ENDS_WITH",
    equals: "EQUAL",
    notEquals: "NOT_EQUAL",
    dateIs: "EQUAL",
    dateAfter: "GREATER_THAN",
    dateBefore: "LESS_THAN",
  };
  return modeMap[matchMode] || "EQUAL";
};

export function DeliveryTable() {
  const [getDeliveries, { loading, data, error }] = useLazyQuery(
    GET_DELIVERIES,
    {
      fetchPolicy: "network-only",
    },
  );
  const [deleteSales] = useMutation(DELETE_SALES);

  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [makeSaleDialogVisible, setMakeSaleDialogVisible] = useState(false);
  const [pendingFilterActive, setPendingFilterActive] = useState(false);

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

        // Construir array de filtros correctamente
        let filters = [];

        // Filtro base: siempre hasDelivery = true
        filters.push({
          property: "hasDelivery",
          operator: "EQUAL",
          value: "true",
        });

        // Si el filtro de pendientes está activo, agregar isConfirmed = false
        if (pendingFilterActive) {
          filters.push({
            property: "isConfirmed",
            operator: "EQUAL",
            value: "false",
          });
        }

        // Procesar filtros del usuario (desde la tabla)
        if (params.filters && Array.isArray(params.filters)) {
          // Si ya viene como array, lo usamos directamente
          filters = [...filters, ...params.filters];
        } else if (params.filters && typeof params.filters === "object") {
          // Si viene como objeto de PrimeReact, lo convertimos
          Object.keys(params.filters).forEach((key) => {
            const filter = params.filters[key];

            // Manejar filtros compuestos (operador AND/OR)
            if (filter && filter.constraints) {
              filter.constraints.forEach((constraint) => {
                if (
                  constraint &&
                  constraint.value !== null &&
                  constraint.value !== "" &&
                  constraint.value !== undefined
                ) {
                  filters.push({
                    property: key,
                    operator: mapMatchModeToOperator(constraint.matchMode),
                    value: constraint.value,
                  });
                }
              });
            }
          });
        }

        const requestParams = {
          skip: params.skip || 0,
          take: params.take || 10,
          sorts: params.sorts || [],
        };

        if (filters.length > 0) {
          requestParams.filters = filters;
        }

        console.log("Enviando parámetros al backend:", requestParams);

        const { data: responseData } = await getDeliveries({
          variables: {
            options: requestParams,
          },
        });

        return {
          data: responseData?.sales?.data,
          totalCount: responseData?.sales?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getDeliveries, pendingFilterActive],
  );

  const handleRefresh = useCallback(() => {
    const refreshParams = {
      skip: 0,
      take: tableStateRef.current.pagination.rows,
      filters: tableStateRef.current.filters,
      sorts: tableStateRef.current.sorts,
    };
    handleFetchData(refreshParams);
  }, [handleFetchData]);

  const handleEditSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleMakeSaleSuccess = useCallback(
    (sale) => {
      toast.current.show({
        severity: "success",
        summary: "Entrega Realizada",
        detail: `La mensajería #${sale.id} ha sido confirmada exitosamente`,
        life: 3000,
      });
      handleRefresh();
    },
    [handleRefresh],
  );

  const handleValidationSuccess = (result) => {
    if (result.valid) {
      toast.current.show({
        severity: "success",
        summary: "Pagos Válidos",
        detail: `Los pagos son válidos. Total: ${result.totalInBaseCurrency.toFixed(2)}`,
        life: 3000,
      });
    }
  };

  const handleTogglePendingFilter = () => {
    setPendingFilterActive(!pendingFilterActive);
    // Forzar refresh con el nuevo estado
    setTimeout(() => {
      handleRefresh();
    }, 0);
  };

  const handleEdit = (deliveryId) => {
    setSelectedDeliveryId(deliveryId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (deliveryId) => {
    setSelectedDeliveryId(deliveryId);
    setDetailDialogVisible(true);
  };

  const handleMakeSale = (deliveryId) => {
    setSelectedDeliveryId(deliveryId);
    setMakeSaleDialogVisible(true);
  };

  const handleDelete = (deliveryId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta mensajería?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteSales({ variables: { ids: [deliveryId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Mensajería eliminada correctamente",
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
    const canProcess = canProcessSale(rowData);

    return (
      <div className="actions-column">
        {/* Botón Confirmar Entrega - Solo muestra si está pendiente */}
        {canProcess && (
          <Button
            icon="pi pi-check-circle"
            text
            rounded
            severity="success"
            tooltip="Confirmar entrega"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleMakeSale(rowData.id)}
          />
        )}

        {/* Botón Validar Pago - Solo muestra si está pendiente */}
        {canProcess && (
          <ValidatePaymentButton
            saleId={rowData.id}
            onValidationSuccess={(result, payments) =>
              handleValidationSuccess(result, payments, rowData.id)
            }
            label=""
            icon="pi pi-credit-card"
            size="small"
            variant="text"
            tooltip="Validar pagos"
          />
        )}

        {/* Botón Editar */}
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip="Editar mensajería"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />

        {/* Botón Ver Detalles */}
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewDetails(rowData.id)}
        />

        {/* Botón Eliminar */}
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          tooltip="Eliminar mensajería"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDelete(rowData.id)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "isConfirmed",
      header: "Estado",
      body: deliveryStatusBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "id",
      header: "ID",
      sortable: true,
      filter: true,
    },
    {
      field: "effectiveDate",
      header: "Fecha Entrega",
      body: (rowData) => formatDate(rowData.effectiveDate),
      sortable: true,
      filter: true,
      dataType: "date",
    },
    {
      field: "customer.name",
      header: "Cliente",
      sortable: true,
      filter: true,
    },
    {
      field: "deliveryWorker.name",
      header: "Repartidor",
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
      field: "deliveryNotes",
      header: "Notas",
      sortable: false,
      filter: true,
    },
  ];

  // Solo el botón de filtro de pendientes, sin el botón de refresh duplicado
  const headerContent = (
    <div className="flex gap-2">
      <DeliveryFilterButton
        isActive={pendingFilterActive}
        onToggle={handleTogglePendingFilter}
      />
    </div>
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
          "id",
          "customer.name",
          "deliveryWorker.name",
          "deliveryNotes",
        ]}
        emptyMessage="No se encontraron mensajerías"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} mensajerías"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={headerContent}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-13rem"
        />
      </GenericDataTable>

      <SaleEditForm
        saleId={selectedDeliveryId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <SaleDetailForm
        saleId={selectedDeliveryId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />

      <MakeSaleComponent
        saleId={selectedDeliveryId}
        visible={makeSaleDialogVisible}
        onHide={() => setMakeSaleDialogVisible(false)}
        onSuccess={handleMakeSaleSuccess}
      />
    </>
  );
}

export default DeliveryTable;
