import { gql } from "@apollo/client";

export const NOTIFICATIONS_FEED_QUERY = gql`
  query NotificationsFeed {
    notificationsFeed {
      id
      message
      read
    }
  }
`;
