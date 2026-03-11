import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { useLazyQuery } from "@apollo/client";
import { GET_MATERIAL_COSTS } from "../graphql/queries";
import { Skeleton } from "primereact/skeleton";

export const MaterialCostDropdown = ({
  value,
  onChange,
  placeholder = "Seleccione un material",
  filter = true,
  showClear = false,
  disabled = false,
  className = "",
  required = false,
  onlyActive = true,
  ...props
}) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [getMaterials] = useLazyQuery(GET_MATERIAL_COSTS, {
    onCompleted: (data) => {
      let materialsData = data?.materialCosts?.data || [];

      if (onlyActive) {
        materialsData = materialsData.filter((material) => material.isActive);
      }

      const formattedMaterials = materialsData.map((material) => ({
        label: `${material.name} - ${material.unitOfMeasure?.symbol || ""} (${material.currency?.code || ""} ${material.costPrice})`,
        value: material.id,
        data: material,
      }));

      setMaterials(formattedMaterials);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error fetching material costs:", error);
      setMaterials([]);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    getMaterials({
      variables: {
        options: {
          take: 200,
          sorts: [{ property: "name", direction: "ASC" }],
        },
      },
    });
  }, [getMaterials]);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const selectedTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <span className="font-bold">{option.data?.name}</span>
          <span className="ml-2 text-color-secondary">
            ({option.data?.unitOfMeasure?.symbol})
          </span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  const itemTemplate = (option) => {
    return (
      <div className="flex align-items-center justify-content-between">
        <div>
          <span className="font-bold">{option.data?.name}</span>
          <span className="ml-2 text-color-secondary">
            ({option.data?.unitOfMeasure?.symbol})
          </span>
        </div>
        <div className="flex align-items-center gap-2">
          <span className="font-mono">
            {option.data?.currency?.symbol || option.data?.currency?.code}{" "}
            {option.data?.costPrice?.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          {!option.data?.isActive && (
            <span className="badge status-inactive">Inactivo</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Skeleton height="40px" className={className} />;
  }

  return (
    <Dropdown
      value={value}
      onChange={handleChange}
      options={materials}
      optionLabel="label"
      optionValue="value"
      placeholder={placeholder}
      filter={filter}
      showClear={showClear}
      disabled={disabled}
      className={`w-full ${className}`}
      required={required}
      valueTemplate={selectedTemplate}
      itemTemplate={itemTemplate}
      emptyMessage="No se encontraron materiales"
      emptyFilterMessage="No se encontraron materiales que coincidan"
      {...props}
    />
  );
};

export default MaterialCostDropdown;
