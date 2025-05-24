import React, { useCallback, useState, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_WORKER_PAYMENTS, REMOVE_WORKER_PAYMENTS } from '../graphql/queries';
import GenericDataTable from '../../../../components/BaseTable/index';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { WorkerPaymentEditForm } from './WorkerPaymentEditForm';
import { WorkerPaymentCreateForm } from './WorkerPaymentCreateForm';
import { WorkerPaymentDetailForm } from './WorkerPaymentDetailForm';

const paymentMethodBodyTemplate = (rowData) => {
  const methods = {
    CASH: 'Efectivo',
    BANK_TRANSFER: 'Transferencia',
    CHECK: 'Cheque',
    MOBILE_PAYMENT: 'Pago Móvil',
    OTHER: 'Otro'
  };
  return methods[rowData.paymentMethod] || rowData.paymentMethod;
};

const paymentTypeBodyTemplate = (rowData) => {
  const types = {
    SALARY: 'Salario',
    COMMISSION: 'Comisión',
    BONUS: 'Bono',
    OTHER: 'Otro'
  };
  return types[rowData.paymentType] || rowData.paymentType;
};

const workerBodyTemplate = (rowData) => {
  return rowData.worker?.user ? `${rowData.worker.user.name} ${rowData.worker.user.lastName}` : 'N/A';
};

const amountBodyTemplate = (rowData) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: rowData.currency || 'USD'
  }).format(rowData.amount);
};

const dateBodyTemplate = (rowData) => {
  return new Date(rowData.createdAt).toLocaleDateString();
};

export function WorkerPaymentTable() {
  const [getWorkerPayments, { loading, data, error }] = useLazyQuery(GET_WORKER_PAYMENTS, {
    fetchPolicy: 'network-only',
  });
  const [removeWorkerPayments] = useMutation(REMOVE_WORKER_PAYMENTS);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
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

        const { data: responseData } = await getWorkerPayments({
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
          data: responseData?.workerPayments?.data,
          totalCount: responseData?.workerPayments?.totalCount,
        };
      } catch (err) {
        console.error('Error fetching worker payments:', err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getWorkerPayments]
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
    setSelectedPaymentId(id);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (id) => {
    setSelectedPaymentId(id);
    setDetailDialogVisible(true);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar este pago?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await removeWorkerPayments({ variables: { ids: [id] } });

          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago eliminado correctamente',
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
      field: 'worker.user.name',
      header: 'Trabajador',
      body: workerBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: 'amount',
      header: 'Monto',
      body: amountBodyTemplate,
      sortable: true,
    },
    {
      field: 'paymentMethod',
      header: 'Método',
      body: paymentMethodBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: 'paymentType',
      header: 'Tipo',
      body: paymentTypeBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: 'createdAt',
      header: 'Fecha',
      body: dateBodyTemplate,
      sortable: true,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Registrar Nuevo Pago"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.workerPayments?.data}
        totalRecords={data?.workerPayments?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={['worker.user.name', 'paymentMethod', 'paymentType']}
        emptyMessage="No se encontraron pagos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pagos"
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

      <WorkerPaymentEditForm
        paymentId={selectedPaymentId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <WorkerPaymentCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <WorkerPaymentDetailForm
        paymentId={selectedPaymentId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}