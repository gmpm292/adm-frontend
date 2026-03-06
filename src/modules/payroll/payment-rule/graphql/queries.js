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
        otherType
        isActive
        createdAt
        updatedAt
        deletedAt
        paymentCurrency
        scope
        distributeProfits
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
      otherType
      isActive
      paymentCurrency
      scope
      distributeProfits
      specificWorkersIds
      conditions {
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
      product {
        id
        name
      }
      category {
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
      paymentType
      workerType
      otherType
      isActive
      paymentCurrency
      scope
      distributeProfits
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
      otherType
      isActive
      paymentCurrency
      scope
      distributeProfits
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
