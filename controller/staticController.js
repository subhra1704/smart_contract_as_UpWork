const staticModel = require('../models/staticModel');
const commonFunction = require('../helper/commonFunction')
const { commonResponse: response } = require('../helper/commonResponseHandler');
const { ErrorMessage } = require('../helper/message');
const { SuccessMessage } = require('../helper/message');
const { ErrorCode } = require('../helper/statusCode');
const { SuccessCode } = require('../helper/statusCode');

module.exports = {

    /**
     * Function Name : edit Static Page
     * Description   : edit Static Page in static page management
     *
     * @return response
    */
    editStaticPage: async (req, res) => {
        try {
            var findResult = await staticModel.findOne({ _id: req.body._id, status: "ACTIVE" })
            if (!findResult) {
                response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
            }
            else {
                if (findResult.type == "AboutUs") {
                    if (req.body.image) {
                        req.body.image = await convertImage(req.body.image);
                    }
                    var updateRes = await staticModel.findByIdAndUpdate({ _id: findResult._id }, { $set: req.body }, { new: true })
                    response(res, SuccessCode.SUCCESS, updateRes, SuccessMessage.UPDATE_SUCCESS);
                } else {
                    var success = await staticModel.findByIdAndUpdate({ _id: findResult._id }, { title: req.body.title, description: req.body.description }, { new: true })
                    response(res, SuccessCode.SUCCESS, success, SuccessMessage.UPDATE_SUCCESS);
                }
            }
        }
        catch (error) {
            response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
        }
    },

    /**
     * Function Name : view Static Page
     * Description   : view Static Page in static page management
     *
     * @return response
    */
    viewStaticPage: (req, res) => {
        try {
            staticModel.findOne({ type: req.query.type, status: "ACTIVE" }, (err, staticResult) => {
                if (err) {
                    response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                }
                else if (!staticResult) {
                    response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
                }
                else {
                    response(res, SuccessCode.SUCCESS, staticResult, SuccessMessage.DETAIL_GET);
                }
            })
        }
        catch (error) {
            response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
        }

    },
    
    /**
     * Function Name :static Page List
     * Description   : static PageList in static page management
     *
     * @return response
    */
    staticPageList: (req, res) => {
        try {
            staticModel.find({ status: "ACTIVE" }, (err, result) => {
                if (err) {
                    response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                }
                else if (result.length == 0) {
                    response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
                }
                else {
                    response(res, SuccessCode.SUCCESS, result, SuccessMessage.DATA_FOUND);
                }
            })
        }
        catch (error) {
            response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
        }
    }
}
/////////////////////// Convert  Image //////////////////////////////////
function convertImage(req) {
    return new Promise((resolve, reject) => {
        commonFunction.uploadImage(req, (error, upload) => {
            if (error) {
                console.log("Error uploading image")
            }
            else {
                resolve(upload)
            }
        })
    })
}
////////////////////// End Of Function Convert Image///////////////////////////
