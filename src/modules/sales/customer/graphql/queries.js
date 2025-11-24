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
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($customer: UpdateCustomerInput!) {
    updateCustomer(updateCustomerInput: $customer) {
      id
      name
      email
      phone
      loyaltyPoints
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
