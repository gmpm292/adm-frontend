import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useLazyQuery } from "@apollo/client";
import { GET_CUSTOMERS } from "../../customer/graphql/queries";

export const CustomerSearchSection = ({ onSelectCustomer, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
    sortField: null,
    sortOrder: null,
    filters: {},
  });

  const [getCustomers] = useLazyQuery(GET_CUSTOMERS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      setCustomers(data?.customers?.data || []);
      setTotalRecords(data?.customers?.totalCount || 0);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error loading customers:", error);
      setLoading(false);
    },
  });

  // Cargar clientes al montar el componente o cambiar paginación
  useEffect(() => {
    loadCustomers();
  }, [lazyState]);

  // Función para cargar clientes con paginación
  const loadCustomers = (customFilters = null) => {
    setLoading(true);

    const filters = customFilters || lazyState.filters;
    const sorts = [];

    if (lazyState.sortField) {
      sorts.push({
        field: lazyState.sortField,
        order: lazyState.sortOrder === 1 ? "ASC" : "DESC",
      });
    }

    getCustomers({
      variables: {
        options: {
          take: lazyState.rows,
          skip: lazyState.first,
          filters: Object.keys(filters).length > 0 ? filters : [],
          sorts: sorts,
        },
      },
    });
  };

  // Manejar cambio de página
  const onPage = (event) => {
    setLazyState({
      ...lazyState,
      first: event.first,
      rows: event.rows,
      page: event.page,
    });
  };

  // Manejar ordenamiento
  const onSort = (event) => {
    setLazyState({
      ...lazyState,
      sortField: event.sortField,
      sortOrder: event.sortOrder,
    });
  };

  // Buscar clientes
  const handleSearch = () => {
    const filters = searchTerm
      ? [
          {
            property: "fullName",
            operator: "CONTAINS",
            value: `${searchTerm}`,
            logicalOperator: "OR",
          },
          {
            property: "name",
            operator: "CONTAINS",
            value: `${searchTerm}`,
            logicalOperator: "OR",
          },
          {
            property: "lastName",
            operator: "CONTAINS",
            value: `${searchTerm}`,
            logicalOperator: "OR",
          },
          {
            property: "ci",
            operator: "CONTAINS",
            value: `${searchTerm}`,
            logicalOperator: "OR",
          },
          {
            property: "email",
            operator: "CONTAINS",
            value: `${searchTerm}`,
            logicalOperator: "OR",
          },
          {
            property: "phone",
            operator: "CONTAINS",
            value: `${searchTerm}`,
            logicalOperator: "OR",
          },
        ]
      : [];

    setLazyState({
      ...lazyState,
      first: 0,
      page: 0,
      filters: filters,
    });
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm("");
    setLazyState({
      ...lazyState,
      first: 0,
      page: 0,
      filters: {},
    });
  };

  // Seleccionar cliente
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  // Confirmar selección
  const handleConfirmSelection = () => {
    if (selectedCustomer) {
      onSelectCustomer(selectedCustomer);
    }
  };

  // Template para acciones
  const actionBodyTemplate = (rowData) => {
    const isSelected = selectedCustomer?.id === rowData.id;

    return (
      <Button
        label={isSelected ? "Seleccionado" : "Seleccionar"}
        icon={isSelected ? "pi pi-check" : "pi pi-check-circle"}
        className={isSelected ? "p-button-success" : "p-button-outlined"}
        onClick={() => handleSelectCustomer(rowData)}
        size="small"
      />
    );
  };

  // Template para información de contacto
  const contactBodyTemplate = (rowData) => {
    return (
      <div>
        {rowData.email && (
          <div className="customer-contact">
            <i className="pi pi-envelope mr-2 text-gray-500"></i>
            {rowData.email}
          </div>
        )}
        {rowData.phone && (
          <div className="customer-contact text-sm text-gray-600">
            <i className="pi pi-phone mr-2 text-gray-500"></i>
            {rowData.phone}
          </div>
        )}
      </div>
    );
  };

  // Template para información adicional
  const infoBodyTemplate = (rowData) => {
    const additionalInfo = rowData.additionalInfo || {};
    return (
      <div className="customer-additional-info">
        {additionalInfo.ci && (
          <div className="text-sm mb-1">
            <i className="pi pi-id-card mr-2 text-gray-500"></i>
            CI: {additionalInfo.ci}
          </div>
        )}
        {rowData.loyaltyPoints > 0 && (
          <div className="text-sm text-green-600">
            <i className="pi pi-star mr-2"></i>
            Puntos: {rowData.loyaltyPoints}
          </div>
        )}
      </div>
    );
  };

  // Template para nombre del cliente
  const nameBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.fullName || rowData.name}</div>
        {rowData.business?.name && (
          <div className="text-sm text-gray-600">
            <i className="pi pi-building mr-1"></i>
            {rowData.business.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="customer-search-section">
      <Card title="Buscar Cliente Existente">
        {/* Barra de búsqueda */}
        <div className="search-bar p-fluid">
          <div className="p-grid">
            <div className="p-col-12 md:p-col-6">
              <div className="p-field">
                <label htmlFor="search">Buscar</label>
                <InputText
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ingrese nombre del cliente..."
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="p-col-12 md:p-col-6">
              <div
                className="p-field flex gap-2"
                style={{ paddingTop: "1.8rem" }}
              >
                <Button
                  label="Buscar"
                  icon="pi pi-search"
                  onClick={handleSearch}
                  loading={loading}
                  className="p-button-primary"
                />
                <Button
                  label="Limpiar"
                  icon="pi pi-times"
                  onClick={handleClearSearch}
                  className="p-button-secondary"
                  disabled={
                    !searchTerm && Object.keys(lazyState.filters).length === 0
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información de resultados */}
        {totalRecords > 0 && (
          <div className="search-info mb-2">
            <small className="text-gray-600">
              Mostrando {customers.length} de {totalRecords} clientes
              {searchTerm && ` para "${searchTerm}"`}
            </small>
          </div>
        )}

        {/* Resultados */}
        <div className="search-results">
          <DataTable
            value={customers}
            loading={loading}
            selectionMode="single"
            selection={selectedCustomer}
            onSelectionChange={(e) => setSelectedCustomer(e.value)}
            dataKey="id"
            emptyMessage="No se encontraron clientes"
            className="p-datatable-sm"
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rows={lazyState.rows}
            first={lazyState.first}
            totalRecords={totalRecords}
            onPage={onPage}
            onSort={onSort}
            sortField={lazyState.sortField}
            sortOrder={lazyState.sortOrder}
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
            rowsPerPageOptions={[5, 10, 20, 50]}
          >
            <Column
              selectionMode="single"
              headerStyle={{ width: "3rem" }}
              bodyStyle={{ textAlign: "center" }}
            ></Column>
            <Column
              field="name"
              header="Nombre"
              sortable
              body={nameBodyTemplate}
              style={{ minWidth: "200px" }}
            ></Column>
            <Column
              header="Contacto"
              body={contactBodyTemplate}
              style={{ minWidth: "180px" }}
            ></Column>
            <Column
              header="Información"
              body={infoBodyTemplate}
              style={{ minWidth: "150px" }}
            ></Column>
            <Column
              body={actionBodyTemplate}
              header="Acción"
              style={{ width: "140px" }}
              bodyStyle={{ textAlign: "center" }}
            ></Column>
          </DataTable>
        </div>

        {/* Acciones */}
        <div className="search-actions mt-3">
          <div className="flex justify-content-between align-items-center">
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              className="p-button-text"
              onClick={onBack}
            />

            <div className="flex gap-2 align-items-center">
              {selectedCustomer && (
                <div className="selected-customer-info mr-3">
                  <span className="text-green-600 font-semibold">
                    <i className="pi pi-check-circle mr-2"></i>
                    {selectedCustomer.name} seleccionado
                  </span>
                </div>
              )}
              <Button
                label="Usar Cliente Seleccionado"
                icon="pi pi-check"
                className="p-button-primary"
                onClick={handleConfirmSelection}
                disabled={!selectedCustomer}
              />
            </div>
          </div>
        </div>

        {/* Información de ayuda */}
        <div
          className="search-help mt-3 p-3 border-round"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <small className="text-secondary">
            <i className="pi pi-info-circle mr-2"></i>
            Selecciona un cliente existente de la lista. Puedes buscar por
            nombre, ordenar los resultados y navegar entre páginas.
          </small>
        </div>
      </Card>
    </div>
  );
};
