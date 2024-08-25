const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
dotenv.config();

const checkToken = (req, res, next) => {

    if(!req.headers.authorization){
        return res.status(400).json({
            msg: "Token necessário."
        });
    }
    const token = req.headers.authorization.split(" ")[1];
    const secret = process.env.SECRET;
    jwt.verify(token, secret, async (err, decoded) => {
        if(err){
            console.log(err);
            return res.status(400).json({
                msg: "Acesso negado."
            })
        }
        next();
    });

}

module.exports = checkToken;