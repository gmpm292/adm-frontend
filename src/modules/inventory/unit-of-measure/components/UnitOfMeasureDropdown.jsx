import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { useLazyQuery } from "@apollo/client";
import { GET_UNITS_OF_MEASURE } from "../graphql/queries";
import { Skeleton } from "primereact/skeleton";

// Mapeo de categorías a español para mostrar
const categoryLabels = {
  peso: "Peso",
  volumen: "Volumen",
  longitud: "Longitud",
  área: "Área",
  unidades: "Unidades",
  tiempo: "Tiempo",
  energía: "Energía",
  potencia: "Potencia",
  temperatura: "Temperatura",
};

const UnitOfMeasureDropdown = ({
  value,
  onChange,
  placeholder = "Seleccione una unidad",
  filter = true,
  showClear = false,
  disabled = false,
  className = "",
  required = false,
  onlyActive = true,
  category = null,
  ...props
}) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [getUnits] = useLazyQuery(GET_UNITS_OF_MEASURE, {
    onCompleted: (data) => {
      let unitsData = data?.unitOfMeasures?.data || [];

      if (onlyActive) {
        unitsData = unitsData.filter((unit) => unit.isActive);
      }

      if (category) {
        unitsData = unitsData.filter((unit) => unit.category === category);
      }

      const formattedUnits = unitsData.map((unit) => ({
        label: `${unit.symbol} - ${unit.name} ${unit.category ? `(${categoryLabels[unit.category] || unit.category})` : ""}`,
        value: unit.id,
        data: unit,
      }));

      setUnits(formattedUnits);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error fetching units of measure:", error);
      setUnits([]);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    getUnits({
      variables: {
        options: {
          take: 200,
          sorts: [
            { property: "category", direction: "ASC" },
            { property: "name", direction: "ASC" },
          ],
        },
      },
    });
  }, [getUnits, category]);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const selectedTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <span className="font-bold">{option.data?.symbol}</span>
          <span className="ml-2">- {option.data?.name}</span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  const itemTemplate = (option) => {
    return (
      <div className="flex align-items-center justify-content-between">
        <div>
          <span className="font-bold">{option.data?.symbol}</span>
          <span className="ml-2">- {option.data?.name}</span>
        </div>
        <div className="flex align-items-center gap-2">
          {option.data?.category && (
            <small className="text-color-secondary">
              {categoryLabels[option.data.category] || option.data.category}
            </small>
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
      options={units}
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
      emptyMessage="No se encontraron unidades"
      emptyFilterMessage="No se encontraron unidades que coincidan"
      {...props}
    />
  );
};

export default UnitOfMeasureDropdown;
