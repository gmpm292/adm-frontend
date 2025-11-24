// Agregar estas queries al archivo existente

import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      data {
        id
        name
        description
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query productsByCategory($categoryId: Int!) {
    productsByCategory(categoryId: $categoryId) {
      id
      name
      unitOfMeasure
      basePrice
      baseCurrency
      attributes
      warranty
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
      category {
        id
        name
      }
    }
  }
`;

export const CREATE_SALE_WITH_DETAILS = gql`
  mutation CreateSaleWithDetails($sale: SaleWithDetailsInput!) {
    createSaleWithDetails(sale: $sale) {
      id
      totalAmount
      invoiceNumber
      customer {
        id
        name
      }
      details {
        id
        product {
          name
          code
        }
        quantity
        unitPrice
        subtotal
      }
    }
  }
`;
