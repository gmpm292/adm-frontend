import React, { useCallback, useState, useRef, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_SCOPED_ACCESSES,
  REMOVE_SCOPED_ACCESSES,
} from "../graphql/queries";

import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Badge } from "primereact/badge";
import { ScopedAccessEditForm } from "./ScopedAccessEditForm";
import { ScopedAccessCreateForm } from "./ScopedAccessCreateForm";
import { ScopedAccessDetailForm } from "./ScopedAccessDetailForm";
import { BusinessTabs } from "./BusinessTabs";

import GenericDataTable from "../../../components/BaseTable";
import { formatDate } from "../../../utils/dateUtils";
import { ConditionalOperator } from "../../../enums/conditional-operation.enum";

export function ScopedAccessTable() {
  const [getScopedAccesses, { loading, data, error }] = useLazyQuery(
    GET_SCOPED_ACCESSES,
    {
      fetchPolicy: "network-only",
    }
  );

  const [removeScopedAccesses] = useMutation(REMOVE_SCOPED_ACCESSES);
  const [selectedScopedAccessId, setSelectedScopedAccessId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("ALL");
  const [forceRefresh, setForceRefresh] = useState(0);
  const toast = useRef(null);

  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

  // Efecto para recargar cuando cambia el negocio seleccionado
  useEffect(() => {
    setForceRefresh((prev) => prev + 1);
  }, [selectedBusiness]);

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

        // Construir filtros combinados
        let filters = [];

        // Añadir filtro por negocio si no es ALL
        if (selectedBusiness !== "ALL") {
          filters.push({
            property: "business.id",
            operator: ConditionalOperator.EQUAL,
            value: selectedBusiness,
          });
        }

        // Añadir filtros del usuario si existen
        if (params.filters && Array.isArray(params.filters)) {
          filters = [...filters, ...params.filters];
        } else if (params.filters && typeof params.filters === "object") {
          Object.keys(params.filters).forEach((key) => {
            const filter = params.filters[key];
            if (
              filter &&
              filter.constraints &&
              filter.constraints[0] &&
              filter.constraints[0].value !== null &&
              filter.constraints[0].value !== ""
            ) {
              filters.push({
                property: key,
                operator: mapMatchModeToOperator(
                  filter.constraints[0].matchMode
                ),
                value: filter.constraints[0].value,
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

        const { data: responseData } = await getScopedAccesses({
          variables: {
            options: requestParams,
          },
        });

        return {
          data: responseData?.scopedAccesses?.data,
          totalCount: responseData?.scopedAccesses?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching scoped accesses:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getScopedAccesses, selectedBusiness]
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

  const handleBusinessChange = useCallback((businessId) => {
    setSelectedBusiness(businessId);
  }, []);

  const handleEditSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleCreateSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (scopedAccessId) => {
    setSelectedScopedAccessId(scopedAccessId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (scopedAccessId) => {
    setSelectedScopedAccessId(scopedAccessId);
    setDetailDialogVisible(true);
  };

  const handleDelete = (scopedAccessId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este nivel de acceso?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await removeScopedAccesses({
            variables: { ids: [scopedAccessId] },
          });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Nivel de acceso eliminado correctamente",
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

  // Función para mapear match modes
  const mapMatchModeToOperator = (matchMode) => {
    const modeMap = {
      startsWith: "STARTS_WITH",
      contains: "CONTAINS",
      endsWith: "ENDS_WITH",
      equals: "EQUAL",
      notEquals: "NOT_EQUAL",
    };
    return modeMap[matchMode] || "EQUAL";
  };

  const accessLevelsBodyTemplate = (rowData) => {
    if (!rowData.accessLevels || rowData.accessLevels.length === 0) {
      return <Badge value="Sin niveles" severity="danger" />;
    }

    const levelConfig = {
      BUSINESS: { label: "Negocio", severity: "info" },
      OFFICE: { label: "Oficina", severity: "warning" },
      DEPARTMENT: { label: "Departamento", severity: "help" },
      TEAM: { label: "Equipo", severity: "success" },
      GENERAL: { label: "General", severity: "secondary" },
      PERSONAL: { label: "Personal", severity: "contrast" },
      RELATED: { label: "Relacionado", severity: "info" },
    };

    return (
      <div className="flex flex-wrap gap-1">
        {rowData.accessLevels.slice(0, 3).map((level, index) => {
          const config = levelConfig[level] || {
            label: level,
            severity: "secondary",
          };
          return (
            <Badge
              key={index}
              value={config.label}
              severity={config.severity}
            />
          );
        })}
        {rowData.accessLevels.length > 3 && (
          <Badge value={`+${rowData.accessLevels.length - 3}`} />
        )}
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    const isActive = rowData.entityStatus == 1;
    return (
      <i
        className={`pi ${
          isActive
            ? "pi-check-circle text-green-500"
            : "pi-times-circle text-red-500"
        }`}
        style={{ fontSize: "1.25rem" }}
      />
    );
  };

  const businessBodyTemplate = (rowData) => {
    return rowData.business?.name || "N/A";
  };

  const roleGuardBodyTemplate = (rowData) => {
    return (
      rowData.roleGuard?.description ||
      rowData.roleGuard?.queryOrEndPointURL ||
      "N/A"
    );
  };

  const dateBodyTemplate = (rowData, field) => {
    return formatDate(rowData[field]);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar niveles de acceso"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar nivel de acceso"
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
      field: "business",
      header: "Negocio",
      body: businessBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "roleGuard",
      header: "Operación",
      body: roleGuardBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "accessLevels",
      header: "Niveles de Acceso",
      body: accessLevelsBodyTemplate,
      sortable: false,
    },
    {
      field: "entityStatus",
      header: "Estado",
      body: statusBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "createdAt",
      header: "Fecha de Creación",
      body: (rowData) => dateBodyTemplate(rowData, "createdAt"),
      sortable: true,
    },
  ];

  const addScopedAccessButton = (
    <Button
      icon="pi pi-plus"
      label="Nuevo Nivel de Acceso"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  const headerContent = (
    <div className="flex align-items-center gap-2">
      <BusinessTabs
        selectedBusiness={selectedBusiness}
        onBusinessChange={handleBusinessChange}
      />
      {addScopedAccessButton}
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        key={forceRefresh}
        columns={columns}
        data={data?.scopedAccesses?.data}
        totalRecords={data?.scopedAccesses?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={[
          "business.name",
          "roleGuard.description",
          "roleGuard.queryOrEndPointURL",
        ]}
        emptyMessage="No se encontraron niveles de acceso"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} niveles de acceso"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={headerContent}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "12rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <ScopedAccessEditForm
        scopedAccessId={selectedScopedAccessId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <ScopedAccessCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <ScopedAccessDetailForm
        scopedAccessId={selectedScopedAccessId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}

export default ScopedAccessTable;
