import { gql } from "@apollo/client";

const SCOPED_ACCESS_FIELDS = `
  id
  accessLevels
  entityStatus
  deletedAt
  business {
    id
    name
  }
  roleGuard {
    id
    queryOrEndPointURL
    type
  }
`;

export const GET_SCOPED_ACCESSES = gql`
  query ScopedAccesses($options: ListOptions) {
    scopedAccesses(options: $options) {
      totalCount
      data {
        ${SCOPED_ACCESS_FIELDS}
      }
    }
  }
`;

export const GET_OPERATION_OPTIONS = gql`
  query OperationOptions {
    roleGuards(options: { skip: 0, take: 1000 }) {
      data {
        id
        queryOrEndPointURL
        type
      }
    }
  }
`;

export const CREATE_SCOPED_ACCESS = gql`
  mutation CreateScopedAccess(
    $createScopedAccessInput: CreateScopedAccessInput!
  ) {
    createScopedAccess(createScopedAccessInput: $createScopedAccessInput) {
      ${SCOPED_ACCESS_FIELDS}
    }
  }
`;

export const UPDATE_SCOPED_ACCESS = gql`
  mutation UpdateScopedAccess(
    $updateScopedAccessInput: UpdateScopedAccessInput!
  ) {
    updateScopedAccess(updateScopedAccessInput: $updateScopedAccessInput) {
      ${SCOPED_ACCESS_FIELDS}
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

export const RESTORE_SCOPED_ACCESSES = gql`
  mutation RestoreScopedAccesses($ids: [Int!]!) {
    restoreScopedAccesses(ids: $ids)
  }
`;
