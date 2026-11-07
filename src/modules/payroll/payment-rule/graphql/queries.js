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
  business {
    id
    name
  }
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

/**
 * Monedas, productos, categorías y trabajadores para el formulario. Con su
 * empresa: el SUPER solo ve los de la empresa que elige.
 */
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
        business {
          id
        }
      }
    }
    categories(options: { take: 500, sorts: [{ property: "name", direction: ASC }] }) {
      data {
        id
        name
        business {
          id
        }
      }
    }
    workers(options: { take: 1000, sorts: [{ property: "tempFirstName", direction: ASC }] }) {
      data {
        id
        business {
          id
        }
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
