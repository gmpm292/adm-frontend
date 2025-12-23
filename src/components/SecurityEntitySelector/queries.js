import { gql } from "@apollo/client";

export const GET_BUSINESSES = gql`
  query Businesses($options: ListOptions) {
    businesses(options: $options) {
      data {
        id
        name
        taxId
        address
      }
    }
  }
`;

export const GET_OFFICES = gql`
  query Offices($options: ListOptions) {
    offices(options: $options) {
      data {
        id
        name
        description
        address
        business {
          id
        }
      }
    }
  }
`;

export const GET_DEPARTMENTS = gql`
  query Departments($options: ListOptions) {
    departments(options: $options) {
      data {
        id
        name
        description
        address
        office {
          id
        }
      }
    }
  }
`;

export const GET_TEAMS = gql`
  query Teams($options: ListOptions) {
    teams(options: $options) {
      data {
        id
        name
        description
        teamType
        department {
          id
        }
      }
    }
  }
`;

export const GET_PROFILE = gql`
  query {
    profile {
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
        teamType
      }
    }
  }
`;
