import { gql } from "@apollo/client";

const CURRENCY_FIELDS = `
  id
  code
  name
  symbol
  exchangeRateToCUP
  isActive
`;

export const GET_CURRENCIES = gql`
  query Currencies($options: ListOptions) {
    currencies(options: $options) {
      totalCount
      data {
        ${CURRENCY_FIELDS}
      }
    }
  }
`;

export const CREATE_CURRENCY = gql`
  mutation CreateCurrency($createCurrencyInput: CreateCurrencyInput!) {
    createCurrency(createCurrencyInput: $createCurrencyInput) {
      ${CURRENCY_FIELDS}
    }
  }
`;

export const UPDATE_CURRENCY = gql`
  mutation UpdateCurrency($updateCurrencyInput: UpdateCurrencyInput!) {
    updateCurrency(updateCurrencyInput: $updateCurrencyInput) {
      ${CURRENCY_FIELDS}
    }
  }
`;
