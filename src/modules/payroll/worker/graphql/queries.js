import { gql } from "@apollo/client";

const WORKER_FIELDS = `
  id
  workerType
  otherType
  baseSalary
  deletedAt
  tempFirstName
  tempLastName
  tempEmail
  tempPhone
  user {
    id
    name
    lastName
    email
    mobile
    enabled
  }
  business {
    id
    name
  }
  office {
    id
    name
  }
  department {
    id
    name
  }
  team {
    id
    name
  }
`;

/** Lo usan también Asistencia, Pagos y Ventas (publicistas) */
export const GET_WORKERS = gql`
  query Workers($options: ListOptions) {
    workers(options: $options) {
      totalCount
      data {
        ${WORKER_FIELDS}
      }
    }
  }
`;

export const GET_WORKER_BY_ID = gql`
  query Worker($id: Int!) {
    worker(id: $id) {
      ${WORKER_FIELDS}
      createdAt
      updatedAt
      createdBy {
        id
        name
        lastName
      }
    }
  }
`;

export const CREATE_WORKER = gql`
  mutation CreateWorker($worker: CreateWorkerInput!) {
    createWorker(createWorkerInput: $worker) {
      id
    }
  }
`;

export const UPDATE_WORKER = gql`
  mutation UpdateWorker($worker: UpdateWorkerInput!) {
    updateWorker(updateWorkerInput: $worker) {
      id
    }
  }
`;

export const REMOVE_WORKERS = gql`
  mutation RemoveWorkers($ids: [Int!]!) {
    removeWorkers(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_WORKERS = gql`
  mutation RestoreWorkers($ids: [Int!]!) {
    restoreWorkers(ids: $ids)
  }
`;

/** Cuentas que se pueden vincular a un trabajador */
export const GET_WORKER_FORM_OPTIONS = gql`
  query WorkerFormOptions {
    users(options: { take: 500, sorts: [{ property: "name", direction: ASC }] }) {
      data {
        id
        name
        lastName
        email
        role
        business {
          id
        }
      }
    }
  }
`;
