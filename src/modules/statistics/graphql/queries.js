import { gql } from "@apollo/client";

const PERIOD_FIELDS = `
  period {
    dateFrom
    dateTo
    currency
    currencies
    granularity
  }
`;

export const DASHBOARD_STATISTICS = gql`
  query DashboardStatistics($input: StatisticsFilterInput!) {
    dashboardStatistics(input: $input) {
      ${PERIOD_FIELDS}
      revenue
      salesCount
      averageTicket
      previousRevenue
      previousSalesCount
      refundedSalesCount
      cancelledSalesCount
      revenueSeries {
        period
        revenue
        salesCount
      }
      lowStockCount
      lowStock {
        inventoryId
        product
        location
        currentStock
        minStock
      }
      draftSalesCount
      pendingWorkerPayments {
        currency
        amount
        count
      }
      payrollPaid {
        currency
        amount
        count
      }
      attendance {
        key
        count
      }
      activeWorkersCount
      productsCount
      customersCount
    }
  }
`;

export const SALES_STATISTICS = gql`
  query SalesStatistics($input: StatisticsFilterInput!) {
    salesStatistics(input: $input) {
      ${PERIOD_FIELDS}
      revenue
      salesCount
      averageTicket
      deliveriesCount
      topProducts {
        id
        name
        detail
        amount
        quantity
        count
      }
      byCategory {
        id
        name
        quantity
        count
      }
      bySeller {
        id
        name
        amount
        count
      }
      topCustomers {
        id
        name
        detail
        amount
        count
      }
      byPaymentMethod {
        key
        count
        amount
      }
      byStatus {
        key
        count
        amount
      }
      newCustomersCount
      returningCustomersCount
      anonymousSalesCount
    }
  }
`;

export const STATISTICS_BUSINESSES = gql`
  query StatisticsBusinesses($options: ListOptions) {
    businesses(options: $options) {
      data {
        id
        name
      }
    }
  }
`;
