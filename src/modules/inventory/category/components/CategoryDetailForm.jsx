import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_CATEGORY_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";
import { DetailField } from "../../components/DetailField";

export function CategoryDetailForm({ categoryId, visible, onHide }) {
  const [getCategory, { data, loading }] = useLazyQuery(GET_CATEGORY_BY_ID, {
    variables: { id: categoryId },
    fetchPolicy: "network-only",
    skip: !categoryId,
  });

  useEffect(() => {
    if (visible && categoryId) {
      getCategory();
    }
  }, [visible, categoryId, getCategory]);

  const category = data?.category;

  return (
    <Dialog
      header="Detalles de la Categoría"
      visible={visible}
      className="w-full md:w-8 lg:w-6"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : category ? (
        <div className="grid">
          <DetailField label="Nombre">{category.name}</DetailField>
          <DetailField label="Descripción">
            {category.description || "N/A"}
          </DetailField>
          <DetailField label="Fecha de creación">
            {formatDate(category.createdAt)}
          </DetailField>
          <DetailField label="Última actualización">
            {formatDate(category.updatedAt)}
          </DetailField>
          <DetailField label="Negocio">
            {category.business?.name || "N/A"}
          </DetailField>
          <DetailField label="Oficina">
            {category.office?.name || "N/A"}
          </DetailField>
          <DetailField label="Departamento">
            {category.department?.name || "N/A"}
          </DetailField>
          <DetailField label="Equipo">
            {category.team?.name || "N/A"}
          </DetailField>
        </div>
      ) : (
        <p>No se encontró información de la categoría.</p>
      )}
    </Dialog>
  );
}
