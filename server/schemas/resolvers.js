const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id})
                    .select('-__v -password')
                    .populate('savedBooks')

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },
        users: async () => {
            return User.find()
              .select('-__v -password')
              .populate('savedBooks')
        },
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { input: {authors, description, bookId, image, link, title} } , context) => {
            if (context.user) {

                const newBook = {
                    authors,
                    description, 
                    bookId,
                    image,
                    link,
                    title
                };

                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: newBook } },
                    { new: true }
                ).populate('savedBooks');

                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in to save a book.');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { 'bookId': bookId } } },
                    { new: true }
                ).populate('savedBooks');

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in to remove a book.');
        }
    }
};

module.exports = resolvers;