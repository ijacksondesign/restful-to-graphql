const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
  }

  type Book {
    _id: ID
    authors: [String]
    description: String
    bookId: String
    image: String
    link: String
    title: String
  }

  type Auth {
    token: ID!
    user: User
  }  

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): User
    addUser(username: String!, email: String!, password: String!): User
    saveBook(book: BookInfo): User
    removeBook(bookId: String!): User
  }

  input BookInfo {
    authors: [String]
    description: String
    bookId: String
    image: String
    link: String
    title: String
  }
`;

module.exports = typeDefs;