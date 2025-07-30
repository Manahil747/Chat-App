const responseModel = ({ statusCode, success, data, message, documents = null }) => {
    return {
        statusCode,
        success,
        data,
        message,
        documents
    };
};
module.exports=responseModel;