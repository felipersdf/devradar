const Dev = require('../models/Dev');
const parseSringAsArray = require('../utils/parseStringasArray');

module.exports = {
    async index(req, res){
        const { latitude, longitude, techs } = req.query;

        const techsArray = parseSringAsArray(techs);

        const devs = await Dev.find({
            techs: {
                $in: techsArray,
            },
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: 10000,
                },
            }
        });

        return res.json({ devs });
    }
}