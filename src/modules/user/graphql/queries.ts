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
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query User($id: Int!) {
    user(id: $id) {
      deletedAt

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
        #name
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
