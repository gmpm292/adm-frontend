// inventory-movement/components/InventorySelectorWithFilters.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Dropdown } from "primereact/dropdown";
import { useLazyQuery } from "@apollo/client";
import { ProgressSpinner } from "primereact/progressspinner";
import { GET_OFFICES } from "../../../../components/SecurityEntitySelector/queries";
import { GET_CATEGORIES } from "../../category/graphql/queries";
import { GET_INVENTORIES } from "../../inventory/graphql/queries";
import { Message } from "primereact/message";
import { ConditionalOperator } from "../../../../enums/conditional-operation.enum";

export const InventorySelectorWithFilters = ({
  selectedInventoryId,
  onInventorySelect,
  movementType, // Recibimos el tipo de movimiento del padre
  disabled = false,
  officeId: initialOfficeId = null,
  categoryId: initialCategoryId = null,
}) => {
  const [officeId, setOfficeId] = useState(initialOfficeId);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [inventoryId, setInventoryId] = useState(selectedInventoryId);

  const [inventoryOptions, setInventoryOptions] = useState([]);
  const [officeOptions, setOfficeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [noInventoryMessage, setNoInventoryMessage] = useState("");

  // Query para obtener inventarios filtrados
  const [getInventories, { loading: inventoriesLoading }] = useLazyQuery(
    GET_INVENTORIES,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        const inventories =
          data?.inventories?.data?.map((inv) => ({
            label: `${inv.product?.name} - Stock: ${inv.currentStock} (${inv.location || "Sin ubicación"})`,
            value: inv.id,
            data: inv,
          })) || [];

        setInventoryOptions(inventories);

        if (inventories.length === 0) {
          setNoInventoryMessage(
            "No hay inventarios disponibles con los filtros seleccionados",
          );
        } else {
          setNoInventoryMessage("");
        }
      },
    },
  );

  // Query para obtener oficinas
  const [getOffices, { loading: officesLoading }] = useLazyQuery(GET_OFFICES, {
    onCompleted: (data) => {
      const offices =
        data?.offices?.data?.map((office) => ({
          label: office.name,
          value: office.id,
        })) || [];
      setOfficeOptions(offices);
    },
  });

  // Query para obtener categorías
  const [getCategories, { loading: categoriesLoading }] = useLazyQuery(
    GET_CATEGORIES,
    {
      onCompleted: (data) => {
        const categories =
          data?.categories?.data?.map((cat) => ({
            label: cat.name,
            value: cat.id,
          })) || [];
        setCategoryOptions(categories);
      },
    },
  );

  // Cargar datos iniciales
  useEffect(() => {
    getOffices({ variables: { options: { take: 100 } } });
    getCategories({ variables: { options: { take: 100 } } });
  }, [getOffices, getCategories]);

  // Función para construir filtros según el tipo de movimiento
  const buildFilters = useCallback(() => {
    const filters = [];

    if (officeId) {
      filters.push({
        property: "office.id",
        operator: ConditionalOperator.EQUAL,
        value: officeId,
      });
    }

    if (categoryId) {
      filters.push({
        property: "category.id",
        operator: ConditionalOperator.EQUAL,
        value: categoryId,
      });
    }

    // Si es una salida (OUT), solo mostrar inventarios con stock > 0
    if (movementType === "OUT") {
      filters.push({
        property: "currentStock",
        operator: ConditionalOperator.GREATER_THAN,
        value: 0,
      });
    }

    return filters;
  }, [officeId, categoryId, movementType]);

  // Cargar inventarios cuando cambian los filtros o el tipo de movimiento
  useEffect(() => {
    const filters = buildFilters();

    // Solo buscar si hay al menos un filtro o si es explícitamente necesario
    if (filters.length > 0 || officeId || categoryId || movementType) {
      getInventories({
        variables: {
          options: {
            filters: filters.length > 0 ? filters : undefined,
            take: 100,
            sorts: [{ property: "product.name", direction: "ASC" }],
          },
        },
      });
    } else {
      // Si no hay filtros, mostrar todos los inventarios
      getInventories({
        variables: {
          options: {
            take: 100,
            sorts: [{ property: "product.name", direction: "ASC" }],
          },
        },
      });
    }
  }, [officeId, categoryId, movementType, getInventories, buildFilters]);

  const handleOfficeChange = (e) => {
    setOfficeId(e.value);
    setInventoryId(null);
    onInventorySelect(null);
  };

  const handleCategoryChange = (e) => {
    setCategoryId(e.value);
    setInventoryId(null);
    onInventorySelect(null);
  };

  const handleInventoryChange = (e) => {
    setInventoryId(e.value);
    onInventorySelect(e.value);
  };

  // Determinar si el selector de inventario debe estar deshabilitado
  const isInventoryDisabled = disabled || inventoriesLoading;

  return (
    <div className="p-fluid">
      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <label htmlFor="office">Oficina</label>
            <Dropdown
              id="office"
              value={officeId}
              options={officeOptions}
              onChange={handleOfficeChange}
              placeholder="Todas las oficinas"
              disabled={disabled || officesLoading}
              showClear
              filter
            />
          </div>
        </div>

        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <label htmlFor="category">Categoría</label>
            <Dropdown
              id="category"
              value={categoryId}
              options={categoryOptions}
              onChange={handleCategoryChange}
              placeholder="Todas las categorías"
              disabled={disabled || categoriesLoading}
              showClear
              filter
            />
          </div>
        </div>

        <div className="p-col-12">
          <div className="p-field">
            <label htmlFor="inventory">Inventario*</label>
            {inventoriesLoading ? (
              <div className="flex align-items-center gap-2 p-2 border-1 surface-border border-round">
                <ProgressSpinner style={{ width: "24px", height: "24px" }} />
                <span>Cargando inventarios...</span>
              </div>
            ) : (
              <>
                <Dropdown
                  id="inventory"
                  value={inventoryId}
                  options={inventoryOptions}
                  onChange={handleInventoryChange}
                  placeholder="Seleccione inventario"
                  disabled={isInventoryDisabled}
                  filter
                  showClear
                  optionLabel="label"
                  className="w-full"
                />
                {movementType === "OUT" && (
                  <small className="p-d-block p-mt-1 text-color-secondary">
                    Solo se muestran inventarios con stock disponible
                  </small>
                )}
              </>
            )}
            {noInventoryMessage && !inventoriesLoading && (
              <Message
                severity="warn"
                text={noInventoryMessage}
                className="w-full p-mt-2"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
