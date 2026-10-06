import { gql } from "@apollo/client";

export const CREATE_FIRST_USER = gql`
  mutation createUser($input: CreateFirstUserInput!) {
    createFirstUser(createFirstUserInput: $input) {
      id
    }
  }
`;

export const GET_USERS = gql`
  query Users($options: ListOptions) {
    users(options: $options) {
      totalCount
      data {
        createdAt
        deletedAt
        updatedAt

        id
        email
        enabled
        name
        lastName
        mobile
        role
        isTwoFactorEnabled
        isTwoFactorConfigured
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
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query User($id: Int!) {
    user(id: $id) {
      deletedAt
      createdAt
      updatedAt

      id
      email
      enabled
      name
      lastName
      mobile
      role
      isTwoFactorConfigured
      isTwoFactorEnabled
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
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($user: CreateUserInput!) {
    createUser(createUserInput: $user) {
      id
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(updateUserInput: $user) {
      id
      email
      enabled
      name
      lastName
      mobile
      role
    }
  }
`;

// Cambia el rol y, con él, la empresa, oficina, departamento y equipo
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($user: UpdateUserRoleInput!) {
    updateUserRole(updateUserRoleInput: $user) {
      id
      role
    }
  }
`;

// Estructura de la empresa, para ubicar a un usuario según su rol
export const GET_USER_ORGANIZATION = gql`
  query UserOrganization {
    businesses(options: { skip: 0 }) {
      data {
        id
        name
      }
    }
    offices(options: { skip: 0 }) {
      data {
        id
        name
        business {
          id
        }
      }
    }
    departments(options: { skip: 0 }) {
      data {
        id
        name
        office {
          id
        }
      }
    }
    teams(options: { skip: 0 }) {
      data {
        id
        name
        department {
          id
        }
      }
    }
  }
`;

export const DELETE_USERS = gql`
  mutation RemoveUsers($ids: [Int!]!) {
    removeUsers(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_USERS = gql`
  mutation RestoreUsers($ids: [Int!]!) {
    restoreUsers(ids: $ids)
  }
`;

export const GET_ROLES = gql`
  query {
    __type(name: "Role") {
      enumValues {
        name
      }
    }
  }
`;

export const GET_PROFILE = gql`
  query Profile {
    profile {
      createdAt
      updatedAt
      email
      name
      lastName
      mobile
      role
      enabled
      isTwoFactorEnabled
      isTwoFactorConfigured
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
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(updateUserProfileInput: $input) {
      id
      email
      name
      lastName
      mobile
    }
  }
`;

export const CHANGE_OWN_PASSWORD = gql`
  mutation ChangeOwnPassword($input: ChangeOwnPasswordInput!) {
    changeOwnPassword(input: $input) {
      id
    }
  }
`;

export const CHANGE_PASSWORD_BY_EMAIL = gql`
  mutation ChangePasswordByEmail($input: ChangePasswordByEmailInput!) {
    changePasswordByEmail(changePasswordByEmailInput: $input) {
      id
    }
  }
`;
