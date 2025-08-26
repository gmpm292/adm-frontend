import { gql } from "@apollo/client";

export const GET_PAYMENT_RULES = gql`
  query PaymentRules($options: ListOptions) {
    paymentRules(options: $options) {
      totalCount
      data {
        id
        name
        paymentType
        workerType
        isActive
        createdAt
        updatedAt
        deletedAt
      }
    }
  }
`;

export const GET_PAYMENT_RULE_BY_ID = gql`
  query PaymentRule($id: Int!) {
    paymentRule(id: $id) {
      createdAt
      updatedAt
      deletedAt

      id
      name
      description
      paymentType
      workerType
      isActive
      conditions {
        paymentCurrency
        scope
        priceRanges {
          min
          max
          currency
          amount
        }
        saleQuantity {
          minProducts
          ratePerProduct
        }
        fixedAmount {
          amount
        }
        percentage {
          percentage
        }
      }
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

export const CREATE_PAYMENT_RULE = gql`
  mutation CreatePaymentRule($createPaymentRuleInput: CreatePaymentRuleInput!) {
    createPaymentRule(createPaymentRuleInput: $createPaymentRuleInput) {
      id
      name
    }
  }
`;

export const UPDATE_PAYMENT_RULE = gql`
  mutation UpdatePaymentRule($updatePaymentRuleInput: UpdatePaymentRuleInput!) {
    updatePaymentRule(updatePaymentRuleInput: $updatePaymentRuleInput) {
      id
      name
      paymentType
      workerType
      isActive
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
