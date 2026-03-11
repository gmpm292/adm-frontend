import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query Products($options: ListOptions) {
    products(options: $options) {
      totalCount
      data {
        id
        name
        unitOfMeasure {
          id
          name
          symbol
          category
        }
        materialCost {
          id
          name
          costPrice
          currency {
            code
            symbol
          }
          unitOfMeasure {
            symbol
          }
        }
        costPrice
        costCurrency
        basePrice
        baseCurrency
        warranty
        createdAt
        updatedAt
        category {
          id
          name
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
      unitOfMeasure {
        id
        name
        symbol
        category
        isActive
      }
      materialCost {
        id
        name
        costPrice
        currency {
          id
          code
          symbol
          name
        }
        unitOfMeasure {
          id
          symbol
          name
        }
        isActive
      }
      costPrice
      costCurrency
      basePrice
      baseCurrency
      warranty
      attributes
      createdAt
      updatedAt
      category {
        id
        name
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
          teamType
        }
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
      department {
        id
        name
      }
      team {
        id
        name
        teamType
      }
      createdBy {
        id
        name
      }
      updatedBy {
        id
        name
      }
      deletedBy {
        id
        name
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($product: CreateProductInput!) {
    createProduct(createProductInput: $product) {
      id
      name
      unitOfMeasure {
        id
        name
        symbol
      }
      materialCost {
        id
        name
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($product: UpdateProductInput!) {
    updateProduct(updateProductInput: $product) {
      id
      name
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
      costPrice
      costCurrency
      basePrice
      baseCurrency
      warranty
      attributes
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

export const GET_MATERIAL_COST_BY_ID = gql`
  query MaterialCost($id: Int!) {
    materialCost(id: $id) {
      id
      name
      costPrice
      currency {
        id
        code
        symbol
        name
      }
      unitOfMeasure {
        id
        name
        symbol
        category
      }
      isActive
    }
  }
`;
