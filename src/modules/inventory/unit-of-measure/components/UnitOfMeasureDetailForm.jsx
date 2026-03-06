import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_UNIT_OF_MEASURE } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";

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
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center p-4">
          <ProgressSpinner />
        </div>
      ) : unit ? (
        <div className="p-fluid">
          <div className="field">
            <label className="font-bold">Nombre:</label>
            <div>{unit.name}</div>
          </div>

          <div className="field">
            <label className="font-bold">Símbolo:</label>
            <div>
              <span className="font-mono text-xl">{unit.symbol}</span>
            </div>
          </div>

          <div className="field">
            <label className="font-bold">Categoría:</label>
            <div>
              {unit.category ? (
                <Tag
                  value={categoryMap[unit.category]?.label || unit.category}
                  severity={categoryMap[unit.category]?.color || "info"}
                  rounded
                />
              ) : (
                "Sin categoría"
              )}
            </div>
          </div>

          <div className="field">
            <label className="font-bold">Descripción:</label>
            <div>{unit.description || "Sin descripción"}</div>
          </div>

          <div className="field">
            <label className="font-bold">Estado:</label>
            <div>
              <span
                className={`badge status-${unit.isActive ? "active" : "inactive"}`}
              >
                {unit.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          <div className="field">
            <label className="font-bold">Ámbitos:</label>
            <div className="ml-2">
              <div>
                <b>Business:</b> {unit.business?.name || "N/A"}
              </div>
              <div>
                <b>Oficina:</b> {unit.office?.name || "N/A"}
              </div>
              <div>
                <b>Departamento:</b> {unit.department?.name || "N/A"}
              </div>
              <div>
                <b>Equipo:</b> {unit.team?.name || "N/A"}
              </div>
            </div>
          </div>

          <div className="field">
            <label className="font-bold">Fechas:</label>
            <div className="ml-2">
              <div>
                <b>Creado:</b> {formatDate(unit.createdAt)}
              </div>
              <div>
                <b>Actualizado:</b> {formatDate(unit.updatedAt)}
              </div>
              {unit.deletedAt && (
                <div>
                  <b>Eliminado:</b> {formatDate(unit.deletedAt)}
                </div>
              )}
            </div>
          </div>

          {unit.materialCosts && unit.materialCosts.length > 0 && (
            <div className="field">
              <label className="font-bold">Usada en materiales:</label>
              <div className="ml-2">
                {unit.materialCosts.map((mc) => (
                  <div key={mc.id}>• {mc.name}</div>
                ))}
              </div>
            </div>
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
