import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_MATERIAL_COST } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";

export const MaterialCostDetailForm = ({ materialId, visible, onHide }) => {
  const [getMaterial, { data, loading }] = useLazyQuery(GET_MATERIAL_COST, {
    variables: { id: materialId },
    fetchPolicy: "network-only",
    skip: !materialId,
  });

  useEffect(() => {
    if (visible && materialId) {
      getMaterial();
    }
  }, [visible, materialId, getMaterial]);

  const material = data?.materialCost;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price, currency) => {
    if (!price) return "N/A";
    return `${currency?.symbol || currency?.code || ""} ${price.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  };

  return (
    <Dialog
      header="Detalles del Material"
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center p-4">
          <ProgressSpinner />
        </div>
      ) : material ? (
        <div className="p-fluid">
          <div className="field">
            <label className="font-bold">Nombre:</label>
            <div>{material.name}</div>
          </div>

          <div className="field">
            <label className="font-bold">Descripción:</label>
            <div>{material.description || "Sin descripción"}</div>
          </div>

          <div className="field">
            <label className="font-bold">Unidad de Medida:</label>
            <div>
              {material.unitOfMeasure?.name} ({material.unitOfMeasure?.symbol})
              {material.unitOfMeasure?.category && (
                <Tag
                  value={material.unitOfMeasure.category}
                  severity="info"
                  rounded
                  className="ml-2"
                />
              )}
            </div>
          </div>

          <div className="field">
            <label className="font-bold">Precio de Costo:</label>
            <div className="text-xl font-bold text-green-600">
              {formatPrice(material.costPrice, material.currency)}
            </div>
            {material.currency?.exchangeRateToCUP && (
              <div className="text-sm text-color-secondary">
                Tasa: 1 {material.currency.code} ={" "}
                {material.currency.exchangeRateToCUP} CUP
              </div>
            )}
          </div>

          <div className="field">
            <label className="font-bold">Estado:</label>
            <div>
              <span
                className={`badge status-${material.isActive ? "active" : "inactive"}`}
              >
                {material.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          <div className="field">
            <label className="font-bold">Ámbitos:</label>
            <div className="ml-2">
              <div>
                <b>Business:</b> {material.business?.name || "N/A"}
              </div>
              <div>
                <b>Oficina:</b> {material.office?.name || "N/A"}
              </div>
              <div>
                <b>Departamento:</b> {material.department?.name || "N/A"}
              </div>
              <div>
                <b>Equipo:</b> {material.team?.name || "N/A"}
              </div>
            </div>
          </div>

          <div className="field">
            <label className="font-bold">Fechas:</label>
            <div className="ml-2">
              <div>
                <b>Creado:</b> {formatDate(material.createdAt)}
              </div>
              <div>
                <b>Actualizado:</b> {formatDate(material.updatedAt)}
              </div>
            </div>
          </div>

          {material.products && material.products.length > 0 && (
            <div className="field">
              <label className="font-bold">Usado en productos:</label>
              <div className="ml-2">
                {material.products.map((product) => (
                  <div key={product.id}>
                    • {product.name} ({product.code})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center">No se encontró información del material.</p>
      )}
    </Dialog>
  );
};
