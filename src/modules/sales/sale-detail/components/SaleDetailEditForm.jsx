import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { useMutation, useQuery } from "@apollo/client";
import { GET_SALE_DETAIL_BY_ID, UPDATE_SALE_DETAIL } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { PublicistSelector } from "./PublicistSelector";
import { FormField } from "../../../../components/ui";

export const SaleDetailEditForm = ({
  saleDetailId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    publicistIds: [],
  });

  const toast = useRef(null);
  const [updateSaleDetail] = useMutation(UPDATE_SALE_DETAIL);

  const { loading, error } = useQuery(GET_SALE_DETAIL_BY_ID, {
    variables: { id: saleDetailId },
    skip: !saleDetailId,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.saleDetail) {
        setFormData({
          quantity: data.saleDetail.quantity,
          publicistIds: data.saleDetail.publicists?.map((p) => p.id) || [],
        });
      }
    },
  });

  const handlePublicistsChange = (publicistIds) => {
    setFormData((prev) => ({ ...prev, publicistIds }));
  };

  const handleSubmit = async () => {
    try {
      if (formData.quantity <= 0) {
        throw new Error("La cantidad debe ser mayor a cero");
      }

      await updateSaleDetail({
        variables: {
          saleDetail: {
            id: saleDetailId,
            quantity: formData.quantity,
            publicistIds: formData.publicistIds,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Detalle de venta actualizado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    }
  };

  const footer = (
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Detalle de Venta"
        visible={visible}
        className="w-full md:w-30rem"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p className="text-color-secondary">Cargando...</p>
        ) : error ? (
          <Message severity="error" className="w-full" text="Error al cargar detalle de venta" />
        ) : (
          <div className="formgrid grid">
            <div className="col-12">
              <FormField label="Cantidad" htmlFor="quantity" required>
                <InputNumber
                  id="quantity"
                  value={formData.quantity}
                  onValueChange={(e) =>
                    setFormData((prev) => ({ ...prev, quantity: e.value }))
                  }
                  min={1}
                  required
                />
              </FormField>
            </div>

            <div className="col-12">
              <PublicistSelector
                selectedPublicistIds={formData.publicistIds}
                onPublicistsChange={handlePublicistsChange}
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
