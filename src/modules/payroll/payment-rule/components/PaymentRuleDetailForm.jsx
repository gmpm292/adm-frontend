import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_PAYMENT_RULE_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";

const paymentTypeLabels = {
  PRICE_RANGE: "Rango de Precios",
  SALE_QUANTITY: "Cantidad de Ventas",
  FIXED_AMOUNT: "Monto Fijo",
  PERCENTAGE: "Porcentaje",
};

const workerTypeLabels = {
  PUBLICIST: "Publicista",
  ECONOMIC: "Económico",
  SERVICE: "Trabajador de servicios",
  COURIER: "Mensajero",
  TECHNICIAN: "Técnico/Especialista",
  OPERATIVE: "Personal operativo",
  PRINCIPAL: "Director",
  ADMINISTRATIVE: "Administrativo",
  MANAGER: "Gerente",
  SUPERVISOR: "Supervisor",
  AGENT: "Agente",
  OTHER: "Otro",
};

const scopeLabels = {
  BUSINESS: "Business",
  OFFICE: "Oficina",
  DEPARTMENT: "Departamento",
  TEAM: "Equipo",
  PERSONAL: "Personal",
  RELATED: "Relacionado",
};

export const PaymentRuleDetailForm = ({ paymentRuleId, visible, onHide }) => {
  const [getPaymentRule, { data, loading }] = useLazyQuery(
    GET_PAYMENT_RULE_BY_ID,
    {
      variables: { id: paymentRuleId },
      fetchPolicy: "network-only",
      skip: !paymentRuleId,
    },
  );

  useEffect(() => {
    if (visible && paymentRuleId) {
      getPaymentRule();
    }
  }, [visible, paymentRuleId, getPaymentRule]);

  const renderConditions = (paymentRule) => {
    if (!paymentRule.conditions) return null;

    return (
      <div className="p-fluid">
        <div className="field">
          <b>Moneda de Pago:</b>{" "}
          {paymentRule.paymentCurrency || "No especificada"}
        </div>
        <div className="field">
          <b>Ámbito:</b> {scopeLabels[paymentRule.scope] || "No especificado"}
        </div>
        <div className="field">
          <b>Distribuir Beneficios:</b>{" "}
          {paymentRule.distributeProfits ? "Sí" : "No"}
        </div>

        {paymentRule.conditions.priceRanges?.length > 0 && (
          <div className="field">
            <b>Rangos de Precio:</b>
            <ul>
              {paymentRule.conditions.priceRanges.map((range, index) => (
                <li key={index}>
                  {range.min} - {range.max || "∞"} {range.currency}:
                  {range.amount !== null ? ` ${range.amount}` : ""}
                  {range.percentage !== null ? ` ${range.percentage}%` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {paymentRule.conditions.saleQuantity?.length > 0 && (
          <div className="field">
            <b>Condiciones de Cantidad:</b>
            <ul>
              {paymentRule.conditions.saleQuantity.map((cond, index) => (
                <li key={index}>
                  Mín. {cond.minProducts} productos:
                  {cond.ratePerProduct !== null
                    ? ` ${cond.ratePerProduct} por producto`
                    : ""}
                  {cond.percentagePerProduct !== null
                    ? ` ${cond.percentagePerProduct}% por producto`
                    : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {paymentRule.conditions.fixedAmount && (
          <div className="field">
            <b>Monto Fijo:</b> {paymentRule.conditions.fixedAmount.amount}
          </div>
        )}

        {paymentRule.conditions.percentage && (
          <div className="field">
            <b>Porcentaje:</b> {paymentRule.conditions.percentage.percentage}%
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
      style={{ width: "700px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : paymentRule ? (
        <div className="p-fluid">
          <div className="field">
            <b>Nombre:</b> {paymentRule.name}
          </div>
          <div className="field">
            <b>Descripción:</b> {paymentRule.description || "N/A"}
          </div>
          <div className="field">
            <b>Tipo de Pago:</b> {paymentTypeLabels[paymentRule.paymentType]}
          </div>
          <div className="field">
            <b>Tipo de Trabajador:</b>{" "}
            {paymentRule.workerType === "OTHER"
              ? paymentRule.otherType
              : workerTypeLabels[paymentRule.workerType]}
          </div>
          <div className="field">
            <b>Estado:</b> {paymentRule.isActive ? "Activo" : "Inactivo"}
          </div>
          <div className="field">
            <b>Business:</b> {paymentRule.business?.name || "N/A"}
          </div>
          <div className="field">
            <b>Oficina:</b> {paymentRule.office?.name || "N/A"}
          </div>
          <div className="field">
            <b>Departamento:</b> {paymentRule.department?.name || "N/A"}
          </div>
          <div className="field">
            <b>Equipo:</b> {paymentRule.team?.name || "N/A"}
          </div>
          <div className="field">
            <b>Producto:</b> {paymentRule.product?.name || "N/A"}
          </div>
          <div className="field">
            <b>Categoría:</b> {paymentRule.category?.name || "N/A"}
          </div>
          <div className="field">
            <b>Trabajadores Específicos:</b>
            {paymentRule.specificWorkersIds?.length > 0
              ? paymentRule.specificWorkersIds.join(", ")
              : "Ninguno"}
          </div>

          <h4>Condiciones</h4>
          {renderConditions(paymentRule)}
        </div>
      ) : (
        <p>No se encontró información de la regla de pago.</p>
      )}
    </Dialog>
  );
};
