import { gql } from "@apollo/client";

export const GET_QZ_PUBLIC_KEY = gql`
  query GetQZPublicKey {
    getQZPublicKey {
      publicKey
    }
  }
`;

export const SIGN_QZ_REQUEST = gql`
  mutation SignQZRequest($request: String!) {
    signQZRequest(request: $request)
  }
`;
