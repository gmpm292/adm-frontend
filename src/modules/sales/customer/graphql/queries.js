import { gql } from "@apollo/client";

export const GET_CUSTOMERS = gql`
  query Customers($options: ListOptions) {
    customers(options: $options) {
      totalCount
      data {
        id
        name
        email
        phone
        loyaltyPoints
        business {
          name
        }
        office {
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
      email
      phone
      loyaltyPoints
      additionalInfo
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