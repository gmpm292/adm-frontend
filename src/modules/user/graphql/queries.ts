import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query Users($options: ListOptions) {
    users(options: $options) {
      totalCount
      data {
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