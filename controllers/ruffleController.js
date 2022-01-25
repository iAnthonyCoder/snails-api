const AWS = require('aws-sdk');
AWS.config.update({accessKeyId:process.env.ACCESS_KEY_ID, secretAccessKey:process.env.SECRET_ACCESS_KEY});
const s3 = new AWS.S3();
const Joi = require('@hapi/joi');

var obj = [{
    firstname: "Navjot",
    lastname: "Dhanawat"
}];

var buf = Buffer.from(JSON.stringify(obj));

const schema = Joi.object({
    email: Joi.string().email(), 
    address: Joi.string().max(100).required()
});

exports.add = async (req, res, next) => {

    var bucketParams = {
        Bucket: 'nft-col-01',
        Key: 'ruffle.json',
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'application/json',
        // ACL: 'public-read'
    };

    try {

        let config = {Bucket: 'nft-col-01', Key: 'ruffle.json'}

        let info = {
            email: req.body.email,
            address: req.body.address
        }

        const validation = schema.validate(info, {
            abortEarly: false,
            allowUnknown: false,
        });

        const values = validation.value
    
        s3.getObject(config, function(err, data){

            if(err) {
                res.status(err.statusCode).json({message: err.message})
            } else {
                let parsed = JSON.parse(data.Body.toString())
                
                if(parsed.find(x => x.email === values.email) || parsed.find(x => x.address === values.address)){
                    res.status(409).json({message:"Email or address is already added"})
                } else {
                    parsed = parsed.concat(values)
           
                    s3.deleteObject(config, function(err, data) {
                        if (err) {
                            res.status(409).json({message:"Error updating"})
                        } else {
                            s3.upload({
                                Bucket: 'nft-col-01',
                                Key: 'ruffle.json',
                                Body: Buffer.from(JSON.stringify(parsed)),
                                ContentEncoding: 'base64',
                                ContentType: 'application/json',
                            }, function (err, data) {
                                if (err) {
                                    res.status(500).json({message:'Error uploading'})
                                } else {
                                    res.status(200).json({message:'Added Successfully'})
                                }
                            });
                        }
                    });
                }
            }

        })

        // s3.upload(data, function (err, data) {
        //     if (err) {
        //         res.status(500).json({message:'Error uploading'})
        //     } else {
        //         res.status(200).json({message:'Added Successfully'})
        //     }
        // });
        
    } catch (er) {
        console.log(er)
        res.status(500).json({message:"Something went wrong"})
        
    }

}