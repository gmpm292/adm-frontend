import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { CustomerFormDialog } from "../../customer/components/CustomerForm";
import { SEARCH_CUSTOMERS } from "../graphql/queries";

const SEARCH_FIELDS = ["fullName", "ci", "phone", "email"];
const customerDetail = (customer) =>
  [customer.phone, customer.ci && `CI ${customer.ci}`, customer.email]
    .filter(Boolean)
    .join(" · ");

const suggestionTemplate = (customer) => (
  <span className="flex flex-column">
    <span className="font-medium">{customer.fullName}</span>
    {customerDetail(customer) && (
      <small className="text-color-secondary">{customerDetail(customer)}</small>
    )}
  </span>
);

/**
 * Cliente de la venta: se busca por nombre, carné, teléfono o correo, o se da
 * de alta en el momento. Es opcional: sin cliente la venta es ocasional.
 */
export function CustomerPicker({ office, customer, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [searchCustomers] = useLazyQuery(SEARCH_CUSTOMERS, {
    fetchPolicy: "network-only",
  });

  const search = async ({ query: text }) => {
    const term = text.trim();
    const { data } = await searchCustomers({
      variables: {
        options: {
          take: 8,
          filters: term
            ? SEARCH_FIELDS.map((property) => ({
                property,
                operator: "CONTAINS",
                value: term,
                logicalOperator: "OR",
              }))
            : [],
          sorts: [{ property: "fullName", direction: "ASC" }],
        },
      },
    });
    setSuggestions(data?.customers?.data ?? []);
  };

  if (customer) {
    return (
      <div className="pos-customer">
        <i className="pi pi-user text-primary" />
        <span className="pos-customer__text">
          <span className="pos-customer__name">{customer.fullName}</span>
          {customerDetail(customer) && (
            <span className="pos-customer__detail">
              {customerDetail(customer)}
            </span>
          )}
        </span>
        <Button
          icon="pi pi-times"
          text
          rounded
          severity="secondary"
          aria-label="Quitar cliente"
          tooltip="Quitar cliente"
          tooltipOptions={{ position: "left" }}
          onClick={() => onChange(null)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <AutoComplete
          value={query}
          suggestions={suggestions}
          completeMethod={search}
          field="fullName"
          itemTemplate={suggestionTemplate}
          onChange={(e) => setQuery(typeof e.value === "string" ? e.value : "")}
          onSelect={(e) => {
            onChange(e.value);
            setQuery("");
          }}
          placeholder="Cliente ocasional · buscar por nombre, CI o teléfono"
          emptyMessage="Ningún cliente coincide"
          showEmptyMessage
          delay={250}
          className="flex-1"
          inputClassName="w-full"
          aria-label="Buscar cliente"
        />
        <Button
          icon="pi pi-user-plus"
          severity="secondary"
          outlined
          aria-label="Nuevo cliente"
          tooltip="Nuevo cliente"
          tooltipOptions={{ position: "left" }}
          onClick={() => setCreating(true)}
        />
      </div>
      {creating && (
        <CustomerFormDialog
          office={office}
          initialName={query.trim()}
          onHide={() => setCreating(false)}
          onSaved={(created) => {
            setCreating(false);
            setQuery("");
            onChange(created);
          }}
        />
      )}
    </>
  );
}
