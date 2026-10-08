import { gql } from "@apollo/client";

const RULE_FIELDS = `
  id
  name
  description
  paymentType
  workerType
  otherType
  paymentCurrency
  scope
  distributeProfits
  isActive
  deletedAt
  product {
    id
    name
  }
  category {
    id
    name
  }
  specificWorkers {
    id
    tempFirstName
    tempLastName
    user {
      id
      name
      lastName
    }
  }
  conditions {
    fixedAmount {
      amount
    }
    percentage {
      percentage
    }
    priceRanges {
      min
      max
      currency
      amount
      percentage
    }
    saleQuantity {
      minProducts
      ratePerProduct
      percentagePerProduct
    }
  }
`;

export const GET_PAYMENT_RULES = gql`
  query PaymentRules($options: ListOptions) {
    paymentRules(options: $options) {
      totalCount
      data {
        ${RULE_FIELDS}
      }
    }
  }
`;

export const CREATE_PAYMENT_RULE = gql`
  mutation CreatePaymentRule($rule: CreatePaymentRuleInput!) {
    createPaymentRule(createPaymentRuleInput: $rule) {
      id
      name
    }
  }
`;

export const UPDATE_PAYMENT_RULE = gql`
  mutation UpdatePaymentRule($rule: UpdatePaymentRuleInput!) {
    updatePaymentRule(updatePaymentRuleInput: $rule) {
      id
      name
    }
  }
`;

export const REMOVE_PAYMENT_RULES = gql`
  mutation RemovePaymentRules($ids: [Int!]!) {
    removePaymentRules(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_PAYMENT_RULES = gql`
  mutation RestorePaymentRules($ids: [Int!]!) {
    restorePaymentRules(ids: $ids)
  }
`;

/** Monedas, productos y categorías para el formulario */
export const GET_RULE_FORM_OPTIONS = gql`
  query PaymentRuleFormOptions {
    currencies(options: { take: 100 }) {
      data {
        id
        code
        name
        isActive
      }
    }
    products(options: { take: 1000, sorts: [{ property: "name", direction: ASC }] }) {
      data {
        id
        name
      }
    }
    categories(options: { take: 500, sorts: [{ property: "name", direction: ASC }] }) {
      data {
        id
        name
      }
    }
    workers(options: { take: 1000, sorts: [{ property: "tempFirstName", direction: ASC }] }) {
      data {
        id
        workerType
        otherType
        tempFirstName
        tempLastName
        user {
          id
          name
          lastName
        }
      }
    }
  }
`;
