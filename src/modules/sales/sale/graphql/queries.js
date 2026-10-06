import { gql } from "@apollo/client";

const WORKER_FIELDS = `
  id
  workerType
  tempFirstName
  tempLastName
  user {
    id
    name
    lastName
  }
`;

const SALE_FIELDS = `
  id
  createdAt
  deletedAt
  effectiveDate
  saleStatus
  isConfirmed
  invoiceNumber
  totalAmount
  totalAmountCurrency
  payments
  hasDelivery
  deliveryNotes
  customer {
    id
    fullName
    phone
    ci
    email
  }
  salesWorker {
    ${WORKER_FIELDS}
  }
  deliveryWorker {
    ${WORKER_FIELDS}
  }
`;

const SALE_LINES = `
  details {
    id
    quantity
    unitPrice
    subtotal
    currency
    saleDetailStatus
    product {
      id
      name
    }
  }
`;

export const GET_SALES = gql`
  query Sales($options: ListOptions) {
    sales(options: $options) {
      totalCount
      data {
        ${SALE_FIELDS}
      }
    }
  }
`;

export const GET_SALE_BY_ID = gql`
  query Sale($id: Int!) {
    sale(id: $id) {
      ${SALE_FIELDS}
      ${SALE_LINES}
      business {
        id
        name
      }
      office {
        id
        name
      }
      createdBy {
        id
        name
      }
    }
  }
`;

export const CREATE_SALE = gql`
  mutation CreateSale($sale: CreateSaleInput!) {
    createSale(createSaleInput: $sale) {
      id
    }
  }
`;

export const UPDATE_SALE = gql`
  mutation UpdateSale($sale: UpdateSaleInput!) {
    updateSale(updateSaleInput: $sale) {
      ${SALE_FIELDS}
    }
  }
`;

export const DELETE_SALES = gql`
  mutation RemoveSales($ids: [Int!]!) {
    removeSales(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_SALES = gql`
  mutation RestoreSales($ids: [Int!]!) {
    restoreSales(ids: $ids)
  }
`;

export const CANCEL_SALE = gql`
  mutation CancelSale($id: Int!) {
    cancelSale(id: $id) {
      id
      saleStatus
    }
  }
`;

// Devuelve la venta completa (saleId) o algunas de sus líneas (saleDetailIds)
export const REFUND_SALE = gql`
  mutation RefundSale($refund: RefundSaleInput!) {
    refundSale(refundSaleInput: $refund) {
      ${SALE_FIELDS}
      ${SALE_LINES}
    }
  }
`;

export const MAKE_SALE = gql`
  mutation MakeSale($makeSaleInput: MakeSaleInput!) {
    makeSale(makeSaleInput: $makeSaleInput) {
      ${SALE_FIELDS}
    }
  }
`;

// Con una lista de pagos vacía devuelve el precio de la venta en cada moneda
export const VALIDATE_SALE_PAYMENTS = gql`
  mutation ValidateSalePayments(
    $validateSalePaymentsInput: ValidateSalePaymentsInput!
  ) {
    validateSalePayments(
      validateSalePaymentsInput: $validateSalePaymentsInput
    ) {
      valid
      message
      currency
      totalInBaseCurrency
      totals {
        currency
        total
      }
    }
  }
`;
