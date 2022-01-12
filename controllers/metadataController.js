const AWS = require('aws-sdk');
AWS.config.update({accessKeyId:"AKIAYIXALYDSZQNZDT5M", secretAccessKey:"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"});
const s3 = new AWS.S3();


exports.find = async (req, res, next) => {

    let config = {Bucket: 'nft-col-01', Key: req.params.id+'.json',}

    try {

        s3.getObject(config, function(err, data){

            if(err) {
                res.status(err.statusCode).json({message: err.message})
            } else {
                let parsed = JSON.parse(data.Body.toString())
                parsed.image = parsed.image.replace('url', 'http://localhost:5000/images')
                res.json(parsed)
            }

        })
        
    } catch (er) {

        res.status(500).json({message:"Something went wrong"})
        
    }

}