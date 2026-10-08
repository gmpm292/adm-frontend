import { gql } from "@apollo/client";

export const GET_EMAIL_TEMPLATES = gql`
  query GetEmailTemplates {
    emailTemplates {
      id
      name
      subject
      body
      defaultContext
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_EMAIL_TEMPLATE = gql`
  mutation CreateEmailTemplate($input: CreateEmailTemplateInput!) {
    createEmailTemplate(input: $input) {
      id
    }
  }
`;

export const UPDATE_EMAIL_TEMPLATE = gql`
  mutation UpdateEmailTemplate($input: UpdateEmailTemplateInput!) {
    updateEmailTemplate(input: $input) {
      id
    }
  }
`;
