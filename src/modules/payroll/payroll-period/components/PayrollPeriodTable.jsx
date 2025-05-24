import React, { useCallback, useState, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_PAYROLL_PERIODS, REMOVE_PAYROLL_PERIODS } from '../graphql/queries';
import GenericDataTable from '../../../../components/BaseTable/index';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { PayrollPeriodEditForm } from './PayrollPeriodEditForm';
import { PayrollPeriodCreateForm } from './PayrollPeriodCreateForm';
import { PayrollPeriodDetailForm } from './PayrollPeriodDetailForm';
import { PayrollPeriodCloseDialog } from './PayrollPeriodCloseDialog';

const statusBodyTemplate = (rowData) => {
  return (
    <span className={`badge status-${rowData.isClosed ? 'inactive' : 'active'}`}>
      {rowData.isClosed ? 'Cerrado' : 'Abierto'}
    </span>
  );
};

const dateBodyTemplate = (rowData, field) => {
  return new Date(rowData[field]).toLocaleDateString();
};

export function PayrollPeriodTable() {
  const [getPayrollPeriods, { loading, data, error }] = useLazyQuery(GET_PAYROLL_PERIODS, {
    fetchPolicy: 'network-only',
  });
  const [removePayrollPeriods] = useMutation(REMOVE_PAYROLL_PERIODS);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [closeDialogVisible, setCloseDialogVisible] = useState(false);
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

        const { data: responseData } = await getPayrollPeriods({
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
          data: responseData?.payrollPeriods?.data,
          totalCount: responseData?.payrollPeriods?.totalCount,
        };
      } catch (err) {
        console.error('Error fetching payroll periods:', err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getPayrollPeriods]
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

  const handleCloseSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (id) => {
    setSelectedPeriodId(id);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (id) => {
    setSelectedPeriodId(id);
    setDetailDialogVisible(true);
  };

  const handleClosePeriod = (id) => {
    setSelectedPeriodId(id);
    setCloseDialogVisible(true);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar este período de nómina?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await removePayrollPeriods({ variables: { ids: [id] } });

          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Período de nómina eliminado correctamente',
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
        {!rowData.isClosed && (
          <>
            <Button
              icon="pi pi-pencil"
              className="p-button-rounded p-button-text"
              tooltip="Editar"
              tooltipOptions={{ position: 'top' }}
              onClick={() => handleEdit(rowData.id)}
            />
            <Button
              icon="pi pi-lock"
              className="p-button-rounded p-button-text p-button-warning"
              tooltip="Cerrar período"
              tooltipOptions={{ position: 'top' }}
              onClick={() => handleClosePeriod(rowData.id)}
            />
          </>
        )}
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
      field: 'startDate',
      header: 'Fecha Inicio',
      body: (rowData) => dateBodyTemplate(rowData, 'startDate'),
      sortable: true,
    },
    {
      field: 'endDate',
      header: 'Fecha Fin',
      body: (rowData) => dateBodyTemplate(rowData, 'endDate'),
      sortable: true,
    },
    {
      field: 'isClosed',
      header: 'Estado',
      body: statusBodyTemplate,
      sortable: true,
      filter: true,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nuevo Período"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.payrollPeriods?.data}
        totalRecords={data?.payrollPeriods?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={['name']}
        emptyMessage="No se encontraron períodos de nómina"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} períodos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: '12rem' }}
          bodyStyle={{ textAlign: 'center' }}
        />
      </GenericDataTable>

      <PayrollPeriodEditForm
        periodId={selectedPeriodId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <PayrollPeriodCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <PayrollPeriodDetailForm
        periodId={selectedPeriodId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />

      <PayrollPeriodCloseDialog
        periodId={selectedPeriodId}
        visible={closeDialogVisible}
        onHide={() => setCloseDialogVisible(false)}
        onSuccess={handleCloseSuccess}
      />
    </>
  );
}