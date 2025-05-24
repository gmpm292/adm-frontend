import React, { useCallback, useState, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_CURRENCIES, DEACTIVATE_CURRENCY, ACTIVATE_CURRENCY } from '../graphql/queries';
import GenericDataTable from '../../../../components/BaseTable/index';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { CurrencyEditForm } from './CurrencyEditForm';
import { CurrencyCreateForm } from './CurrencyCreateForm';
import { CurrencyDetailForm } from './CurrencyDetailForm';

const statusBodyTemplate = (rowData) => {
  return (
    <span className={`badge status-${rowData.isActive ? 'active' : 'inactive'}`}>
      {rowData.isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
};

export function CurrencyTable() {
  const [getCurrencies, { loading, data, error }] = useLazyQuery(GET_CURRENCIES, {
    fetchPolicy: 'network-only',
  });
  const [deactivateCurrency] = useMutation(DEACTIVATE_CURRENCY);
  const [activateCurrency] = useMutation(ACTIVATE_CURRENCY);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(null);
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

        const { data: responseData } = await getCurrencies({
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
          data: responseData?.currencies?.data,
          totalCount: responseData?.currencies?.totalCount,
        };
      } catch (err) {
        console.error('Error fetching currencies:', err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getCurrencies]
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

  const handleEdit = (currencyCode) => {
    setSelectedCurrencyCode(currencyCode);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (currencyCode) => {
    setSelectedCurrencyCode(currencyCode);
    setDetailDialogVisible(true);
  };

  const handleToggleStatus = (currencyCode, isActive) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas ${isActive ? 'desactivar' : 'activar'} esta moneda?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const mutation = isActive ? deactivateCurrency : activateCurrency;
          await mutation({ variables: { code: currencyCode } });

          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: `Moneda ${isActive ? 'desactivada' : 'activada'} correctamente`,
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
          tooltip="Editar moneda"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleEdit(rowData.code)}
        />
        <Button
          icon={rowData.isActive ? 'pi pi-ban' : 'pi pi-check'}
          className={`p-button-rounded p-button-text ${rowData.isActive ? 'p-button-warning' : 'p-button-success'}`}
          tooltip={rowData.isActive ? 'Desactivar' : 'Activar'}
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleToggleStatus(rowData.code, rowData.isActive)}
        />
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleViewDetails(rowData.code)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: 'code',
      header: 'Código',
      sortable: true,
      filter: true,
    },
    {
      field: 'name',
      header: 'Nombre',
      sortable: true,
      filter: true,
    },
    {
      field: 'symbol',
      header: 'Símbolo',
      sortable: true,
      filter: true,
    },
    {
      field: 'exchangeRateToCUP',
      header: 'Tasa de cambio (CUP)',
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
      tooltip="Crear Nueva Moneda"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.currencies?.data}
        totalRecords={data?.currencies?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={['code', 'name']}
        emptyMessage="No se encontraron monedas"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} monedas"
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

      <CurrencyEditForm
        currencyCode={selectedCurrencyCode}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <CurrencyCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <CurrencyDetailForm
        currencyCode={selectedCurrencyCode}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}