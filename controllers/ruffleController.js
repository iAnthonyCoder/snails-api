const AWS = require('aws-sdk');
AWS.config.update({accessKeyId:process.env.ACCESS_KEY_ID, secretAccessKey:process.env.SECRET_ACCESS_KEY});
const s3 = new AWS.S3();
const Joi = require('@hapi/joi');
const { date } = require('@hapi/joi');
const web3 = require('web3')

var obj = [{
    firstname: "Navjot",
    lastname: "Dhanawat"
}];

var buf = Buffer.from(JSON.stringify(obj));

const schema = Joi.object({
    email: Joi.string().email().required(), 
    address: Joi.string().max(100).required()
});

const getSchema = Joi.object({
    amount: Joi.number().required().max(1000000), 
});

let config = {Bucket: 'crazysnails-bucket', Key: 'ruffle.json'}

const checkAddress = async (values) => {
    try {
        web3.utils.toChecksumAddress(values.address)
        return true
    } catch (er) {
        return false
    }
}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

exports.get = async (req, res, next) => {
    try {
        if(req.query.secret != process.env.SECRET_EX_KEY || !req.query.secret){
            return res.status(409).json({message:"Bad Secret"})
        }
        const validation = getSchema.validate({amount: req.query.amount}, {
            abortEarly: false,
            allowUnknown: false,
        });

        if (validation.error) {
            return res.status(409).json({message:"Verify data sent and try again"})
        }

        let values = validation.value
        
        s3.getObject(config, function(err, data){

            if(err) {
                res.status(err.statusCode).json({message: err.message})
            } else {
                let parsed = JSON.parse(data.Body.toString())
                let random = getRandom(parsed, values.amount)
                let dat = {
                    list: random,
                    emails: random.map(x => {
                        return x.email
                    }),
                    emailsText: random.map(x => {
                        return x.email
                    }).join(', '),
                    addresses: random.map(x => {
                        return x.address
                    })
                }
                console.log(dat)
                s3.upload({
                    Bucket: 'crazysnails-bucket',
                    Key: 'ruffleResult.json',
                    Body: Buffer.from(JSON.stringify(dat)),
                    ContentEncoding: 'base64',
                    ContentType: 'application/json',
                }, function (err, data) {
                    if (err) {
                        return res.status(500).json({message:'Error uploading'})
                    } else {
                        res.status(200).json({message:'Success!'})
                    }
                });
            }
        })

    } catch (er) {
        console.log(er)
    }
}

exports.add = async (req, res, next) => {

    var bucketParams = {
        Bucket: 'crazysnails-bucket',
        Key: 'ruffle.json',
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'application/json',
        // ACL: 'public-read'
    };

    try {

        

        let info = {
            email: req.body.email,
            address: req.body.address
        }


        const validation = schema.validate(info, {
            abortEarly: false,
            allowUnknown: false,
        });

        if (validation.error) {
            return res.status(409).json({message:"Verify data sent and try again"})
        }

        

        let values = validation.value

        let isValidAdress = checkAddress(values)

        if(!isValidAdress){
            return res.status(409).json({message:"Address is not valid"})
        }

        values.createdAt = new Date().toISOString()

        
    
        s3.getObject(config, function(err, data){

            if(err) {
                res.status(err.statusCode).json({message: err.message})
            } else {
                let parsed = JSON.parse(data.Body.toString())
                
                if(parsed.find(x => x.email === values.email) || parsed.find(x => x.address === values.address)){
                    return res.status(409).json({message:"Email or address is already added"})
                } else {
                    parsed = [values, ...parsed]
                    console.log(parsed.length)
           
                    s3.deleteObject(config, function(err, data) {
                        if (err) {
                            return res.status(409).json({message:"Error updating"})
                        } else {
                            s3.upload({
                                Bucket: 'crazysnails-bucket',
                                Key: 'ruffle.json',
                                Body: Buffer.from(JSON.stringify(parsed)),
                                ContentEncoding: 'base64',
                                ContentType: 'application/json',
                            }, function (err, data) {
                                if (err) {
                                    return res.status(500).json({message:'Error uploading'})
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