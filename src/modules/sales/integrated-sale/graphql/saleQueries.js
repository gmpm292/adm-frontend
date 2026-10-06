import { gql } from "@apollo/client";

// Todo lo que la pantalla necesita de la tienda, en una consulta
export const GET_SALE_CATALOG = gql`
  query SaleCatalog($officeId: Int) {
    saleCatalog(officeId: $officeId) {
      office {
        id
        name
        businessId
        businessName
      }
      offices {
        id
        name
        businessId
        businessName
      }
      currencies {
        code
        name
        symbol
      }
      defaultCurrency
      categories {
        id
        name
      }
      products {
        id
        name
        categoryId
        categoryName
        unit
        stock
        baseCurrency
        prices {
          currency
          unitPrice
        }
      }
      workers {
        id
        name
        workerType
      }
      currentWorkerId
      canChooseSeller
    }
  }
`;

// Precio y disponibilidad del carrito, con el mismo cálculo que el cobro
export const QUOTE_SALE = gql`
  query QuoteSale($input: QuoteSaleInput!) {
    quoteSale(quoteSaleInput: $input) {
      totals {
        currency
        total
      }
      lines {
        productId
        quantity
        available
        prices {
          currency
          unitPrice
          total
        }
        error
      }
    }
  }
`;

// Con `payments` la venta se crea ya cobrada; sin ellos queda en borrador
export const CHECKOUT_SALE = gql`
  mutation CheckoutSale($sale: CreateSaleInput!) {
    createSale(createSaleInput: $sale) {
      id
      saleStatus
      invoiceNumber
      totalAmount
      totalAmountCurrency
      effectiveDate
      payments
      customer {
        id
        fullName
      }
      details {
        id
        quantity
        unitPrice
        subtotal
        currency
        product {
          id
          name
        }
      }
    }
  }
`;

export const SEARCH_CUSTOMERS = gql`
  query SearchCustomers($options: ListOptions) {
    customers(options: $options) {
      data {
        id
        fullName
        ci
        phone
        email
      }
    }
  }
`;
