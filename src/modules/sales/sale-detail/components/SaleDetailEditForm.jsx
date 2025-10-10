import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { useMutation, useQuery } from "@apollo/client";
import { GET_SALE_DETAIL_BY_ID, UPDATE_SALE_DETAIL } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { PublicistSelector } from "./PublicistSelector";

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
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Detalle de Venta"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar detalle de venta</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="quantity">Cantidad*</label>
              <InputNumber
                id="quantity"
                value={formData.quantity}
                onValueChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.value }))
                }
                min={1}
                required
              />
            </div>

            <PublicistSelector
              selectedPublicistIds={formData.publicistIds}
              onPublicistsChange={handlePublicistsChange}
            />
          </div>
        )}
      </Dialog>
    </>
  );
};
