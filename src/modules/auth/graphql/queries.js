import { gql } from "@apollo/client";

const CLASSIC_LOGIN = gql`
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

const GET_PROFILE = gql`
  query Profile {
    profile {
      id
      role
      business {
        id
      }
      office {
        id
      }
      department {
        id
      }
      team {
        id
      }
    }
  }
`;

const REFRESH_TOKEN = gql`
  mutation Refresh {
    refresh {
      accessToken
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(changePasswordInput: $input) {
      id
    }
  }
`;

const CHECK_CONFIRMATION_TOKEN = gql`
  mutation CheckConfirmationToken($input: CheckConfirmationTokenInput!) {
    checkConfirmationToken(checkConfirmationTokenInput: $input)
  }
`;

const REQUEST_PASSWORD_CHANGE_FOR_ANOTHER_USER = gql`
  mutation RequestPasswordChangeForAnotherUser(
    $input: RequestPasswordChangeInput!
  ) {
    requestPasswordChangeForAnotherUser(input: $input) {
      message
    }
  }
`;

const GENERATE_2FA_SECRET = gql`
  mutation Generate2faSecret {
    generate2faSecret
  }
`;

const VERIFY_2FA = gql`
  query Verify2FA($token2Fa: String) {
    verify2FA(token2fa: $token2Fa) {
      accessToken
      refreshToken
      profile {
        id
        email
        enabled
        name
        lastName
        mobile
        role
        isTwoFactorEnabled
        isTwoFactorConfigured
      }
    }
  }
`;

const FINISH_CONFIGURE_2FA = gql`
  mutation FinishConfigure2FA($token2Fa: String) {
    finishConfigure2FA(token2fa: $token2Fa)
  }
`;

const LOGOUT = gql`
  mutation Logout {
    logout {
      id
    }
  }
`;

const RESET_2FA_SETTINGS = gql`
  mutation Reset2FASettings($id: Int) {
    reset2FASettings(id: $id)
  }
`;

const ENABLE_2FA = gql`
  mutation Enable2FA($id: Int) {
    enable2FA(id: $id)
  }
`;

const DISABLE_2FA = gql`
  mutation Disable2FA($id: Int) {
    disable2FA(id: $id)
  }
`;

export {
  CLASSIC_LOGIN,
  GET_PROFILE,
  REFRESH_TOKEN,
  CHANGE_PASSWORD,
  CHECK_CONFIRMATION_TOKEN,
  REQUEST_PASSWORD_CHANGE_FOR_ANOTHER_USER,
  GENERATE_2FA_SECRET,
  VERIFY_2FA,
  FINISH_CONFIGURE_2FA,
  LOGOUT,
  RESET_2FA_SETTINGS,
  ENABLE_2FA,
  DISABLE_2FA,
};
