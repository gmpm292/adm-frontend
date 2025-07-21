import React from "react";
import { Dropdown } from "primereact/dropdown";
import { useLazyQuery } from "@apollo/client";
import { GET_INVENTORIES } from "../graphql/queries";
import { useEffect, useState } from "react";

export const InventorySelector = ({
  selectedInventoryId,
  onInventorySelect,
  disabled = false,
}) => {
  const [getInventories, { data, loading }] = useLazyQuery(GET_INVENTORIES, {
    variables: { options: { take: 1000 } },
    fetchPolicy: "network-only",
  });
  const [selectedInventory, setSelectedInventory] = useState(null);

  useEffect(() => {
    getInventories();
  }, [getInventories]);

  useEffect(() => {
    if (data?.inventories?.data && selectedInventoryId) {
      const inventory = data.inventories.data.find(
        (i) => i.id === selectedInventoryId
      );
      setSelectedInventory(inventory);
    }
  }, [data, selectedInventoryId]);

  const handleChange = (e) => {
    if (disabled) return; // No hacer nada si está deshabilitado
    setSelectedInventory(e.value);
    onInventorySelect(e.value?.id || null);
  };

  const itemTemplate = (option) => {
    return (
      <div>
        {option.product?.name} - {option.location || "Sin ubicación"}
      </div>
    );
  };

  return (
    <Dropdown
      value={selectedInventory}
      options={data?.inventories?.data || []}
      onChange={handleChange}
      optionLabel="product.name"
      placeholder="Seleccione un inventario"
      loading={loading}
      filter
      filterBy="product.name,location"
      itemTemplate={itemTemplate}
      showClear
      disabled={disabled} // Pasar la prop disabled al Dropdown
    />
  );
};
