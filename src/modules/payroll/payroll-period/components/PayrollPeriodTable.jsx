import React, { useCallback, useState, useRef, useMemo } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  GET_PAYROLL_PERIODS,
  REMOVE_PAYROLL_PERIODS,
} from '../graphql/queries';
import GenericDataTable from '../../../../components/BaseTable/index';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { PayrollPeriodEditForm } from './PayrollPeriodEditForm';
import { PayrollPeriodCreateForm } from './PayrollPeriodCreateForm';
import { PayrollPeriodDetailForm } from './PayrollPeriodDetailForm';
import { PayrollPeriodCloseDialog } from './PayrollPeriodCloseDialog';
import { PayrollPeriodCalculateDialog } from './PayrollPeriodCalculateDialog';

// ==================== BODY TEMPLATES ====================

/**
 * Template para mostrar el ID
 */
const idBodyTemplate = (rowData) => {
  return <Badge value={`#${rowData.id}`} severity="info" />;
};

/**
 * Template para el estado del período
 */
const statusBodyTemplate = (rowData) => {
  return (
    <Tag
      value={rowData.isClosed ? 'Cerrado' : 'Abierto'}
      severity={rowData.isClosed ? 'danger' : 'success'}
      icon={rowData.isClosed ? 'pi pi-lock' : 'pi pi-lock-open'}
    />
  );
};

/**
 * Template para formatear fechas
 */
const dateBodyTemplate = (rowData, field) => {
  if (!rowData[field]) return '—';
  const date = new Date(rowData[field]);
  return (
    <div className="flex flex-column">
      <span>{date.toLocaleDateString()}</span>
      <small className="text-secondary">{date.toLocaleTimeString()}</small>
    </div>
  );
};

/**
 * Template para el rango de fechas del período
 */
const dateRangeBodyTemplate = (rowData) => {
  const startDate = rowData.startDate ? new Date(rowData.startDate) : null;
  const endDate = rowData.endDate ? new Date(rowData.endDate) : null;

  return (
    <div className="flex flex-column">
      <span>
        <strong>Inicio:</strong> {startDate?.toLocaleDateString() || '—'}
      </span>
      <span>
        <strong>Fin:</strong> {endDate?.toLocaleDateString() || '—'}
      </span>
    </div>
  );
};

/**
 * Template para la estructura organizativa
 */
const securityEntitiesBodyTemplate = (rowData) => {
  const entities = [];

  if (rowData.business) entities.push(`🏢 ${rowData.business.name}`);
  if (rowData.office) entities.push(`🏢 ${rowData.office.name}`);
  if (rowData.department) entities.push(`📊 ${rowData.department.name}`);
  if (rowData.team) entities.push(`👥 ${rowData.team.name}`);

  return (
    <div className="flex flex-column">
      {entities.length > 0 ? (
        entities.map((entity, index) => <small key={index}>{entity}</small>)
      ) : (
        <span className="text-secondary">—</span>
      )}
    </div>
  );
};

/**
 * Template para el resumen de pagos
 */
const paymentsSummaryBodyTemplate = (rowData) => {
  const payments = rowData.payments || [];
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidCount = payments.filter(p => p.paidDate).length;
  const pendingCount = payments.length - paidCount;

  return (
    <div className="flex flex-column">
      <span>
        <strong>Total:</strong> {payments.length} pagos
      </span>
      {totalAmount > 0 && (
        <span>
          <strong>Monto:</strong> {new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
          }).format(totalAmount)}
        </span>
      )}
      <div className="flex gap-2 mt-1">
        <Tag value={`${paidCount} pagados`} severity="success" />
        {pendingCount > 0 && (
          <Tag value={`${pendingCount} pendientes`} severity="warning" />
        )}
      </div>
    </div>
  );
};

/**
 * Template para la descripción
 */
const descriptionBodyTemplate = (rowData) => {
  const description = rowData.description;
  if (!description) return '—';
  return description.length > 50 ? `${description.substring(0, 50)}...` : description;
};

/**
 * Template para el creador/actualizador
 */
const auditBodyTemplate = (rowData) => {
  const createdBy = rowData.createdBy;
  const updatedBy = rowData.updatedBy;

  return (
    <div className="flex flex-column">
      {createdBy && (
        <small>
          <strong>Creado:</strong> {createdBy.name || createdBy.email || `#${createdBy.id}`}
          <br />
          <span className="text-secondary">{new Date(rowData.createdAt).toLocaleDateString()}</span>
        </small>
      )}
      {updatedBy && createdBy?.id !== updatedBy?.id && (
        <small>
          <strong>Actualizado:</strong> {updatedBy.name || updatedBy.email || `#${updatedBy.id}`}
          <br />
          <span className="text-secondary">{new Date(rowData.updatedAt).toLocaleDateString()}</span>
        </small>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export function PayrollPeriodTable() {
  const [getPayrollPeriods, { loading, data, error }] = useLazyQuery(GET_PAYROLL_PERIODS, {
    fetchPolicy: 'network-only',
  });
  const [removePayrollPeriods] = useMutation(REMOVE_PAYROLL_PERIODS);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [selectedPeriodForCalc, setSelectedPeriodForCalc] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [closeDialogVisible, setCloseDialogVisible] = useState(false);
  const [calculateDialogVisible, setCalculateDialogVisible] = useState(false);
  const toast = useRef(null);
  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

  // Definir todas las columnas disponibles del backend
  const columns = useMemo(
    () => [
      {
        field: 'id',
        header: 'ID',
        body: idBodyTemplate,
        sortable: true,
        style: { width: '80px' },
      },
      {
        field: 'name',
        header: 'Nombre',
        sortable: true,
        filter: true,
        style: { minWidth: '150px' },
      },
      {
        field: 'description',
        header: 'Descripción',
        body: descriptionBodyTemplate,
        sortable: true,
        filter: true,
        style: { minWidth: '200px' },
        visible: false, // Oculta por defecto para no saturar
      },
      {
        field: 'dateRange',
        header: 'Período',
        body: dateRangeBodyTemplate,
        sortable: false,
        style: { minWidth: '200px' },
      },
      {
        field: 'startDate',
        header: 'Fecha Inicio',
        body: (rowData) => dateBodyTemplate(rowData, 'startDate'),
        sortable: true,
        style: { width: '150px' },
        visible: false,
      },
      {
        field: 'endDate',
        header: 'Fecha Fin',
        body: (rowData) => dateBodyTemplate(rowData, 'endDate'),
        sortable: true,
        style: { width: '150px' },
        visible: false,
      },
      {
        field: 'isClosed',
        header: 'Estado',
        body: statusBodyTemplate,
        sortable: true,
        filter: true,
        style: { width: '120px' },
      },
      {
        field: 'entities',
        header: 'Organización',
        body: securityEntitiesBodyTemplate,
        style: { minWidth: '150px' },
      },
      {
        field: 'payments',
        header: 'Resumen de Pagos',
        body: paymentsSummaryBodyTemplate,
        style: { minWidth: '200px' },
      },
      {
        field: 'createdAt',
        header: 'Creado',
        body: (rowData) => dateBodyTemplate(rowData, 'createdAt'),
        sortable: true,
        style: { width: '150px' },
        visible: false,
      },
      {
        field: 'updatedAt',
        header: 'Actualizado',
        body: (rowData) => dateBodyTemplate(rowData, 'updatedAt'),
        sortable: true,
        style: { width: '150px' },
        visible: false,
      },
      {
        field: 'audit',
        header: 'Auditoría',
        body: auditBodyTemplate,
        style: { minWidth: '200px' },
        visible: false,
      },
    ],
    [],
  );

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
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los períodos de nómina',
          life: 3000,
        });
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

  const handleCalculateSuccess = useCallback(() => {
    // Opcional: refrescar después de calcular para ver nuevos pagos
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

  const handleCalculate = (rowData) => {
    setSelectedPeriodForCalc(rowData);
    setCalculateDialogVisible(true);
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
      <div className="actions-column" style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
        <Button
          icon="pi pi-chart-line"
          className="p-button-rounded p-button-text p-button-success"
          tooltip="Calcular Pagos"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleCalculate(rowData)}
        />
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

  const addButton = (
    <Button
      icon="pi pi-plus"
      label="Nuevo Período"
      tooltip="Crear Nuevo Período de Nómina"
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
        globalFilterFields={[
          'name',
          'description',
        ]}
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
        payrollPeriodId={selectedPeriodId}
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
        payrollPeriodId={selectedPeriodId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />

      <PayrollPeriodCloseDialog
        periodId={selectedPeriodId}
        visible={closeDialogVisible}
        onHide={() => setCloseDialogVisible(false)}
        onSuccess={handleCloseSuccess}
      />

      <PayrollPeriodCalculateDialog
        period={selectedPeriodForCalc}
        visible={calculateDialogVisible}
        onHide={() => {
          setCalculateDialogVisible(false);
          setSelectedPeriodForCalc(null);
        }}
        onSuccess={handleCalculateSuccess}
      />
    </>
  );
}