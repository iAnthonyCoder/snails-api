const AWS = require('aws-sdk');
AWS.config.update({accessKeyId:process.env.ACCESS_KEY_ID, secretAccessKey:process.env.SECRET_ACCESS_KEY});
const s3 = new AWS.S3();


exports.findImage = async (req, res, next) => {

    try {

        let config = {Bucket: 'crazysnails-bucket', Key: req.params.id}
        const data = await s3.getObject(config).promise()
        const b64 = Buffer.from(data.Body).toString('base64');
        const mimeType = 'image/png'; // e.g., image/png
        res.writeHead(200, {'Content-Type': 'image/jpg'});
        res.end(b64,'Base64');
        // res.send(`<img src="data:${mimeType};base64,${b64}" />`);

    } catch (er) {

        if(er.statusCode){
            res.status(er.statusCode).json({message: er.message})
        } else {
            res.status(500).json({message:"Something went wrong"})
        }

    }


}