const axios = require('axios');
const Dev = require('../models/Dev');
const parseSringAsArray = require('../utils/parseStringasArray');
const { findConnections, sendMessage } = require('../websocket');


module.exports = {
    async index(req, res){
        const devs = await Dev.find();

        return res.json(devs);
    },

    async store(req, res) {
        const { github_username, techs, latitude, longitude } = req.body;
    
        let dev = await Dev.findOne( { github_username });

        if(!dev){

            const response = await axios.get(`https://api.github.com/users/${github_username}`);
    
            const { name, avatar_url, bio } = response.data;
        
            const techsArray = parseSringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };

            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            });

            // Filtrar as conexões que estão há no máximo 10km de distância 
            // e que o novo dev tenha pelo menos uma das tecnologias filtradas

            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techsArray, 
            )
            sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }

        return res.json(dev);
    },

    async update(req, resp) {


        const { id } = req.query;

        const { github_username, techs, latitude, longitude } = req.body;

        const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);

        const { avatar_url, bio } = apiResponse.data;

        const techsArray = parseStringAsArray(techs);

        const location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };

        dev = await Dev.findByIdAndUpdate({ _id: id }, {
            avatar_url,
            bio,
            techs: techsArray,
            location
        });

        return resp.json(dev);
    },

    async destroy(req, resp) {

        const { id } = req.query;

        dev = await Dev.findByIdAndDelete({ _id: id });

        return resp.json('Dev excluido com sucesso!');

    },
};
