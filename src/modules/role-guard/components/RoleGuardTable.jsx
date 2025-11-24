import React, { useCallback, useState, useRef, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";

import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

import { Badge } from "primereact/badge";
import { GET_ROLE_GUARDS, UPDATE_ROLE_GUARD } from "../graphql/queries";
import GenericDataTable from "../../../components/BaseTable";
import { RoleGuardEditForm } from "./RoleGuardEditForm";
import { RoleGuardDetailForm } from "./RoleGuardDetailForm";
import { RoleTypeTabs } from "./RoleTypeTabs";
import { formatDate } from "../../../utils/dateUtils";
import { ConditionalOperator } from "../../../components/BaseTable/types";

export function RoleGuardTable() {
  const [getRoleGuards, { loading, data, error }] = useLazyQuery(
    GET_ROLE_GUARDS,
    {
      fetchPolicy: "network-only",
    }
  );

  const [updateRoleGuard] = useMutation(UPDATE_ROLE_GUARD);
  const [selectedRoleGuardId, setSelectedRoleGuardId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [forceRefresh, setForceRefresh] = useState(0); // Para forzar recarga cuando cambia pestaña
  const toast = useRef(null);

  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

  // Efecto para recargar cuando cambia la pestaña
  useEffect(() => {
    setForceRefresh((prev) => prev + 1);
  }, [activeTab]);

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

        // Añadir filtro por tipo si no es ALL
        if (activeTab !== "ALL") {
          let typeValue;

          switch (activeTab) {
            case "QUERY":
              typeValue = "Query";
              break;
            case "MUTATION":
              typeValue = "Mutation";
              break;
            case "SUBSCRIPTION":
              typeValue = "Subscription";
              break;
            default:
              typeValue = activeTab;
          }

          filters.push({
            property: "type",
            operator: ConditionalOperator.EQUAL,
            value: typeValue,
          });
        }

        // Añadir filtros del usuario si existen
        if (params.filters && Array.isArray(params.filters)) {
          filters = [...params.filters, ...filters];
        } else if (params.filters && typeof params.filters === "object") {
          // Si es objeto, convertirlo a array
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

        // Solo añadir filtros si hay alguno
        if (filters.length > 0) {
          requestParams.filters = filters;
        }

        console.log("Enviando parámetros al backend:", requestParams);

        const { data: responseData } = await getRoleGuards({
          variables: {
            options: requestParams,
          },
        });

        return {
          data: responseData?.roleGuards?.data,
          totalCount: responseData?.roleGuards?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching role guards:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getRoleGuards, activeTab]
  );

  const handleRefresh = useCallback(() => {
    // Preservar filtros y sorts existentes, solo resetear paginación
    const refreshParams = {
      skip: 0, // Resetear a primera página
      take: tableStateRef.current.pagination.rows,
      filters: tableStateRef.current.filters,
      sorts: tableStateRef.current.sorts,
    };

    handleFetchData(refreshParams);
  }, [handleFetchData]);

  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    // El useEffect se encargará de forzar la recarga
  }, []);

  const handleEditSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (roleGuardId) => {
    setSelectedRoleGuardId(roleGuardId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (roleGuardId) => {
    setSelectedRoleGuardId(roleGuardId);
    setDetailDialogVisible(true);
  };

  const handleToggleStatus = (roleGuard) => {
    const newStatus =
      roleGuard.roles && roleGuard.roles.length > 0 ? [] : ["USER"];

    confirmDialog({
      message:
        roleGuard.roles && roleGuard.roles.length > 0
          ? "¿Estás seguro de que deseas desactivar este rol guard?"
          : "¿Estás seguro de que deseas activar este rol guard?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await updateRoleGuard({
            variables: {
              updateRoleGuardInput: {
                id: roleGuard.id,
                roles: newStatus,
              },
            },
          });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: `Rol guard ${
              newStatus.length > 0 ? "activado" : "desactivado"
            } correctamente`,
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

  // Función para mapear match modes de PrimeReact a operadores
  const mapMatchModeToOperator = (matchMode) => {
    const modeMap = {
      startsWith: "STARTS_WITH",
      contains: "CONTAINS",
      endsWith: "ENDS_WITH",
      equals: "EQUAL",
      notEquals: "NOT_EQUAL",
      lt: "LESS_THAN",
      lte: "LESS_THAN_OR_EQUAL",
      gt: "GREATER_THAN",
      gte: "GREATER_THAN_OR_EQUAL",
    };
    return modeMap[matchMode] || "EQUAL";
  };

  const typeBodyTemplate = (rowData) => {
    const typeConfig = {
      QUERY: { label: "Consulta", severity: "info" },
      MUTATION: { label: "Mutación", severity: "warning" },
      SUBSCRIPTION: { label: "Suscripción", severity: "success" },
    };

    const config = typeConfig[rowData.type] || {
      label: rowData.type,
      severity: "secondary",
    };

    return <Badge value={config.label} severity={config.severity} />;
  };

  const rolesBodyTemplate = (rowData) => {
    if (!rowData.roles || rowData.roles.length === 0) {
      return <Badge value="Sin roles" severity="danger" />;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {rowData.roles.slice(0, 3).map((role, index) => (
          <Badge key={index} value={role} severity="success" />
        ))}
        {rowData.roles.length > 3 && (
          <Badge value={`+${rowData.roles.length - 3}`} />
        )}
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    const isActive = rowData.roles && rowData.roles.length > 0;
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

  const dateBodyTemplate = (rowData, field) => {
    return formatDate(rowData[field]);
  };

  const actionBodyTemplate = (rowData) => {
    const isActive = rowData.roles && rowData.roles.length > 0;

    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Configurar roles"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon={isActive ? "pi pi-ban" : "pi pi-check"}
          className={`p-button-rounded p-button-text ${
            isActive ? "p-button-warning" : "p-button-success"
          }`}
          tooltip={isActive ? "Desactivar" : "Activar"}
          tooltipOptions={{ position: "top" }}
          onClick={() => handleToggleStatus(rowData)}
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
      field: "queryOrEndPointURL",
      header: "Operación",
      sortable: true,
      filter: true,
    },
    {
      field: "description",
      header: "Descripción",
      sortable: true,
      filter: true,
      visible: false,
    },
    {
      field: "type",
      header: "Tipo",
      body: typeBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "roles",
      header: "Roles Permitidos",
      body: rolesBodyTemplate,
      sortable: false,
    },
    {
      field: "status",
      header: "Estado",
      body: statusBodyTemplate,
      sortable: false,
    },
    {
      field: "createdAt",
      header: "Fecha de Creación",
      body: (rowData) => dateBodyTemplate(rowData, "createdAt"),
      sortable: true,
    },
  ];

  const headerContent = (
    <div className="flex align-items-center gap-2">
      <RoleTypeTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        key={forceRefresh} // Forzar recreación cuando cambia pestaña
        columns={columns}
        data={data?.roleGuards?.data}
        totalRecords={data?.roleGuards?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["queryOrEndPointURL", "description", "type"]}
        emptyMessage="No se encontraron role guards"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} operaciones"
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

      <RoleGuardEditForm
        roleGuardId={selectedRoleGuardId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <RoleGuardDetailForm
        roleGuardId={selectedRoleGuardId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}

export default RoleGuardTable;
