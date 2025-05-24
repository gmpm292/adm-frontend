import { gql } from "@apollo/client";

export const GET_WORKER_PAYMENTS = gql`
  query WorkerPayments($options: ListOptions) {
    workerPayments(options: $options) {
      totalCount
      data {
        id
        amount
        currency
        paymentMethod
        paymentType
        createdAt
        worker {
          id
          user {
            name
            lastName
          }
        }
        payrollPeriod {
          id
          name
        }
      }
    }
  }
`;

export const GET_WORKER_PAYMENT_BY_ID = gql`
  query WorkerPayment($id: Int!) {
    workerPayment(id: $id) {
      id
      amount
      currency
      exchangeRate
      paymentMethod
      paymentType
      notes
      breakdown {
        baseSalary
        commissions
        bonuses
        deductions
      }
      worker {
        id
        user {
          name
          lastName
        }
      }
      payrollPeriod {
        id
        name
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
    }
  }
`;

export const CREATE_WORKER_PAYMENT = gql`
  mutation CreateWorkerPayment($createWorkerPaymentInput: CreateWorkerPaymentInput!) {
    createWorkerPayment(createWorkerPaymentInput: $createWorkerPaymentInput) {
      id
    }
  }
`;

export const UPDATE_WORKER_PAYMENT = gql`
  mutation UpdateWorkerPayment($updateWorkerPaymentInput: UpdateWorkerPaymentInput!) {
    updateWorkerPayment(updateWorkerPaymentInput: $updateWorkerPaymentInput) {
      id
      amount
      paymentMethod
      paymentType
    }
  }
`;

export const REMOVE_WORKER_PAYMENTS = gql`
  mutation RemoveWorkerPayments($ids: [Int!]!) {
    removeWorkerPayments(ids: $ids) {
      id
    }
  }
`;