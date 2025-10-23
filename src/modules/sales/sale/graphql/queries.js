import { gql } from "@apollo/client";

export const GET_SALES = gql`
  query Sales($options: ListOptions) {
    sales(options: $options) {
      totalCount
      data {
        id
        effectiveDate
        totalAmount
        paymentMethod
        invoiceNumber
        salesUser {
          name
        }
        customer {
          name
        }
      }
    }
  }
`;

export const GET_SALE_BY_ID = gql`
  query Sale($id: Int!) {
    sale(id: $id) {
      id
      effectiveDate
      totalAmount
      paymentMethod
      invoiceNumber
      paymentDetails
      salesUser {
        id
        name
      }
      customer {
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
      details {
        id
        quantity
        unitPrice
        subtotal
        product {
          id
          name
        }
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
      id
      totalAmount
      paymentMethod
      invoiceNumber
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

export const GET_PAYMENT_METHODS = gql`
  query {
    __type(name: "PaymentMethod") {
      enumValues {
        name
      }
    }
  }
`;

export const MAKE_SALE = gql`
  mutation MakeSale($makeSaleInput: MakeSaleInput!) {
    makeSale(makeSaleInput: $makeSaleInput) {
      id
      effectiveDate
      totalAmount
      paymentMethod
      invoiceNumber
      paymentDetails
      salesUser {
        id
        name
      }
      customer {
        id
        name
      }
      details {
        id
        quantity
        unitPrice
        subtotal
        product {
          id
          name
        }
      }
    }
  }
`;

export const VALIDATE_SALE_PAYMENTS = gql`
  mutation ValidateSalePayments(
    $validateSalePaymentsInput: ValidateSalePaymentsInput!
  ) {
    validateSalePayments(
      validateSalePaymentsInput: $validateSalePaymentsInput
    ) {
      valid
      message
      totalInBaseCurrency
    }
  }
`;
