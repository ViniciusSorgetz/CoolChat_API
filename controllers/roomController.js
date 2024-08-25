const connect = require("../database/db");
const bcrypt = require("bcrypt");
const Room = require("../models/room");
const User = require("../models/user");

connect();

module.exports = class RoomController{

    static async create(req, res){
        const {name, type} = req.body;
        const password = type === "private" ? req.body.password : null;
        if(!name || name.trim().length === 0){
            return res.status(400).json({
                msg: "Necessário informar o nome da sala."
            });
        }
        const checkName = await Room.findOne({name: name.trim()});
        if(checkName){
            return res.status(400).json({
                msg: "Nome de chat já em uso."
            })
        }
        if(type === "private"){
            if(!password || password.trim().length === 0){
                return res.status(400).json({
                    msg: "Necessário informar a senha da sala."
                });
            }
            if(password.trim().length < 5){
                return res.status(400).json({
                    msg: "A senha deve conter pelo menos 5 digitos."
                });
            }
        }
        try {
            if(type === "private"){
                await bcrypt.hash(password.trim(), 10).then(async (hash) => {
                    await Room.create({
                        name: name.trim(), 
                        type, 
                        password: hash
                    });
                })
            }
            else{
                await Room.create({
                    name: name.trim(), 
                    type
                });
            }
            const createdRoom = await Room.findOne({name: name.trim()});
            return res.status(200).json({
                msg: "Sala criada com sucesso.",
                room: {
                    id: createdRoom._id,
                    name: createdRoom.name,
                    type: createdRoom.type,
                    password,
                }
            })
        }
        catch (error) {
            return res.status(500).json({
                msg: "Erro ao criar sala. Tente novamente mais tarde."
            });
        }
    }

    static async list(req, res){
        try {
            const rooms = await Room.find();
            const resRooms = rooms.map(room => ({
                id: room._id,
                name: room.name,
                type: room.type,
            }));
            return res.status(200).json(resRooms);
        } 
        catch (error) {
            return res.status(500).json({
                msg: "Erro ao listar salas. Tente novamente mais tarde."
            });
        }
    }

    static async messages(req, res){

        const roomId = req.params.roomId;

        if(!roomId || roomId === ":roomId"){
            return res.status(400).json({
                msg: "Necessário informar o id da sala."
            });
        }
        let permission = false;
        const room = await Room.findById(roomId);
        if(!room){
            return res.status(404).json({
                msg: "Sala não econtrada."
            });
        }
        if(room.type === "private"){
            const { password } = req.query;
            if(password){
                await bcrypt.compare(password, room.password).then(result => {
                    if(result) permission = true;
                })
            }
        }
        else{
            permission = true;
        }
        if(!permission){
            return res.status(401).json({
                msg: "Senha de sala incorreta."
            })
        }
        try {
            const room = await Room.findById(roomId);
            if(!room){
                return res.status(404).json({
                    msg: "Sala não encontrada."
                })
            }
            const messages = await Promise.all(room.messages.map(async (message) => {
                const user = await User.findById(message.userId);
                const data = {
                    content: message.content,
                    nick: user.nick,
                    postedAt: message.postedAt,
                    updatedAt: message.updatedAt,
                };
                return data;
            }));
            return await res.status(200).json(messages);
        } 
        catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Erro ao listar mensagens. Tente novamente mais tarde."
            });
        }
    }

    static async sendMessage(req, res){
        const {roomId, userId, content} = req.body;
        if(!roomId || !userId || !content){
            return res.status(400).json({
                msg: "Dados incorretos ao enviar a mensagem."
            })
        }
        let permission = false;
        const room = await Room.findOne({_id: roomId});
        if(!room){
            return res.status(400).json({
                msg: "Sala não encontrada."
            });
        }
        if(room.type === "private"){
            const { password } = req.body;
            if(password){
                await bcrypt.compare(password, room.password).then(async (result) => {
                    if(result) permission = true;      
                });
            }
        }
        else{
            permission = true;
        }
        if(!permission){
            return res.status(401).json({
                msg: "Senha de sala incorreta."
            })
        }
        room.messages.push({content, userId});
        try {
            await Room.updateOne({_id: roomId}, room);
            return res.status(200).json({
                msg: "Mensagem enviada com sucesso!"
            });
        } 
        catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Erro ao enviar mensagem. Tente novamente mais tarde."
            });
        }
    }

    static async join(req, res){
        let permission;
        const { password } = req.body;
        const { roomId } = req.params;
        if(!roomId || roomId === ":roomId"){
            return res.status(400).json({
                msg: "Necessário informar o id da sala."
            });
        }
        const room = await Room.findOne({_id: roomId});
        if(!room){
            return res.status(400).json({
                msg: "Sala não encontrada."
            });
        }
        if(password){
            await bcrypt.compare(password, room.password).then(async (result) => {
                if(result) permission = true;
            });
        }
        if(permission){
            return res.status(200).json({
                msg: "Welcome!"
            })
        }
        else{
            return res.status(401).json({
                msg: "Senha de sala incorreta."
            })
        }
    }
}