import { gql } from "@apollo/client";

export const REGISTER_PUSH_TOKEN_MUTATION = gql`
  mutation RegisterPushToken($token: String!) {
    registerPushToken(token: $token)
  }
`;

export const SEND_NOTIFICATION_MUTATION = gql`
  mutation SendNotification($message: String!, $delay: Int) {
    sendNotification(message: $message, delay: $delay)
  }
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`;
