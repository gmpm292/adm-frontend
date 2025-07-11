import { gql } from "@apollo/client";

export const INIT_EMAIL_OAUTH = gql`
  query InitEmailOAuth {
    oauth2InitEmailAuth {
      url
      clientId
      redirectUri
    }
  }
`;

export const GET_EMAIL_OAUTH_STATUS = gql`
  query GetEmailOAuthStatus {
    oauth2EmailStatus {
      isConfigured
      expiresAt
      email
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

export const GET_EMAIL_HEALTH_STATUS = gql`
  query GetEmailHealthStatus {
    emailHealthStatus {
      isHealthy
      provider
      lastChecked
      error
    }
  }
`;
