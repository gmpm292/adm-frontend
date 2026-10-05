import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_PAYMENT_RULE_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { FormField } from "../../../../components/ui";

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
      <div className="grid">
        <div className="col-12 md:col-6">
          <FormField label="Moneda de Pago">
            <div>
              {paymentRule.paymentCurrency || "No especificada"}
            </div>
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField label="Ámbito">
            <div>
              {scopeLabels[paymentRule.scope] || "No especificado"}
            </div>
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField label="Distribuir Beneficios">
            <div>
              {paymentRule.distributeProfits ? "Sí" : "No"}
            </div>
          </FormField>
        </div>

        {paymentRule.conditions.priceRanges?.length > 0 && (
          <div className="col-12">
            <FormField label="Rangos de Precio">
              <div>
                <ul className="m-0 pl-4">
                  {paymentRule.conditions.priceRanges.map((range, index) => (
                    <li key={index}>
                      {range.min} - {range.max || "∞"} {range.currency}:
                      {range.amount !== null ? ` ${range.amount}` : ""}
                      {range.percentage !== null ? ` ${range.percentage}%` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </FormField>
          </div>
        )}

        {paymentRule.conditions.saleQuantity?.length > 0 && (
          <div className="col-12">
            <FormField label="Condiciones de Cantidad">
              <div>
                <ul className="m-0 pl-4">
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
            </FormField>
          </div>
        )}

        {paymentRule.conditions.fixedAmount && (
          <div className="col-12 md:col-6">
            <FormField label="Monto Fijo">
              <div>
                {paymentRule.conditions.fixedAmount.amount}
              </div>
            </FormField>
          </div>
        )}

        {paymentRule.conditions.percentage && (
          <div className="col-12 md:col-6">
            <FormField label="Porcentaje">
              <div>
                {paymentRule.conditions.percentage.percentage}%
              </div>
            </FormField>
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
      className="w-full md:w-8 lg:w-6"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : paymentRule ? (
        <div className="grid">
          <div className="col-12 md:col-6">
            <FormField label="Nombre">
              <div>
                {paymentRule.name}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Descripción">
              <div>
                {paymentRule.description || "N/A"}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Tipo de Pago">
              <div>
                {paymentTypeLabels[paymentRule.paymentType]}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Tipo de Trabajador">
              <div>
                {paymentRule.workerType === "OTHER"
                  ? paymentRule.otherType
                  : workerTypeLabels[paymentRule.workerType]}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Estado">
              <div>
                <Tag
                  severity={paymentRule.isActive ? "success" : "danger"}
                  value={paymentRule.isActive ? "Activo" : "Inactivo"}
                />
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Business">
              <div>
                {paymentRule.business?.name || "N/A"}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Oficina">
              <div>
                {paymentRule.office?.name || "N/A"}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Departamento">
              <div>
                {paymentRule.department?.name || "N/A"}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Equipo">
              <div>
                {paymentRule.team?.name || "N/A"}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Producto">
              <div>
                {paymentRule.product?.name || "N/A"}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Categoría">
              <div>
                {paymentRule.category?.name || "N/A"}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Trabajadores Específicos">
              <div>
                {paymentRule.specificWorkersIds?.length > 0
                  ? paymentRule.specificWorkersIds.join(", ")
                  : "Ninguno"}
              </div>
            </FormField>
          </div>

          <div className="col-12">
            <h4 className="mt-0 mb-3">Condiciones</h4>
            {renderConditions(paymentRule)}
          </div>
        </div>
      ) : (
        <p className="text-color-secondary">
          No se encontró información de la regla de pago.
        </p>
      )}
    </Dialog>
  );
};
