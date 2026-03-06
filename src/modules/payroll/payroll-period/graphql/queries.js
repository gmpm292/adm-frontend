// payroll-period/graphql/queries.js
import { gql } from "@apollo/client";

export const GET_PAYROLL_PERIODS = gql`
  query PayrollPeriods($options: ListOptions) {
    payrollPeriods(options: $options) {
      totalCount
      data {
        id
        name
        description
        startDate
        endDate
        isClosed
        createdAt
        updatedAt
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
        payments {
          id
          amount
          currency
          paymentMethod
          paymentConcept
          paidDate
          worker {
            id
            workerType
            user {
              id
              name
              lastName
              email
            }
            tempFirstName
            tempLastName
            tempEmail
          }
        }
        createdBy {
          id
          name
          email
        }
        updatedBy {
          id
          name
          email
        }
      }
    }
  }
`;

export const GET_PAYROLL_PERIOD_BY_ID = gql`
  query PayrollPeriod($id: Int!) {
    payrollPeriod(id: $id) {
      id
      name
      description
      startDate
      endDate
      isClosed
      createdAt
      updatedAt
      business {
        id
        name
        taxId
        address
        contactPhone
        contactEmail
      }
      office {
        id
        name
        description
        address
        officeType
      }
      department {
        id
        name
        description
        departmentType
      }
      team {
        id
        name
        description
        teamType
      }
      createdBy {
        id
        name
        lastName
        email
      }
      updatedBy {
        id
        name
        lastName
        email
      }
      deletedBy {
        id
        name
        lastName
        email
      }
      payments {
        id
        amount
        currency
        exchangeRate
        paymentMethod
        paymentConcept
        paidDate
        notes
        breakdown
        createdAt
        updatedAt
        worker {
          id
          workerType
          baseSalary
          user {
            id
            name
            lastName
            email
            mobile
          }
          tempFirstName
          tempLastName
          tempEmail
          tempPhone
        }
        sale {
          id
          effectiveDate
          totalAmount
          paymentMethod
          invoiceNumber
          isConfirmed
        }
        createdBy {
          id
          name
          email
        }
        updatedBy {
          id
          name
          email
        }
      }
    }
  }
`;

export const CREATE_PAYROLL_PERIOD = gql`
  mutation CreatePayrollPeriod(
    $createPayrollPeriodInput: CreatePayrollPeriodInput!
  ) {
    createPayrollPeriod(createPayrollPeriodInput: $createPayrollPeriodInput) {
      id
      name
      startDate
      endDate
      isClosed
      description
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

export const UPDATE_PAYROLL_PERIOD = gql`
  mutation UpdatePayrollPeriod(
    $updatePayrollPeriodInput: UpdatePayrollPeriodInput!
  ) {
    updatePayrollPeriod(updatePayrollPeriodInput: $updatePayrollPeriodInput) {
      id
      name
      startDate
      endDate
      isClosed
      description
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

export const CLOSE_PAYROLL_PERIOD = gql`
  mutation ClosePayrollPeriod($id: Int!) {
    closePayrollPeriod(id: $id) {
      id
      isClosed
      name
      endDate
    }
  }
`;

export const REMOVE_PAYROLL_PERIODS = gql`
  mutation RemovePayrollPeriods($ids: [Int!]!) {
    removePayrollPeriods(ids: $ids) {
      id
      name
      isClosed
    }
  }
`;

export const PROCESS_PERIOD_PAYMENTS = gql`
  mutation ProcessPeriodPayments($input: ProcessPeriodPaymentsInput!) {
    processPeriodPayments(processPeriodPaymentsInput: $input) {
      data {
        workerId
        workerName
        amount
        currency
        paymentConcept
        status
        errors
        details
      }
      totalCount
      successCount
      errorCount
    }
  }
`;

export const PROCESS_PERIOD_SALES = gql`
  mutation ProcessPeriodSales($payrollPeriodId: Int!) {
    processPeriodSales(payrollPeriodId: $payrollPeriodId) {
      success
      payrollPeriodId
      totalSales
      successful
      failed
      totalPaymentsCreated
      totalAmount
      results {
        saleId
        success
        paymentsCreated
        totalAmount
        error
        details
      }
    }
  }
`;
