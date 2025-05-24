import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_CATEGORY_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";

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
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : category ? (
        <div className="p-fluid">
          <div className="field">
            <b>Nombre:</b> {category.name}
          </div>
          <div className="field">
            <b>Descripción:</b> {category.description || "N/A"}
          </div>
          <div className="field">
            <b>Fecha de creación:</b> {formatDate(category.createdAt)}
          </div>
          <div className="field">
            <b>Última actualización:</b> {formatDate(category.updatedAt)}
          </div>

          <div className="field">
            <b>Negocio:</b> {category.business?.name || "N/A"}
          </div>
          <div className="field">
            <b>Oficina:</b> {category.office?.name || "N/A"}
          </div>
          <div className="field">
            <b>Departamento:</b> {category.department?.name || "N/A"}
          </div>
          <div className="field">
            <b>Equipo:</b> {category.team?.name || "N/A"}
          </div>
        </div>
      ) : (
        <p>No se encontró información de la categoría.</p>
      )}
    </Dialog>
  );
}
