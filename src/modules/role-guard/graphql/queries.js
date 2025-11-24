import { gql } from "@apollo/client";

export const GET_ROLE_GUARDS = gql`
  query RoleGuards($options: ListOptions) {
    roleGuards(options: $options) {
      totalCount
      data {
        id
        queryOrEndPointURL
        roles
        description
        type
        createdAt
        updatedAt
        deletedAt
      }
    }
  }
`;

export const GET_ROLE_GUARD_BY_ID = gql`
  query RoleGuard($id: Int!) {
    roleGuard(id: $id) {
      id
      queryOrEndPointURL
      roles
      description
      type
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

export const UPDATE_ROLE_GUARD = gql`
  mutation UpdateRoleGuard($updateRoleGuardInput: UpdateRoleGuardInput!) {
    updateRoleGuard(updateRoleGuardInput: $updateRoleGuardInput) {
      id
      roles
      description
      type
    }
  }
`;

export const CHECK_PERMISSIONS = gql`
  query CheckPermissions($operationName: String!) {
    checkPermissions(operationName: $operationName) {
      allowed
      requiredRoles
    }
  }
`;
