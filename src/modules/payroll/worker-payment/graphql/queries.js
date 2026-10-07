import { gql } from "@apollo/client";

const PAYMENT_FIELDS = `
  id
  amount
  currency
  paymentConcept
  paymentMethod
  paidDate
  notes
  createdAt
  deletedAt
  breakdown
  worker {
    id
    workerType
    tempFirstName
    tempLastName
    user {
      id
      name
      lastName
    }
  }
  payrollPeriod {
    id
    name
    isClosed
  }
  sale {
    id
  }
`;

export const GET_WORKER_PAYMENTS = gql`
  query WorkerPayments($options: ListOptions) {
    workerPayments(options: $options) {
      totalCount
      data {
        ${PAYMENT_FIELDS}
      }
    }
  }
`;

export const CREATE_WORKER_PAYMENT = gql`
  mutation CreateWorkerPayment($payment: CreateWorkerPaymentInput!) {
    createWorkerPayment(createWorkerPaymentInput: $payment) {
      id
    }
  }
`;

export const UPDATE_WORKER_PAYMENT = gql`
  mutation UpdateWorkerPayment($payment: UpdateWorkerPaymentInput!) {
    updateWorkerPayment(updateWorkerPaymentInput: $payment) {
      id
    }
  }
`;

export const MARK_WORKER_PAYMENTS_AS_PAID = gql`
  mutation MarkWorkerPaymentsAsPaid(
    $ids: [Int!]!
    $paidDate: Date
    $paymentMethod: PaymentMethod
  ) {
    markWorkerPaymentsAsPaid(
      ids: $ids
      paidDate: $paidDate
      paymentMethod: $paymentMethod
    ) {
      id
      paidDate
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

/** Períodos abiertos y monedas para registrar un pago a mano */
export const GET_PAYMENT_FORM_OPTIONS = gql`
  query WorkerPaymentFormOptions {
    payrollPeriods(
      options: { take: 50, sorts: [{ property: "startDate", direction: DESC }] }
    ) {
      data {
        id
        name
        isClosed
        startDate
        endDate
      }
    }
    currencies(options: { take: 100 }) {
      data {
        id
        code
        name
        isActive
      }
    }
  }
`;
