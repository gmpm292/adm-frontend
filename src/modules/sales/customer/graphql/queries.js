import { gql } from "@apollo/client";

export const GET_CUSTOMERS = gql`
  query Customers($options: ListOptions) {
    customers(options: $options) {
      totalCount
      data {
        id
        name
        lastName
        fullName
        ci
        email
        phone
        loyaltyPoints
        createdAt
        updatedAt
        deletedAt
        business {
          id
          name
        }
        office {
          id
          name
        }
        user {
          name
        }
      }
    }
  }
`;

export const GET_CUSTOMER_BY_ID = gql`
  query Customer($id: Int!) {
    customer(id: $id) {
      id
      name
      lastName
      fullName
      ci
      email
      phone
      loyaltyPoints
      additionalInfo

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
      user {
        id
        name
      }
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($customer: CreateCustomerInput!) {
    createCustomer(createCustomerInput: $customer) {
      id
      name
      lastName
      fullName
      ci
      email
      phone
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($customer: UpdateCustomerInput!) {
    updateCustomer(updateCustomerInput: $customer) {
      id
      name
      lastName
      fullName
      ci
      email
      phone
      loyaltyPoints
    }
  }
`;

// Historial de compras de un cliente, de la más reciente a la más antigua
export const GET_CUSTOMER_SALES = gql`
  query CustomerSales($customerId: Int!) {
    salesByCustomer(customerId: $customerId) {
      id
      createdAt
      effectiveDate
      saleStatus
      invoiceNumber
      totalAmount
      totalAmountCurrency
      details {
        id
        quantity
        product {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_CUSTOMERS = gql`
  mutation RemoveCustomers($ids: [Int!]!) {
    removeCustomers(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_CUSTOMERS = gql`
  mutation RestoreCustomers($ids: [Int!]!) {
    restoreCustomers(ids: $ids)
  }
`;
