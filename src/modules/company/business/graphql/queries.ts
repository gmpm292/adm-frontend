import { gql } from "@apollo/client";

// Business Queries
export const GET_BUSINESSES = gql`
  query Businesses($options: ListOptions) {
    businesses(options: $options) {
      totalCount
      data {
        id
        name
        taxId
        address
        contactPhone
        contactEmail
      }
    }
  }
`;

export const GET_BUSINESS_BY_ID = gql`
  query Business($id: Int!) {
    business(id: $id) {
      id
      name
      taxId
      address
      contactPhone
      contactEmail
    }
  }
`;

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness($business: CreateBusinessInput!) {
    createBusiness(createBusinessInput: $business) {
      id
    }
  }
`;

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($business: UpdateBusinessInput!) {
    updateBusiness(updateBusinessInput: $business) {
      id
      name
      taxId
      address
      contactPhone
      contactEmail
    }
  }
`;

export const DELETE_BUSINESSES = gql`
  mutation RemoveBusinesses($ids: [Int!]!) {
    removeBusinesses(ids: $ids) {
      id
    }
  }
`;
