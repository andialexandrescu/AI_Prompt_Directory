const express = require('express');
const app = express();
const port = 3009;
const fs = require('fs/promises');
const { createHandler } = require('graphql-http/lib/use/http');
const { GraphQLSchema } = require('graphql');

const QueryType = require('./graphql/rootType/QueryType');
const MutationType = require('./graphql/rootType/MutationType');

// app.use(express.json()); // middleware pt a injecta express pentru orice ruta de request http
const jwtMiddleware = require('./graphql/middlewares/jwtMiddleware');

const schema = require('./graphql/schema');

const graphQLHandler = createHandler({
    schema,
    context: (request) => {
        return {
            user: request.raw.userData,
        }
    }
});
app.post('/graphql', jwtMiddleware, graphQLHandler);

app.get('/', (req, res) => {
    console.log(req.body);
    res.send('Hello World!');
});

module.exports = {
    app,
    port,
};