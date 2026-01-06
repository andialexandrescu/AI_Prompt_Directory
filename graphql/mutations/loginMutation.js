const LoggedInUserType = require("../types/LoggedInUserType");
const LoginCredentialsInputType = require("../inputTypes/LoginCredentialsInputType");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../constants");
const db = require("../../models");
const bcrypt = require("bcryptjs");
const { GraphQLUnionType } = require("graphql");
const FailedAuthenticationType = require("../types/FailedAuthenticationType");

const loginMutation = {
    type: new GraphQLUnionType({
        name: 'LoginMutationUnion',
        types: [LoggedInUserType, FailedAuthenticationType],
        resolveType: (value) => {
            if(value.token) {
                return 'LoggedInUser';
            }

            return 'FailedAuthentication';
        }
    }),
    args: {
        input: {
            type: LoginCredentialsInputType
        }
    },
    resolve: async (_, args) => {
        const { username, password } = args.input;

        const user = await db.User.findOne({ where: { username } });

        if(!user) {
            return {
                reason: "User not found",
            };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch) {
            return {
                reason: "Incorrect password",
            };
        }

        const token = jwt.sign({
            sub: user.id,
        }, JWT_SECRET_KEY);

        return {
            id: user.id,
            token,
        };
    }
}

module.exports = loginMutation;