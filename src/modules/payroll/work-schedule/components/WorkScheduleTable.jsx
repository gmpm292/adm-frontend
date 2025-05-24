import React, { useCallback, useState, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_WORK_SCHEDULES, REMOVE_WORK_SCHEDULES } from '../graphql/queries';
import GenericDataTable from '../../../../components/BaseTable/index';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { WorkScheduleEditForm } from './WorkScheduleEditForm';
import { WorkScheduleCreateForm } from './WorkScheduleCreateForm';
import { WorkScheduleDetailForm } from './WorkScheduleDetailForm';

const dateBodyTemplate = (rowData, field) => {
  return new Date(rowData[field]).toLocaleDateString();
};

const recurringBodyTemplate = (rowData) => {
  return rowData.isRecurring ? 'Sí' : 'No';
};

const officeBodyTemplate = (rowData) => {
  return rowData.office?.name || 'N/A';
};

export function WorkScheduleTable() {
  const [getWorkSchedules, { loading, data, error }] = useLazyQuery(GET_WORK_SCHEDULES, {
    fetchPolicy: 'network-only',
  });
  const [removeWorkSchedules] = useMutation(REMOVE_WORK_SCHEDULES);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
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

        const { data: responseData } = await getWorkSchedules({
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
          data: responseData?.workSchedules?.data,
          totalCount: responseData?.workSchedules?.totalCount,
        };
      } catch (err) {
        console.error('Error fetching work schedules:', err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getWorkSchedules]
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
    setSelectedScheduleId(id);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (id) => {
    setSelectedScheduleId(id);
    setDetailDialogVisible(true);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar este horario laboral?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await removeWorkSchedules({ variables: { ids: [id] } });

          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Horario laboral eliminado correctamente',
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
      field: 'office.name',
      header: 'Oficina',
      body: officeBodyTemplate,
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
      field: 'isRecurring',
      header: 'Recurrente',
      body: recurringBodyTemplate,
      sortable: true,
      filter: true,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nuevo Horario"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.workSchedules?.data}
        totalRecords={data?.workSchedules?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={['office.name']}
        emptyMessage="No se encontraron horarios laborales"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} horarios"
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

      <WorkScheduleEditForm
        scheduleId={selectedScheduleId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <WorkScheduleCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <WorkScheduleDetailForm
        scheduleId={selectedScheduleId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}