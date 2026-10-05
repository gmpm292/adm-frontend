import React, { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_CURRENCY_BY_CODE } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { FormField } from '../../../../components/ui';

export const CurrencyDetailForm = ({ currencyCode, visible, onHide }) => {
  const [getCurrency, { data, loading }] = useLazyQuery(GET_CURRENCY_BY_CODE, {
    variables: { code: currencyCode },
    fetchPolicy: 'network-only',
    skip: !currencyCode,
  });

  useEffect(() => {
    if (visible && currencyCode) {
      getCurrency();
    }
  }, [visible, currencyCode, getCurrency]);

  const currency = data?.currency;

  return (
    <Dialog
      header="Detalles de la Moneda"
      visible={visible}
      className="w-full md:w-30rem"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : currency ? (
        <div className="grid">
          <div className="col-12 md:col-6">
            <FormField label="Código">
              <span>{currency.code}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Nombre">
              <span>{currency.name}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Símbolo">
              <span>{currency.symbol}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Tasa de cambio (CUP)">
              <span>{currency.exchangeRateToCUP}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Estado">
              <div>
                <Tag
                  severity={currency.isActive ? 'success' : 'danger'}
                  value={currency.isActive ? 'Activo' : 'Inactivo'}
                />
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Business">
              <span>{currency.business?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Oficina">
              <span>{currency.office?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Departamento">
              <span>{currency.department?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Equipo">
              <span>{currency.team?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Creado en">
              <span>{new Date(currency.createdAt).toLocaleString()}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Última actualización">
              <span>{new Date(currency.updatedAt).toLocaleString()}</span>
            </FormField>
          </div>
        </div>
      ) : (
        <p className="text-color-secondary">No se encontró información de la moneda.</p>
      )}
    </Dialog>
  );
};
