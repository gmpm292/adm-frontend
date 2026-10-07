import { gql } from "@apollo/client";

export const INIT_EMAIL_OAUTH = gql`
  query InitEmailOAuth {
    oauth2InitEmailAuth {
      url
    }
  }
`;

export const GET_EMAIL_STATUS = gql`
  query GetEmailStatus {
    oauth2EmailStatus {
      isConfigured
      email
    }
    emailHealthStatus {
      isHealthy
      provider
    }
  }
`;

export const EMAIL_OAUTH_CALLBACK = gql`
  mutation EmailOAuthCallback($code: String!) {
    oauth2EmailCallback(code: $code) {
      success
      message
    }
  }
`;
