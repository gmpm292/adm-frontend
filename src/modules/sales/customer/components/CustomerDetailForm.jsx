import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_CUSTOMER_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";

const DetailItem = ({ label, children }) => (
  <div className="col-12 md:col-6">
    <span className="block text-sm text-color-secondary mb-1">{label}</span>
    <span className="font-medium">{children}</span>
  </div>
);

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
      className="w-full md:w-30rem"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : customer ? (
        <div className="grid">
          <DetailItem label="Nombre">{customer.name}</DetailItem>
          <DetailItem label="Email">{customer.email || 'N/A'}</DetailItem>
          <DetailItem label="Teléfono">{customer.phone || 'N/A'}</DetailItem>
          <DetailItem label="Puntos de fidelidad">{customer.loyaltyPoints}</DetailItem>
          <DetailItem label="Business">{customer.business?.name || 'N/A'}</DetailItem>
          <DetailItem label="Oficina">{customer.office?.name || 'N/A'}</DetailItem>
          <DetailItem label="Departamento">{customer.department?.name || 'N/A'}</DetailItem>
          <DetailItem label="Equipo">{customer.team?.name || 'N/A'}</DetailItem>
          <DetailItem label="Usuario asociado">{customer.user?.name || 'N/A'}</DetailItem>
        </div>
      ) : (
        <p className="text-color-secondary">No se encontró información del cliente.</p>
      )}
    </Dialog>
  );
}
