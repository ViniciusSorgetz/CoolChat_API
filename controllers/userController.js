const connect = require("../database/db");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

dotenv.config();
connect();

module.exports = class UserController{
    
    static async create(req, res){
        const { nick, password, confirmationPassword } = req.body;
        if(!nick){
            return res.status(400).json({
                msg: "Necessário informar o nick."
            });
        }
        const checkNick = await User.findOne({nick: nick});
        if(checkNick){
            return res.status(400).json({
                msg: "Este nick já se encontra em uso."
            })
        }
        if(!password){
            return res.status(400).json({
                msg: "Necessário informar a senha."
            });
        }
        if(password !== confirmationPassword){
            return res.status(400).json({
                msg: "As senhas não batem."
            });
        }
        bcrypt.hash(password, 10).then(async (hash) => {
            try {
                const user = await User.create({nick, password: hash});
                const secret = process.env.SECRET;
                jwt.sign({nick: nick}, secret, { expiresIn: "24h" }, (err, token) => {
                    return res.status(200).json({
                        msg: "Usuário registrado com sucesso.",
                        nick: user.nick,
                        userId: user._id,
                        token: token
                    });
                });
            } 
            catch (error) {
                console.log(error);
                return res.status(500).json({
                    msg: "Erro ao registrar usuário. Tente novamente mais tarde."
                });
            }
        });
    }

    static async login(req, res){

        const {nick, password} = req.body;

        if(!nick){
            return res.status(400).json({
                msg: "Necessário preencher o nick."
            })
        }
        if(!password){
            return res.status(400).json({
                msg: "Necessário preencher a senha."
            })
        }
        const user = await User.findOne({nick: nick});
        if(!user){
            return res.status(404).json({
                msg: "Usuário não encontrado."
            })
        }
        bcrypt.compare(password, user.password).then((result) => {
            if(result){
                const secret = process.env.SECRET;
                jwt.sign({nick: nick}, secret, { expiresIn: "24h" }, (err, token) => {
                    return res.status(200).json({
                        msg: "Welcome to CoolChat.",
                        nick: user.nick,
                        userId: user._id,
                        token: token
                    });
                });
            }else{
                return res.status(400).json({
                    msg: "Senha incorreta."
                })
            }
        })
    }

    static async checkToken(req, res){
        res.status(200).json({
            msg: "Token válido."
        })
    }
}