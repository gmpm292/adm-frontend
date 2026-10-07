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
