const FAQModel = require("../models/faqModel");
const commonFunc = require("../helper/commonFunction")
const { commonResponse: response } = require('../helper/commonResponseHandler');
const { ErrorMessage } = require('../helper/message');
const { SuccessMessage } = require('../helper/message');
const { ErrorCode } = require('../helper/statusCode');
const { SuccessCode } = require('../helper/statusCode');

module.exports = {

    /**
     * Function Name : addFaq
     * Description   : addFaq in faq management
     *
     * @return response
    */
    addFaq: (req, res) => {
        try {
            FAQModel.findOne({ question: req.body.question, status: { $ne: "DELETE" } }, (findErr, findRes) => {
                if (findErr) {
                    response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                }
                else if (findRes) {
                    response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.QUESTION_EXIST);
                }
                else {
                    new FAQModel(req.body).save((err, saveResult) => {
                        if (err) {
                            response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                        }
                        else {
                            response(res, SuccessCode.SUCCESS, saveResult, SuccessMessage.FAQ_ADDED);
                        }
                    })
                }
            })
        }
        catch (error) {
            console.log(error)
            response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
        }
    },

    /**
     * Function Name : viewFaq
     * Description   : viewFaq in faq management
     *
     * @return response
    */
    viewFaq: (req, res) => {
        try {
            FAQModel.findOne({ _id: req.params.id, status: { $ne: "DELETE" } }, (findErr, findResult) => {
                if (findErr) {
                    response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                }
                else if (!findResult) {
                    response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
                }
                else {
                    response(res, SuccessCode.SUCCESS, findResult, SuccessMessage.DETAIL_GET);
                }
            })
        }
        catch (error) {
            response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
        }

    },

    /**
    * Function Name : editFaq
    * Description   : editFaq in faq management
    *
    * @return response
   */
    editFaq: (req, res) => {
        try {
            if (!req.body.faqId) {
                response(res, ErrorCode.BAD_REQUEST, [], ErrorMessage.FIELD_REQUIRED);
            }
            else {
                FAQModel.findOne({ _id: req.body.faqId, status: { $ne: "DELETE" } }, (err, findRes) => {
                    if (err) {
                        response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                    }
                    else if (!findRes) {
                        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
                    }
                    else {
                        let obj = {}
                        if (req.body.question) {
                            obj.question = req.body.question
                        }
                        if (req.body.answer) {
                            obj.answer = req.body.answer
                        }
                        let query = { _id: findRes.id, status: { $ne: "DELETE" } }
                        FAQModel.findByIdAndUpdate(query, { $set: obj }, { new: true }, (updateErr, updateRes) => {
                            if (updateErr) {
                                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                            }
                            else {
                                response(res, SuccessCode.SUCCESS, updateRes, SuccessMessage.UPDATE_SUCCESS);
                            }
                        })
                    }
                })
            }
        }
        catch (error) {
            response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
        }

    },

    /**
   * Function Name :deleteFaq
   * Description   :deleteFaq in faq management
   *
   * @return response
  */
    deleteFaq: (req, res) => {
        try {
            if (!req.body.faqId) {
                response(res, ErrorCode.BAD_REQUEST, [], ErrorMessage.FIELD_REQUIRED);
            }

            else {
                FAQModel.findOne({ _id: req.body.faqId, status: { $ne: "DELETE" } }, (findErr, findResult) => {
                    if (findErr) {
                        response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                    }
                    else if (!findResult) {
                        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
                    }
                    else {
                        let query = { _id: findResult._id }
                        FAQModel.findByIdAndUpdate(query, { $set: { status: "DELETE" } }, { new: true }, (err, findResult2) => {
                            if (err) {
                                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                            }
                            else {
                                response(res, SuccessCode.SUCCESS, findResult2, SuccessMessage.DELETE_SUCCESS);
                            }
                        })
                    }
                })

            }
        }
        catch (error) {
            response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
        }
    },

    /**
    * Function Name : faqList
    * Description   : faqList in faq management
    *
    * @return response
   */
    faqList: (req, res) => {
        try {
            let query = { status: { $ne: "DELETE" } };
            if (req.body.status) {
                query.status = req.body.status
            }
            if (req.query.fromDate && !req.query.toDate) {
                query.createdAt = { $gte: req.query.fromDate };
            }
            if (!req.query.fromDate && req.query.toDate) {
                query.createdAt = { $lte: req.body.toDate };
            }
            if (req.query.fromDate && req.query.toDate) {
                query.$and = [
                    { createdAt: { $gte: req.query.fromDate } },
                    { createdAt: { $lte: req.query.toDate } },
                ]
            }
            var options = {
                page: parseInt(req.body.page) || 1,
                limit: parseInt(req.body.limit) || 10,
                sort: { createdAt: -1 }
            };
            FAQModel.paginate(query, options, (err, result) => {
                if (err) {
                    console.log(err);
                    response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                }
                else if (result.docs.length == false) {
                    response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
                }
                else {
                    response(res, SuccessCode.SUCCESS, result, SuccessMessage.DATA_FOUND);
                }
            });
        }
        catch (error) {
            console.log(error)
            response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
        }
    },
}
