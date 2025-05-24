import React, { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_PAYMENT_RULE_BY_ID } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';

const paymentTypeLabels = {
  PRICE_RANGE: 'Rango de Precios',
  SALE_QUANTITY: 'Cantidad de Ventas',
  FIXED_AMOUNT: 'Monto Fijo',
  PERCENTAGE: 'Porcentaje'
};

const workerTypeLabels = {
  AGENT: 'Agente',
  PUBLICIST: 'Publicista',
  ECONOMIC: 'Económico',
  OTHER: 'Otro'
};

const scopeLabels = {
  BUSINESS: 'Business',
  OFFICE: 'Oficina',
  DEPARTMENT: 'Departamento',
  TEAM: 'Equipo',
  PERSONAL: 'Personal'
};

export const PaymentRuleDetailForm = ({ paymentRuleId, visible, onHide }) => {
  const [getPaymentRule, { data, loading }] = useLazyQuery(GET_PAYMENT_RULE_BY_ID, {
    variables: { id: paymentRuleId },
    fetchPolicy: 'network-only',
    skip: !paymentRuleId,
  });

  useEffect(() => {
    if (visible && paymentRuleId) {
      getPaymentRule();
    }
  }, [visible, paymentRuleId, getPaymentRule]);

  const renderConditions = (conditions) => {
    if (!conditions) return null;

    return (
      <div className="p-fluid">
        <div className="field">
          <b>Moneda de Pago:</b> {conditions.paymentCurrency || 'No especificada'}
        </div>

        {conditions.priceRanges?.length > 0 && (
          <div className="field">
            <b>Rangos de Precio:</b>
            <ul>
              {conditions.priceRanges.map((range, index) => (
                <li key={index}>
                  {range.min} - {range.max || '∞'} {range.currency}: {range.amount} ({scopeLabels[range.scope]})
                </li>
              ))}
            </ul>
          </div>
        )}

        {conditions.saleQuantity?.length > 0 && (
          <div className="field">
            <b>Condiciones de Cantidad:</b>
            <ul>
              {conditions.saleQuantity.map((cond, index) => (
                <li key={index}>
                  Mín. {cond.minProducts} productos: {cond.ratePerProduct} por producto ({scopeLabels[cond.scope]})
                </li>
              ))}
            </ul>
          </div>
        )}

        {conditions.fixedAmount && (
          <div className="field">
            <b>Monto Fijo:</b> {conditions.fixedAmount.amount} ({scopeLabels[conditions.fixedAmount.scope]})
          </div>
        )}

        {conditions.percentage && (
          <div className="field">
            <b>Porcentaje:</b> {conditions.percentage.percentage}% ({scopeLabels[conditions.percentage.scope]})
          </div>
        )}
      </div>
    );
  };

  const paymentRule = data?.paymentRule;

  return (
    <Dialog
      header="Detalles de Regla de Pago"
      visible={visible}
      style={{ width: '700px' }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : paymentRule ? (
        <div className="p-fluid">
          <div className="field"><b>Nombre:</b> {paymentRule.name}</div>
          <div className="field"><b>Descripción:</b> {paymentRule.description || 'N/A'}</div>
          <div className="field"><b>Tipo de Pago:</b> {paymentTypeLabels[paymentRule.paymentType]}</div>
          <div className="field"><b>Tipo de Trabajador:</b> {workerTypeLabels[paymentRule.workerType]}</div>
          <div className="field"><b>Estado:</b> {paymentRule.isActive ? 'Activo' : 'Inactivo'}</div>
          <div className="field"><b>Business:</b> {paymentRule.business?.name || 'N/A'}</div>
          <div className="field"><b>Oficina:</b> {paymentRule.office?.name || 'N/A'}</div>
          <div className="field"><b>Departamento:</b> {paymentRule.department?.name || 'N/A'}</div>
          <div className="field"><b>Equipo:</b> {paymentRule.team?.name || 'N/A'}</div>
          
          <h4>Condiciones</h4>
          {renderConditions(paymentRule.conditions)}
        </div>
      ) : (
        <p>No se encontró información de la regla de pago.</p>
      )}
    </Dialog>
  );
};