const express = require('express');
const app = express();
const port = 3009;
const fs = require('fs/promises');

//handler HTTP pentru graphql 
const { createHandler } = require('graphql-http/lib/use/http');
const { GraphQLSchema } = require('graphql');

const QueryType = require('./graphql/rootType/QueryType');
const MutationType = require('./graphql/rootType/MutationType');
//middleware pentru autentificare jwt
const jwtMiddleware = require('./graphql/middlewares/jwtMiddleware');

const schema = require('./graphql/schema');
//pt acces la bd
const db = require('./models');


//aici se creeaza handlerul graphql (parsare query + face resolverul + raspuns final)
const graphQLHandler = createHandler({
    schema,
    //context = ce e accesibil in toate resolverele/resolverurile??; aici se injecteaza user & db:
    // request.raw e obiectul express "req"
    // userData e setat anterior de jwtmiddleare
    context: (request) => ({
        user: request.raw.userData,
        db,
})

});

//ruta graphql (se leaga express cu handlerul graphql):
//jwtMiddleware ruleaza prmul
//graphQLHandler face queryul graphql
app.post('/graphql', jwtMiddleware, graphQLHandler);

app.get('/', (req, res) => {
  res.send('Hello World!');
});


//se exporta si app & posrt pt porinrea serverului & bun si pentru teste
module.exports = {
    app,
    port,
};