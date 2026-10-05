import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_UNIT_OF_MEASURE } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { DetailField } from "../../components/DetailField";

const categoryMap = {
  peso: { label: "Peso", color: "info" },
  volumen: { label: "Volumen", color: "success" },
  longitud: { label: "Longitud", color: "warning" },
  área: { label: "Área", color: "help" },
  unidades: { label: "Unidades", color: "primary" },
  tiempo: { label: "Tiempo", color: "danger" },
  energía: { label: "Energía", color: "secondary" },
  potencia: { label: "Potencia", color: "contrast" },
  temperatura: { label: "Temperatura", color: "info" },
};

export const UnitOfMeasureDetailForm = ({ unitId, visible, onHide }) => {
  const [getUnit, { data, loading }] = useLazyQuery(GET_UNIT_OF_MEASURE, {
    variables: { id: unitId },
    fetchPolicy: "network-only",
    skip: !unitId,
  });

  useEffect(() => {
    if (visible && unitId) {
      getUnit();
    }
  }, [visible, unitId, getUnit]);

  const unit = data?.unitOfMeasure;

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

  return (
    <Dialog
      header="Detalles de la Unidad de Medida"
      visible={visible}
      className="w-full md:w-8 lg:w-6"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center p-4">
          <ProgressSpinner />
        </div>
      ) : unit ? (
        <div className="grid">
          <DetailField label="Nombre">{unit.name}</DetailField>

          <DetailField label="Símbolo">
            <span className="text-xl">{unit.symbol}</span>
          </DetailField>

          <DetailField label="Categoría">
            {unit.category ? (
              <Tag
                value={categoryMap[unit.category]?.label || unit.category}
                severity={categoryMap[unit.category]?.color || "info"}
                rounded
              />
            ) : (
              "Sin categoría"
            )}
          </DetailField>

          <DetailField label="Estado">
            <Tag
              severity={unit.isActive ? "success" : "danger"}
              value={unit.isActive ? "Activo" : "Inactivo"}
            />
          </DetailField>

          <DetailField label="Descripción" className="col-12">
            {unit.description || "Sin descripción"}
          </DetailField>

          <DetailField label="Business">
            {unit.business?.name || "N/A"}
          </DetailField>
          <DetailField label="Oficina">
            {unit.office?.name || "N/A"}
          </DetailField>
          <DetailField label="Departamento">
            {unit.department?.name || "N/A"}
          </DetailField>
          <DetailField label="Equipo">{unit.team?.name || "N/A"}</DetailField>

          <DetailField label="Creado">{formatDate(unit.createdAt)}</DetailField>
          <DetailField label="Actualizado">
            {formatDate(unit.updatedAt)}
          </DetailField>
          {unit.deletedAt && (
            <DetailField label="Eliminado">
              {formatDate(unit.deletedAt)}
            </DetailField>
          )}

          {unit.materialCosts && unit.materialCosts.length > 0 && (
            <DetailField label="Usada en materiales" className="col-12">
              {unit.materialCosts.map((mc) => (
                <div key={mc.id}>• {mc.name}</div>
              ))}
            </DetailField>
          )}
        </div>
      ) : (
        <p className="text-center">
          No se encontró información de la unidad de medida.
        </p>
      )}
    </Dialog>
  );
};
