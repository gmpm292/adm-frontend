import React, { useState, useEffect } from "react";
import { Panel } from "primereact/panel";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import { useLazyQuery } from "@apollo/client";
import { GET_OFFICES } from "../../../../../../components/SecurityEntitySelector/queries";

export const InventoryCreationPanel = ({
  formData,
  setFormData,
  openPanel,
  handleToggle,
}) => {
  const [createInventory, setCreateInventory] = useState(false);
  const [selectedOffices, setSelectedOffices] = useState([]);
  const [officeOptions, setOfficeOptions] = useState([]);

  // Query para obtener oficinas
  const [getOffices, { loading: officesLoading }] = useLazyQuery(GET_OFFICES, {
    onCompleted: (data) => {
      const offices =
        data?.offices?.data?.map((office) => ({
          label: office.name,
          value: office.id,
          businessId: office.business?.id,
          businessName: office.business?.name,
        })) || [];
      setOfficeOptions(offices);
    },
  });

  // Cargar oficinas cuando el panel está abierto
  useEffect(() => {
    if (openPanel === 4 && officeOptions.length === 0) {
      getOffices({
        variables: {
          options: {
            take: 100,
            sorts: [{ property: "name", direction: "ASC" }],
          },
        },
      });
    }
  }, [openPanel, getOffices, officeOptions.length]);

  // Manejar cambio en el checkbox
  const handleCreateInventoryChange = (e) => {
    setCreateInventory(e.checked);
    setFormData((prev) => ({
      ...prev,
      createInventory: e.checked,
      selectedOffices: e.checked ? selectedOffices : [],
    }));
  };

  // Manejar selección de oficinas
  const handleOfficesChange = (e) => {
    setSelectedOffices(e.value);
    setFormData((prev) => ({
      ...prev,
      selectedOffices: e.value,
    }));
  };

  return (
    <Panel
      header="Creación de Inventarios"
      toggleable
      collapsed={openPanel !== 4}
      onToggle={handleToggle}
    >
      <div className="p-grid p-fluid">
        <div className="p-col-12">
          <div className="p-field-checkbox">
            <Checkbox
              inputId="createInventory"
              checked={createInventory}
              onChange={handleCreateInventoryChange}
            />
            <label htmlFor="createInventory" className="ml-2">
              Crear inventarios automáticamente después de crear el producto
            </label>
          </div>
        </div>

        {createInventory && (
          <div className="p-col-12">
            <div className="p-field">
              <label htmlFor="offices">Oficinas para crear inventario*</label>
              <MultiSelect
                id="offices"
                value={selectedOffices}
                options={officeOptions}
                onChange={handleOfficesChange}
                optionLabel="label"
                placeholder={
                  officesLoading
                    ? "Cargando oficinas..."
                    : "Seleccione las oficinas"
                }
                display="chip"
                filter
                showSelectAll={false}
                className="w-full"
                disabled={officesLoading}
              />
              <small className="p-d-block p-mt-1">
                Se creará un inventario en cada oficina seleccionada con: Stock
                Actual = 0, Stock Mínimo = 0, Ubicación = nombre de la oficina
              </small>
            </div>

            {selectedOffices.length > 0 && (
              <div className="p-mt-3">
                <h4>Resumen de inventarios a crear:</h4>
                <div className="p-grid">
                  {selectedOffices.map((officeId) => {
                    const office = officeOptions.find(
                      (opt) => opt.value === officeId,
                    );
                    return (
                      <div key={officeId} className="p-col-12 p-md-6">
                        <div className="p-card p-p-3">
                          <h5>{office?.label}</h5>
                          <p>
                            <strong>Stock Actual:</strong> 0<br />
                            <strong>Stock Mínimo:</strong> 0<br />
                            <strong>Ubicación:</strong> {office?.label}
                            <br />
                            <strong>Business ID:</strong> {office?.businessId}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
};
