import { gql } from "@apollo/client";

export const GET_SCOPED_ACCESSES = gql`
  query ScopedAccesses($options: ListOptions) {
    scopedAccesses(options: $options) {
      totalCount
      data {
        id
        accessLevels
        entityStatus
        createdAt
        updatedAt
        business {
          id
          name
        }
        roleGuard {
          id
          queryOrEndPointURL
          type
          description
        }
      }
    }
  }
`;

export const GET_SCOPED_ACCESS_BY_ID = gql`
  query ScopedAccess($id: Int!) {
    scopedAccess(id: $id) {
      id
      accessLevels
      entityStatus
      createdAt
      updatedAt
      business {
        id
        name
      }
      roleGuard {
        id
        queryOrEndPointURL
        type
        description
        roles
      }
    }
  }
`;

export const CREATE_SCOPED_ACCESS = gql`
  mutation CreateScopedAccess(
    $createScopedAccessInput: CreateScopedAccessInput!
  ) {
    createScopedAccess(createScopedAccessInput: $createScopedAccessInput) {
      id
      accessLevels
      entityStatus
    }
  }
`;

export const UPDATE_SCOPED_ACCESS = gql`
  mutation UpdateScopedAccess(
    $updateScopedAccessInput: UpdateScopedAccessInput!
  ) {
    updateScopedAccess(updateScopedAccessInput: $updateScopedAccessInput) {
      id
      accessLevels
      entityStatus
    }
  }
`;

export const REMOVE_SCOPED_ACCESSES = gql`
  mutation RemoveScopedAccesses($ids: [Int!]!) {
    removeScopedAccesses(ids: $ids) {
      id
    }
  }
`;
