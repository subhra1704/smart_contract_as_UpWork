/** 
 * @description All the Error messages that needed to be sent to Admin
 * @type {Object}
*/
module.exports.ErrorCode = Object.freeze({
    'BAD_REQUEST': 400,
    'UNAUTHORIZED': 401,
    'INTERNAL_ERROR': 500,
    'SOMETHING_WRONG': 501,
    'INVALID_CREDENTIAL':402,
    'FORBIDDEN':403,
    'NOT_FOUND':404,
    'VALIDATION_FAILED':422,
    'ALREADY_EXIST':409,
    'NOT_ALLOWED':405
});

/** 
 * @description All the Success messages that needed to be sent to Admin
 * @type {Object}
*/
module.exports.SuccessCode = Object.freeze({
    'SUCCESS': 200,
    'ADVERTISEMENT': 201,
});