import React, { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_CURRENCY_BY_CODE } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';

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
      style={{ width: '600px' }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : currency ? (
        <div className="p-fluid">
          <div className="field"><b>Código:</b> {currency.code}</div>
          <div className="field"><b>Nombre:</b> {currency.name}</div>
          <div className="field"><b>Símbolo:</b> {currency.symbol}</div>
          <div className="field"><b>Tasa de cambio (CUP):</b> {currency.exchangeRateToCUP}</div>
          <div className="field"><b>Estado:</b> {currency.isActive ? 'Activo' : 'Inactivo'}</div>
          <div className="field"><b>Business:</b> {currency.business?.name || 'N/A'}</div>
          <div className="field"><b>Oficina:</b> {currency.office?.name || 'N/A'}</div>
          <div className="field"><b>Departamento:</b> {currency.department?.name || 'N/A'}</div>
          <div className="field"><b>Equipo:</b> {currency.team?.name || 'N/A'}</div>
          <div className="field"><b>Creado en:</b> {new Date(currency.createdAt).toLocaleString()}</div>
          <div className="field"><b>Última actualización:</b> {new Date(currency.updatedAt).toLocaleString()}</div>
        </div>
      ) : (
        <p>No se encontró información de la moneda.</p>
      )}
    </Dialog>
  );
};