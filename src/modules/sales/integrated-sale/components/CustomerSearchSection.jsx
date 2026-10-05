import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useLazyQuery } from "@apollo/client";
import { GET_CUSTOMERS } from "../../customer/graphql/queries";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";

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
        severity={isSelected ? "success" : "secondary"}
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
          <div>
            <i className="pi pi-envelope mr-2 text-color-secondary"></i>
            {rowData.email}
          </div>
        )}
        {rowData.phone && (
          <div className="text-sm text-color-secondary">
            <i className="pi pi-phone mr-2"></i>
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
      <div>
        {additionalInfo.ci && (
          <div className="text-sm mb-1">
            <i className="pi pi-id-card mr-2 text-color-secondary"></i>
            CI: {additionalInfo.ci}
          </div>
        )}
        {rowData.loyaltyPoints > 0 && (
          <div className="text-sm text-color-secondary">
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
          <div className="text-sm text-color-secondary">
            <i className="pi pi-building mr-1"></i>
            {rowData.business.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card title="Buscar Cliente Existente">
      {/* Barra de búsqueda */}
      <div className="formgrid grid align-items-end">
        <div className="col-12 md:col-6">
          <FormField label="Buscar" htmlFor="search">
            <InputText
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ingrese nombre del cliente..."
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6 mb-4 flex flex-wrap gap-2">
          <Button
            label="Buscar"
            icon="pi pi-search"
            onClick={handleSearch}
            loading={loading}
            severity="secondary"
          />
          <Button
            label="Limpiar"
            icon="pi pi-times"
            onClick={handleClearSearch}
            severity="secondary"
            text
            disabled={
              !searchTerm && Object.keys(lazyState.filters).length === 0
            }
          />
          <Button
            label="Usar Cliente Seleccionado"
            icon="pi pi-check"
            severity="secondary"
            onClick={handleConfirmSelection}
            disabled={!selectedCustomer}
          />
        </div>
      </div>

      {/* Información de resultados */}
      {totalRecords > 0 && (
        <small className="block mb-2 text-color-secondary">
          Mostrando {customers.length} de {totalRecords} clientes
          {searchTerm && ` para "${searchTerm}"`}
        </small>
      )}

      {/* Resultados */}
      <DataTable
        value={customers}
        loading={loading}
        selectionMode="single"
        selection={selectedCustomer}
        onSelectionChange={(e) => setSelectedCustomer(e.value)}
        dataKey="id"
        emptyMessage="No se encontraron clientes"
        size="small"
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
          className="w-3rem text-center"
        ></Column>
        <Column
          field="name"
          header="Nombre"
          sortable
          body={nameBodyTemplate}
        ></Column>
        <Column header="Contacto" body={contactBodyTemplate}></Column>
        <Column header="Información" body={infoBodyTemplate}></Column>
        <Column
          body={actionBodyTemplate}
          header="Acción"
          className="w-12rem text-center"
        ></Column>
      </DataTable>

      {/* Acciones inferiores - Original */}
      <div className="flex flex-wrap justify-content-between align-items-center gap-2 mt-3 pt-3 border-top-1 surface-border">
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          text
          severity="secondary"
          onClick={onBack}
        />

        <div className="flex flex-wrap gap-3 align-items-center">
          {selectedCustomer && (
            <span className="font-semibold">
              <i className="pi pi-check-circle mr-2"></i>
              {selectedCustomer.name} seleccionado
            </span>
          )}
          <Button
            label="Usar Cliente Seleccionado"
            icon="pi pi-check"
            onClick={handleConfirmSelection}
            disabled={!selectedCustomer}
          />
        </div>
      </div>

      {/* Información de ayuda */}
      <Message
        severity="info"
        className="w-full mt-3"
        text="Selecciona un cliente existente de la lista. Puedes buscar por nombre, ordenar los resultados y navegar entre páginas."
      />
    </Card>
  );
};
