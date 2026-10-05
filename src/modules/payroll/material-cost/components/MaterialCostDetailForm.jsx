import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_MATERIAL_COST } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { FormField } from "../../../../components/ui";

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
      className="w-full md:w-30rem"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center p-4">
          <ProgressSpinner />
        </div>
      ) : material ? (
        <div className="grid">
          <div className="col-12">
            <FormField label="Nombre">
              <span>{material.name}</span>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Descripción">
              <span>{material.description || "Sin descripción"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Unidad de Medida">
              <div>
                {material.unitOfMeasure?.name} ({material.unitOfMeasure?.symbol})
                {material.unitOfMeasure?.category && (
                  <Tag
                    value={material.unitOfMeasure.category}
                    severity="info"
                    className="ml-2"
                  />
                )}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Estado">
              <div>
                <Tag
                  severity={material.isActive ? "success" : "danger"}
                  value={material.isActive ? "Activo" : "Inactivo"}
                />
              </div>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Precio de Costo">
              <div className="text-xl font-bold text-green-600">
                {formatPrice(material.costPrice, material.currency)}
              </div>
              {material.currency?.exchangeRateToCUP && (
                <div className="text-sm text-color-secondary">
                  Tasa: 1 {material.currency.code} ={" "}
                  {material.currency.exchangeRateToCUP} CUP
                </div>
              )}
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Business">
              <span>{material.business?.name || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Oficina">
              <span>{material.office?.name || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Departamento">
              <span>{material.department?.name || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Equipo">
              <span>{material.team?.name || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Creado">
              <span>{formatDate(material.createdAt)}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Actualizado">
              <span>{formatDate(material.updatedAt)}</span>
            </FormField>
          </div>

          {material.products && material.products.length > 0 && (
            <div className="col-12">
              <FormField label="Usado en productos">
                <div>
                  {material.products.map((product) => (
                    <div key={product.id}>
                      • {product.name} ({product.code})
                    </div>
                  ))}
                </div>
              </FormField>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-color-secondary">No se encontró información del material.</p>
      )}
    </Dialog>
  );
};
