import { gql } from "@apollo/client";

const ROLE_GUARD_FIELDS = `
  id
  queryOrEndPointURL
  roles
  codeRoles
  usesRoleGuard
  description
  type
  updatedAt
`;

export const GET_ROLE_GUARDS = gql`
  query RoleGuards($options: ListOptions) {
    roleGuards(options: $options) {
      totalCount
      data {
        ${ROLE_GUARD_FIELDS}
      }
    }
  }
`;

export const UPDATE_ROLE_GUARD = gql`
  mutation UpdateRoleGuard($updateRoleGuardInput: UpdateRoleGuardInput!) {
    updateRoleGuard(updateRoleGuardInput: $updateRoleGuardInput) {
      ${ROLE_GUARD_FIELDS}
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
