import { gql } from "@apollo/client";

export const GET_EMAIL_STATS = gql`
  query GetEmailStats {
    emailStats {
      total
      sent
      failed
      pending
      successRate
    }
  }
`;

export const GET_EMAILS = gql`
  query GetEmails {
    emails {
      id
      to
      subject
      status
      provider
      sentAt
      retryCount
      error {
        message
      }
      createdAt
    }
  }
`;

export const RETRY_FAILED_EMAILS = gql`
  mutation RetryFailedEmails {
    retryFailedEmails
  }
`;
