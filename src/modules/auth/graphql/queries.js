import { gql } from '@apollo/client';

export const CLASSIC_LOGIN = gql`
  query classicLogin($input: ClassicLoginInput!) {
    classicLogin(input: $input) {
      profile {
        email
        isTwoFactorEnabled
        isTwoFactorConfigured
      }
    }
  }
`; 