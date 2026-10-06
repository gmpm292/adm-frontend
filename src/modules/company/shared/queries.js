import { gql } from "@apollo/client";

/* --- Empresas -------------------------------------------------------------- */
const BUSINESS_FIELDS = `
  id
  deletedAt
  name
  taxId
  address
  contactPhone
  contactEmail
`;

export const GET_BUSINESSES = gql`
  query CompanyBusinesses($options: ListOptions) {
    businesses(options: $options) {
      totalCount
      data {
        ${BUSINESS_FIELDS}
        offices {
          id
        }
      }
    }
  }
`;

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness($input: CreateBusinessInput!) {
    createBusiness(createBusinessInput: $input) {
      ${BUSINESS_FIELDS}
    }
  }
`;

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($input: UpdateBusinessInput!) {
    updateBusiness(updateBusinessInput: $input) {
      ${BUSINESS_FIELDS}
    }
  }
`;

export const REMOVE_BUSINESSES = gql`
  mutation RemoveBusinesses($ids: [Int!]!) {
    removeBusinesses(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_BUSINESSES = gql`
  mutation RestoreBusinesses($ids: [Int!]!) {
    restoreBusinesses(ids: $ids)
  }
`;

/* --- Oficinas -------------------------------------------------------------- */
const OFFICE_FIELDS = `
  id
  deletedAt
  name
  officeType
  description
  address
  business {
    id
    name
  }
`;

export const GET_OFFICES = gql`
  query CompanyOffices($options: ListOptions) {
    offices(options: $options) {
      totalCount
      data {
        ${OFFICE_FIELDS}
      }
    }
  }
`;

export const CREATE_OFFICE = gql`
  mutation CreateOffice($input: CreateOfficeInput!) {
    createOffice(createOfficeInput: $input) {
      ${OFFICE_FIELDS}
    }
  }
`;

export const UPDATE_OFFICE = gql`
  mutation UpdateOffice($input: UpdateOfficeInput!) {
    updateOffice(updateOfficeInput: $input) {
      ${OFFICE_FIELDS}
    }
  }
`;

export const REMOVE_OFFICES = gql`
  mutation RemoveOffices($ids: [Int!]!) {
    removeOffices(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_OFFICES = gql`
  mutation RestoreOffices($ids: [Int!]!) {
    restoreOffices(ids: $ids)
  }
`;

/* --- Departamentos --------------------------------------------------------- */
const DEPARTMENT_FIELDS = `
  id
  deletedAt
  name
  departmentType
  description
  address
  office {
    id
    name
  }
`;

export const GET_DEPARTMENTS = gql`
  query CompanyDepartments($options: ListOptions) {
    departments(options: $options) {
      totalCount
      data {
        ${DEPARTMENT_FIELDS}
      }
    }
  }
`;

export const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(createDepartmentInput: $input) {
      ${DEPARTMENT_FIELDS}
    }
  }
`;

export const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($input: UpdateDepartmentInput!) {
    updateDepartment(updateDepartmentInput: $input) {
      ${DEPARTMENT_FIELDS}
    }
  }
`;

export const REMOVE_DEPARTMENTS = gql`
  mutation RemoveDepartments($ids: [Int!]!) {
    removeDepartments(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_DEPARTMENTS = gql`
  mutation RestoreDepartments($ids: [Int!]!) {
    restoreDepartments(ids: $ids)
  }
`;

/* --- Equipos --------------------------------------------------------------- */
const TEAM_FIELDS = `
  id
  deletedAt
  name
  teamType
  description
  department {
    id
    name
  }
  office {
    id
    name
  }
  business {
    id
    name
  }
`;

export const GET_TEAMS = gql`
  query CompanyTeams($options: ListOptions) {
    teams(options: $options) {
      totalCount
      data {
        ${TEAM_FIELDS}
      }
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(createTeamInput: $input) {
      ${TEAM_FIELDS}
    }
  }
`;

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($input: UpdateTeamInput!) {
    updateTeam(updateTeamInput: $input) {
      ${TEAM_FIELDS}
    }
  }
`;

export const REMOVE_TEAMS = gql`
  mutation RemoveTeams($ids: [Int!]!) {
    removeTeams(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_TEAMS = gql`
  mutation RestoreTeams($ids: [Int!]!) {
    restoreTeams(ids: $ids)
  }
`;

/* --- Opciones para elegir el nivel superior al crear ----------------------- */
export const GET_BUSINESS_OPTIONS = gql`
  query BusinessOptions {
    businesses(options: { skip: 0 }) {
      data {
        id
        name
      }
    }
  }
`;

export const GET_OFFICE_OPTIONS = gql`
  query OfficeOptions {
    offices(options: { skip: 0 }) {
      data {
        id
        name
        business {
          id
          name
        }
      }
    }
  }
`;

export const GET_DEPARTMENT_OPTIONS = gql`
  query DepartmentOptions {
    departments(options: { skip: 0 }) {
      data {
        id
        name
        office {
          id
          name
        }
      }
    }
  }
`;
