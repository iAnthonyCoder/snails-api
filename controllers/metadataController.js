const AWS = require('aws-sdk');
AWS.config.update({accessKeyId:process.env.ACCESS_KEY_ID, secretAccessKey:process.env.SECRET_ACCESS_KEY});
const s3 = new AWS.S3();


exports.find = async (req, res, next) => {

    let config = {Bucket: 'nft-col-01', Key: req.params.id+'.json',}

    try {

        s3.getObject(config, function(err, data){

            if(err) {
                res.status(err.statusCode).json({message: err.message})
            } else {
                let parsed = JSON.parse(data.Body.toString())
                parsed.image = parsed.image.replace('url', 'https://crazy-snails.herokuapp.com/images')
                res.json(parsed)
            }

        })
        
    } catch (er) {

        res.status(500).json({message:"Something went wrong"})
        
    }

}


exports.findDefault = async (req, res, next) => {

    let config = {Bucket: 'nft-col-01', Key: 'default.json',}

    try {

        s3.getObject(config, function(err, data){

            if(err) {
                res.status(err.statusCode).json({message: err.message})
            } else {
                let parsed = JSON.parse(data.Body.toString())
                parsed.image = parsed.image.replace('url', 'https://crazy-snails.herokuapp.com/images')
                res.json(parsed)
            }

        })
        
    } catch (er) {

        res.status(500).json({message:"Something went wrong"})
        
    }

}