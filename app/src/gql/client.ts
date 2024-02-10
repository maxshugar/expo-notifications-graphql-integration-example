import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

const API_URL = "http://192.168.0.137:4000/graphql";
const httpLink = createHttpLink({ uri: API_URL });

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
