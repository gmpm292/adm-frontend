import { gql } from "@apollo/client";

export const GET_WORKERS = gql`
  query Workers($options: ListOptions) {
    workers(options: $options) {
      totalCount
      data {
        id
        workerType
        baseSalary
        createdAt
        updatedAt
        user {
          enabled
          id
          name
          lastName
          email
          role
        }
        tempFirstName
        tempLastName
        tempEmail
        tempPhone
        tempRole
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
      }
    }
  }
`;

export const GET_WORKER_BY_ID = gql`
  query Worker($id: Int!) {
    worker(id: $id) {
      id
      workerType
      baseSalary
      customPaymentSettings
      createdAt
      updatedAt
      user {
        enabled
        id
        name
        lastName
        email
      }
      tempFirstName
      tempLastName
      tempEmail
      tempPhone
      tempRole
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
      paymentRule {
        id
        name
      }
    }
  }
`;

export const CREATE_WORKER = gql`
  mutation CreateWorker($createWorkerInput: CreateWorkerInput!) {
    createWorker(createWorkerInput: $createWorkerInput) {
      id
    }
  }
`;

export const UPDATE_WORKER = gql`
  mutation UpdateWorker($updateWorkerInput: UpdateWorkerInput!) {
    updateWorker(updateWorkerInput: $updateWorkerInput) {
      id
      workerType
      baseSalary
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
    restoreWorkers(ids: $ids) {
      id
    }
  }
`;

export const ASSOCIATE_USER_TO_WORKER = gql`
  mutation AssociateUserToWorker($workerId: Int!, $userId: Int!) {
    associateUserToWorker(workerId: $workerId, userId: $userId) {
      id
      user {
        id
        name
        lastName
      }
    }
  }
`;

export const CREATE_USER_FROM_WORKER = gql`
  mutation CreateUserFromWorker($workerId: Int!) {
    createUserFromWorker(workerId: $workerId) {
      id
      user {
        id
        name
        lastName
      }
    }
  }
`;

export const GET_WORKER_TYPES = gql`
  query {
    __type(name: "WorkerType") {
      enumValues {
        name
      }
    }
  }
`;
