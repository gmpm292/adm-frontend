import { gql } from "@apollo/client";

export const GET_CURRENCIES = gql`
  query Currencies($options: ListOptions) {
    currencies(options: $options) {
      totalCount
      data {
        id
        code
        name
        symbol
        exchangeRateToCUP
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_CURRENCY_BY_CODE = gql`
  query Currency($code: String!) {
    currency(code: $code) {
      id
      code
      name
      symbol
      exchangeRateToCUP
      isActive
      metadata
      createdAt
      updatedAt
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

export const CREATE_CURRENCY = gql`
  mutation CreateCurrency($createCurrencyInput: CreateCurrencyInput!) {
    createCurrency(createCurrencyInput: $createCurrencyInput) {
      id
      code
    }
  }
`;

export const UPDATE_CURRENCY = gql`
  mutation UpdateCurrency($updateCurrencyInput: UpdateCurrencyInput!) {
    updateCurrency(updateCurrencyInput: $updateCurrencyInput) {
      id
      code
      name
      symbol
      exchangeRateToCUP
      isActive
    }
  }
`;

export const ACTIVATE_CURRENCY = gql`
  mutation ActivateCurrency($code: String!) {
    activateCurrency(code: $code) {
      id
      code
      isActive
    }
  }
`;

export const DEACTIVATE_CURRENCY = gql`
  mutation DeactivateCurrency($code: String!) {
    deactivateCurrency(code: $code) {
      id
      code
      isActive
    }
  }
`;