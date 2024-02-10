import { ApolloServer, gql } from "apollo-server";
import Expo, { ExpoPushMessage } from "expo-server-sdk";

// Create a new Expo SDK client
let expo = new Expo();

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

let pushToken: string; // This holds registered push tokens
let notifications: Notification[] = [
  { id: "1", message: "Hello World", read: false },
];

const typeDefs = gql`
  type Notification {
    id: ID!
    message: String!
    read: Boolean!
  }

  type Query {
    notificationsFeed: [Notification]!
  }

  type Mutation {
    sendNotification(message: String!, delay: Int): Boolean
    registerPushToken(token: String!): Boolean
    markNotificationAsRead(id: ID!): Boolean
  }
`;

function delaySeconds(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

const resolvers = {
  Query: {
    notificationsFeed: () => {
      console.log("Returning notifications...");
      return notifications;
    },
  },
  Mutation: {
    sendNotification: async (
      _: any,
      { message, delay }: { message: string; delay: number }
    ): Promise<Boolean> => {
      if (!pushToken) {
        console.error("No push token registered");
        return false;
      }
      console.log("Sending notification...");
      const newNotification: Notification = {
        id: String(notifications.length + 1),
        message,
        read: false,
      };
      notifications.push(newNotification);
      if (delay) {
        await delaySeconds(delay);
      }
      // Assuming you're sending the notification to the first token in the array for demonstration
      if (pushToken && Expo.isExpoPushToken(pushToken)) {
        const message: ExpoPushMessage = {
          to: pushToken, // The recipient push token
          sound: "default",
          body: newNotification.message,
          data: { withSome: "data" },
        };

        try {
          await expo.sendPushNotificationsAsync([message]); // Note: Sending a single message
          console.log("Notification sent successfully");
        } catch (error) {
          console.error("Error sending notification:", error);
          return false;
        }
      }

      return true;
    },
    registerPushToken: (_: any, { token }: { token: string }): boolean => {
      pushToken = token;
      return true;
    },
    markNotificationAsRead: (_: any, { id }: { id: string }): Notification => {
      const notification = notifications.find(
        (notification) => notification.id === id
      );
      if (!notification) {
        throw new Error("Notification not found");
      }
      notification.read = true;
      return notification;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
