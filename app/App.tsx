import { ApolloProvider } from '@apollo/client';
import { NotificationProvider } from './src/context/notification';
import { apolloClient } from './src/gql/client';
import { FeedScreen } from './src/screens/feed';

export default function App() {

  return (
    <ApolloProvider client={apolloClient}>
      <NotificationProvider>
        <FeedScreen />
      </NotificationProvider>
    </ApolloProvider>
  );
}
