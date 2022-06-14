// ./apollo-client.js

import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    uri: "https://app.gc.subsquid.io/beta/rubick/006/graphql",
    cache: new InMemoryCache(),
});

export default client;