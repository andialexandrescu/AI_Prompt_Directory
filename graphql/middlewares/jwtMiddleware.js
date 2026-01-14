//verifica jwt
const jwt = require("jsonwebtoken");

//db models (sequelize)
const db = require('../../models');

const { JWT_SECRET_KEY } = require('../../constants');

//middleware de autentificare jwt
const jwtMiddleware = async (request, response, next) => {
    const authorizationHeader = request.headers.authorization;

    if(!authorizationHeader) {
        next();
        return;
    }

    //extrage raw jwt
    const token = authorizationHeader.replace("Bearer ", "");

    try {
        //verifica jwt signature & il decodeaza
        const payload = jwt.verify(token, JWT_SECRET_KEY);

        //retinut in subject claim ("sub" adica)
        const subjectId = payload.sub;
        const user = await db.User.findByPk(subjectId);

        //daca tokenul e valid dar nu exista userul in db
        if (!user) {
            console.error("No user found for the given token!");
            next();
            return;
        }

        request.userData = user;

    } catch(e) {
        console.log("Invalid token encountered:", e.message);
        console.log("Auth header was:", authorizationHeader);
    }
    next();
}

module.exports = jwtMiddleware;