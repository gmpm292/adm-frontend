import { gql } from "@apollo/client";

export const GET_WORKER_PAYMENTS = gql`
  query WorkerPayments($options: ListOptions) {
    workerPayments(options: $options) {
      totalCount
      data {
        createdAt
        updatedAt
        deletedAt

        createdBy {
          id
          name
        }
        updatedBy {
          id
          name
        }
        deletedBy {
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

        id
        amount
        currency
        paymentMethod
        paymentConcept
        breakdown
        notes
        worker {
          id
          user {
            name
            lastName
          }
          tempFirstName
          tempLastName
          tempEmail
          tempPhone
          tempRole
        }

        sale {
          id
          effectiveDate
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
      paymentConcept
      paidDate
      notes
      breakdown
      createdAt
      updatedAt
      deletedAt

      createdBy {
        id
        name
      }
      updatedBy {
        id
        name
      }
      deletedBy {
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

      worker {
        id
        workerType
        otherType
        tempFirstName
        tempLastName
        tempEmail
        tempPhone
        tempRole

        user {
          id
          name
          lastName
          email
          mobile
          role
        }
      }

      sale {
        id
        effectiveDate
        totalAmount
        isConfirmed
        paymentMethod
        invoiceNumber
      }

      payrollPeriod {
        id
        name
        startDate
        endDate
      }
    }
  }
`;

export const CREATE_WORKER_PAYMENT = gql`
  mutation CreateWorkerPayment(
    $createWorkerPaymentInput: CreateWorkerPaymentInput!
  ) {
    createWorkerPayment(createWorkerPaymentInput: $createWorkerPaymentInput) {
      id
    }
  }
`;

export const UPDATE_WORKER_PAYMENT = gql`
  mutation UpdateWorkerPayment(
    $updateWorkerPaymentInput: UpdateWorkerPaymentInput!
  ) {
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
