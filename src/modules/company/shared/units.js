/**
 * Los cuatro niveles de la estructura de una empresa. Cada uno describe sus
 * textos, sus operaciones, las columnas de su listado y los campos de su
 * formulario; la tabla y el formulario compartidos se pintan a partir de aquí.
 */
import {
  CREATE_BUSINESS,
  CREATE_DEPARTMENT,
  CREATE_OFFICE,
  CREATE_TEAM,
  GET_BUSINESSES,
  GET_BUSINESS_OPTIONS,
  GET_DEPARTMENTS,
  GET_DEPARTMENT_OPTIONS,
  GET_OFFICES,
  GET_OFFICE_OPTIONS,
  GET_TEAMS,
  REMOVE_BUSINESSES,
  REMOVE_DEPARTMENTS,
  REMOVE_OFFICES,
  REMOVE_TEAMS,
  RESTORE_BUSINESSES,
  RESTORE_DEPARTMENTS,
  RESTORE_OFFICES,
  RESTORE_TEAMS,
  UPDATE_BUSINESS,
  UPDATE_DEPARTMENT,
  UPDATE_OFFICE,
  UPDATE_TEAM,
} from "./queries";

const OFFICE_TYPES = [
  { value: "OFFICE", label: "Oficina" },
  { value: "BRANCH", label: "Sucursal" },
];

const DEPARTMENT_TYPES = [
  { value: "SALES", label: "Ventas" },
  { value: "ECONOMIC", label: "Economía" },
  { value: "ADMINISTRATION", label: "Administración" },
];

const TEAM_TYPES = [
  { value: "SALES", label: "Ventas" },
  { value: "OPERATIONS", label: "Operaciones" },
  { value: "DELIVERIES", label: "Entregas" },
  { value: "FIELDWORK", label: "Trabajo de campo" },
  { value: "ADVERTISING_MARKETING", label: "Publicidad y marketing" },
];

const labelOf = (options) => (value) =>
  options.find((option) => option.value === value)?.label ?? value;

const NAME_FIELD = { key: "name", label: "Nombre", required: true };
const DESCRIPTION_FIELD = {
  key: "description",
  label: "Descripción",
  type: "textarea",
  wide: true,
};
const ADDRESS_FIELD = { key: "address", label: "Dirección", wide: true };

export const UNITS = {
  business: {
    list: "businesses",
    singular: "empresa",
    article: "la",
    newLabel: "Nueva empresa",
    totalLabel: "empresas",
    query: GET_BUSINESSES,
    create: CREATE_BUSINESS,
    update: UPDATE_BUSINESS,
    remove: REMOVE_BUSINESSES,
    restore: RESTORE_BUSINESSES,
    searchFields: ["name", "taxId", "contactEmail"],
    columns: [
      { field: "name", header: "Nombre", sortable: true, filter: true, main: true },
      { field: "taxId", header: "NIT", filter: true },
      { field: "contactPhone", header: "Teléfono" },
      { field: "contactEmail", header: "Correo", filter: true },
      {
        field: "offices",
        header: "Oficinas",
        value: (row) => row.offices?.length ?? 0,
      },
    ],
    fields: [
      NAME_FIELD,
      { key: "taxId", label: "NIT", hint: "Número de identificación tributaria" },
      { key: "contactPhone", label: "Teléfono de contacto" },
      { key: "contactEmail", label: "Correo de contacto", type: "email" },
      ADDRESS_FIELD,
    ],
  },

  office: {
    list: "offices",
    singular: "oficina",
    article: "la",
    newLabel: "Nueva oficina",
    totalLabel: "oficinas",
    query: GET_OFFICES,
    create: CREATE_OFFICE,
    update: UPDATE_OFFICE,
    remove: REMOVE_OFFICES,
    restore: RESTORE_OFFICES,
    searchFields: ["name", "business.name", "address"],
    columns: [
      { field: "name", header: "Nombre", sortable: true, filter: true, main: true },
      {
        field: "officeType",
        header: "Tipo",
        value: (row) => labelOf(OFFICE_TYPES)(row.officeType),
      },
      {
        field: "business.name",
        header: "Empresa",
        filter: true,
        value: (row) => row.business?.name,
      },
      { field: "address", header: "Dirección", filter: true },
    ],
    // Nivel del que cuelga: se elige al crear y ya no cambia
    parent: {
      key: "businessId",
      label: "Empresa",
      of: (row) => row.business,
      query: GET_BUSINESS_OPTIONS,
      list: "businesses",
      // Solo quien administra la plataforma elige empresa; el resto, la suya
      superOnly: true,
      own: (user) => user?.business?.id,
      optionLabel: (item) => item.name,
    },
    fields: [
      {
        key: "officeType",
        label: "Tipo",
        type: "select",
        options: OFFICE_TYPES,
        required: true,
        initial: "OFFICE",
      },
      NAME_FIELD,
      DESCRIPTION_FIELD,
      ADDRESS_FIELD,
    ],
  },

  department: {
    list: "departments",
    singular: "departamento",
    article: "el",
    newLabel: "Nuevo departamento",
    totalLabel: "departamentos",
    query: GET_DEPARTMENTS,
    create: CREATE_DEPARTMENT,
    update: UPDATE_DEPARTMENT,
    remove: REMOVE_DEPARTMENTS,
    restore: RESTORE_DEPARTMENTS,
    searchFields: ["name", "office.name", "address"],
    columns: [
      { field: "name", header: "Nombre", sortable: true, filter: true, main: true },
      {
        field: "departmentType",
        header: "Tipo",
        value: (row) => labelOf(DEPARTMENT_TYPES)(row.departmentType),
      },
      {
        field: "office.name",
        header: "Oficina",
        filter: true,
        value: (row) => row.office?.name,
      },
      { field: "address", header: "Dirección", filter: true },
    ],
    parent: {
      key: "officeId",
      label: "Oficina",
      of: (row) => row.office,
      query: GET_OFFICE_OPTIONS,
      list: "offices",
      optionLabel: (item) =>
        [item.name, item.business?.name].filter(Boolean).join(" · "),
    },
    fields: [
      {
        key: "departmentType",
        label: "Tipo",
        type: "select",
        options: DEPARTMENT_TYPES,
        required: true,
      },
      NAME_FIELD,
      DESCRIPTION_FIELD,
      ADDRESS_FIELD,
    ],
  },

  team: {
    list: "teams",
    singular: "equipo",
    article: "el",
    newLabel: "Nuevo equipo",
    totalLabel: "equipos",
    query: GET_TEAMS,
    create: CREATE_TEAM,
    update: UPDATE_TEAM,
    remove: REMOVE_TEAMS,
    restore: RESTORE_TEAMS,
    searchFields: ["name", "department.name"],
    columns: [
      { field: "name", header: "Nombre", sortable: true, filter: true, main: true },
      {
        field: "teamType",
        header: "Tipo",
        value: (row) => labelOf(TEAM_TYPES)(row.teamType),
      },
      {
        field: "department.name",
        header: "Departamento",
        filter: true,
        value: (row) => row.department?.name,
      },
      { field: "office.id", header: "Oficina", value: (row) => row.office?.name },
      {
        field: "business.id",
        header: "Empresa",
        value: (row) => row.business?.name,
      },
    ],
    parent: {
      key: "departmentId",
      label: "Departamento",
      of: (row) => row.department,
      query: GET_DEPARTMENT_OPTIONS,
      list: "departments",
      optionLabel: (item) =>
        [item.name, item.office?.name].filter(Boolean).join(" · "),
    },
    fields: [
      {
        key: "teamType",
        label: "Tipo",
        type: "select",
        options: TEAM_TYPES,
        required: true,
      },
      NAME_FIELD,
      DESCRIPTION_FIELD,
    ],
  },
};
