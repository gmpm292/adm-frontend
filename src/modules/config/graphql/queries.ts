import { gql } from "@apollo/client";

export const GET_CONFIGS = gql`
  query Configs($options: ListOptions!) {
    configs(options: $options) {
      data {
        id
        createdAt
        updatedAt
        deletedAt
        category
        group
        description
        values
        configVisibility
        configStatus
      }
      totalCount
    }
  }
`;

export const GET_CONFIG = gql`
  query Config($id: Int!) {
    config(id: $id) {
      id
      createdAt
      updatedAt
      deletedAt
      category
      group
      description
      values
      configVisibility
      configStatus
    }
  }
`;

export const CREATE_CONFIG = gql`
  mutation CreateConfig($input: CreateConfigInput!) {
    createConfig(createConfigInput: $input) {
      id
      category
      group
      description
      values
      configVisibility
      configStatus
    }
  }
`;

export const UPDATE_CONFIG = gql`
  mutation UpdateConfig($input: UpdateConfigInput!) {
    updateConfig(updateConfigInput: $input) {
      id
      category
      group
      description
      values
      configVisibility
      configStatus
    }
  }
`;

export const REMOVE_CONFIGS = gql`
  mutation RemoveConfigs($ids: [Int!]!) {
    removeConfigs(ids: $ids) {
      id
    }
  }
`;
