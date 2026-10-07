import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query Products($options: ListOptions) {
    products(options: $options) {
      totalCount
      data {
        id
        name
        deletedAt
        unitOfMeasure {
          id
          name
          symbol
        }
        costPrice
        costCurrency
        basePrice
        baseCurrency
        createdAt
        category {
          id
          name
        }
        inventories {
          id
          currentStock
          minStock
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query Product($id: Int!) {
    product(id: $id) {
      id
      name
      costPrice
      costCurrency
      basePrice
      baseCurrency
      warranty
      attributes
      createdAt
      updatedAt
      unitOfMeasure {
        id
        name
        symbol
      }
      materialCost {
        id
        name
        costPrice
        currency {
          code
        }
        unitOfMeasure {
          symbol
        }
      }
      category {
        id
        name
      }
      pricingConfig {
        acceptedCurrencies
        fixedPrices {
          currency
          amount
        }
        exchangeRateMargin
        decimalPlaces
      }
      saleRules {
        minQuantity
        maxQuantity
        bulkDiscounts {
          minQty
          discount
          applicableCurrencies
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
      inventories {
        id
        currentStock
        minStock
        location
        office {
          id
          name
        }
      }
      createdBy {
        id
        name
        lastName
      }
      updatedBy {
        id
        name
        lastName
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($product: CreateProductInput!) {
    createProduct(createProductInput: $product) {
      id
      name
      business {
        id
      }
      office {
        id
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($product: UpdateProductInput!) {
    updateProduct(updateProductInput: $product) {
      id
      name
    }
  }
`;

export const DELETE_PRODUCTS = gql`
  mutation RemoveProducts($ids: [Int!]!) {
    removeProducts(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_PRODUCTS = gql`
  mutation RestoreProducts($ids: [Int!]!) {
    restoreProducts(ids: $ids)
  }
`;

export const GET_MATERIAL_COST_BY_ID = gql`
  query MaterialCost($id: Int!) {
    materialCost(id: $id) {
      id
      name
      costPrice
      currency {
        code
      }
      unitOfMeasure {
        id
      }
    }
  }
`;

/** Monedas con las que se puede poner precio */
export const GET_ACTIVE_CURRENCIES = gql`
  query ProductCurrencies {
    currencies(options: { take: 100 }) {
      data {
        id
        code
        name
        isActive
      }
    }
  }
`;
