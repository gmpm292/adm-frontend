import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_CUSTOMER_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";

export function CustomerDetailForm({ customerId, visible, onHide }) {
  const [getCustomer, { data, loading }] = useLazyQuery(GET_CUSTOMER_BY_ID, {
    variables: { id: customerId },
    fetchPolicy: "network-only",
    skip: !customerId,
  });

  useEffect(() => {
    if (visible && customerId) {
      getCustomer();
    }
  }, [visible, customerId, getCustomer]);

  const customer = data?.customer;

  return (
    <Dialog
      header="Detalles del Cliente"
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : customer ? (
        <div className="p-fluid">
          <div className="field"><b>Nombre:</b> {customer.name}</div>
          <div className="field"><b>Email:</b> {customer.email || 'N/A'}</div>
          <div className="field"><b>Teléfono:</b> {customer.phone || 'N/A'}</div>
          <div className="field"><b>Puntos de fidelidad:</b> {customer.loyaltyPoints}</div>
          <div className="field"><b>Business:</b> {customer.business?.name || 'N/A'}</div>
          <div className="field"><b>Oficina:</b> {customer.office?.name || 'N/A'}</div>
          <div className="field"><b>Departamento:</b> {customer.department?.name || 'N/A'}</div>
          <div className="field"><b>Equipo:</b> {customer.team?.name || 'N/A'}</div>
          <div className="field"><b>Usuario asociado:</b> {customer.user?.name || 'N/A'}</div>
        </div>
      ) : (
        <p>No se encontró información del cliente.</p>
      )}
    </Dialog>
  );
}