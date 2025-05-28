import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query Products($options: ListOptions) {
    products(options: $options) {
      totalCount
      data {
        id
        name
        unitOfMeasure
        costPrice
        costCurrency
        basePrice
        baseCurrency
        warranty
        createdAt
        updatedAt
        category {
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
      unitOfMeasure
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
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($product: CreateProductInput!) {
    createProduct(createProductInput: $product) {
      id
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($product: UpdateProductInput!) {
    updateProduct(updateProductInput: $product) {
      id
      name
      unitOfMeasure
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
