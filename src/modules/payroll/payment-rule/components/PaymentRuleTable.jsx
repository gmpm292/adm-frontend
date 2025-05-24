import React, { useCallback, useState, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_PAYMENT_RULES, REMOVE_PAYMENT_RULES } from '../graphql/queries';
import GenericDataTable from '../../../../components/BaseTable/index';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { PaymentRuleEditForm } from './PaymentRuleEditForm';
import { PaymentRuleCreateForm } from './PaymentRuleCreateForm';
import { PaymentRuleDetailForm } from './PaymentRuleDetailForm';

const statusBodyTemplate = (rowData) => {
  return (
    <span className={`badge status-${rowData.isActive ? 'active' : 'inactive'}`}>
      {rowData.isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
};

const paymentTypeBodyTemplate = (rowData) => {
  const types = {
    PRICE_RANGE: 'Rango de Precios',
    SALE_QUANTITY: 'Cantidad Ventas',
    FIXED_AMOUNT: 'Monto Fijo',
    PERCENTAGE: 'Porcentaje'
  };
  return types[rowData.paymentType] || rowData.paymentType;
};

const workerTypeBodyTemplate = (rowData) => {
  const types = {
    AGENT: 'Agente',
    PUBLICIST: 'Publicista',
    ECONOMIC: 'Económico',
    OTHER: 'Otro'
  };
  return types[rowData.workerType] || rowData.workerType;
};

export function PaymentRuleTable() {
  const [getPaymentRules, { loading, data, error }] = useLazyQuery(GET_PAYMENT_RULES, {
    fetchPolicy: 'network-only',
  });
  const [removePaymentRules] = useMutation(REMOVE_PAYMENT_RULES);
  const [selectedPaymentRuleId, setSelectedPaymentRuleId] = useState(null);
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

        const { data: responseData } = await getPaymentRules({
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
          data: responseData?.paymentRules?.data,
          totalCount: responseData?.paymentRules?.totalCount,
        };
      } catch (err) {
        console.error('Error fetching payment rules:', err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getPaymentRules]
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

  const handleEdit = (id) => {
    setSelectedPaymentRuleId(id);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (id) => {
    setSelectedPaymentRuleId(id);
    setDetailDialogVisible(true);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar esta regla de pago?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await removePaymentRules({ variables: { ids: [id] } });

          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Regla de pago eliminada correctamente',
            life: 3000,
          });

          handleRefresh();
        } catch (err) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
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
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleDelete(rowData.id)}
        />
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleViewDetails(rowData.id)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: 'name',
      header: 'Nombre',
      sortable: true,
      filter: true,
    },
    {
      field: 'paymentType',
      header: 'Tipo de Pago',
      body: paymentTypeBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: 'workerType',
      header: 'Tipo Trabajador',
      body: workerTypeBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: 'isActive',
      header: 'Estado',
      body: statusBodyTemplate,
      sortable: true,
      filter: true,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nueva Regla"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.paymentRules?.data}
        totalRecords={data?.paymentRules?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={['name', 'paymentType']}
        emptyMessage="No se encontraron reglas de pago"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reglas"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: '10rem' }}
          bodyStyle={{ textAlign: 'center' }}
        />
      </GenericDataTable>

      <PaymentRuleEditForm
        paymentRuleId={selectedPaymentRuleId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <PaymentRuleCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <PaymentRuleDetailForm
        paymentRuleId={selectedPaymentRuleId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}