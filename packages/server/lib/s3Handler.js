const AWS = require('aws-sdk');
const config = require('../config/aws');
const S3 = new AWS.S3(config);

/**
 * 
 * @param {Buffer<string>} fileBody File body to upload
 * @param {string} contentType      File content type (e.g. image/png)
 * @param {string} fileKey          File name to be created in the bucket (add directory name if needed)
 * @returns {string}                Return the file URL
 */
module.exports.uploadFile = (fileBody, contentType, fileKey) => {
    return S3.upload({
        Bucket: '',
        ACL: 'public-read',
        Key: fileKey,
        Body: fileBody,
        ContentType: contentType
    }).promise().then((response) => response.Location);
};