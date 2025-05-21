import { gql } from "@apollo/client";

// Office Queries
export const GET_OFFICES = gql`
  query Offices($options: ListOptions) {
    offices(options: $options) {
      totalCount
      data {
        id
        officeType
        name
        description
        address
        business {
          id
          name
        }
      }
    }
  }
`;

export const GET_OFFICE_BY_ID = gql`
  query Office($id: Int!) {
    office(id: $id) {
      id
      officeType
      name
      description
      address
      business {
        id
        name
      }
    }
  }
`;

export const CREATE_OFFICE = gql`
  mutation CreateOffice($office: CreateOfficeInput!) {
    createOffice(createOfficeInput: $office) {
      id
    }
  }
`;

export const UPDATE_OFFICE = gql`
  mutation UpdateOffice($office: UpdateOfficeInput!) {
    updateOffice(updateOfficeInput: $office) {
      id
      officeType
      name
      description
      address
    }
  }
`;

export const DELETE_OFFICES = gql`
  mutation RemoveOffices($ids: [Int!]!) {
    removeOffices(ids: $ids) {
      id
    }
  }
`;
