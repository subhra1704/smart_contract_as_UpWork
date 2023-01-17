const userModel = require('../models/userModel')
const { commonResponse: response } = require('../helper/commonResponseHandler');
const { ErrorMessage } = require('../helper/message');
const { SuccessMessage } = require('../helper/message');
const { ErrorCode } = require('../helper/statusCode');
const { SuccessCode } = require('../helper/statusCode');
const bcrypt = require('bcrypt-nodejs');
const commonFunction = require('../helper/commonFunction');


module.exports = {

  addValidator: async (req, res) => {
    try {
      userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" }, (adminError, adminResult) => {
        console.log("===166==>>", adminError, adminResult);

        if (adminError) {
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR)
        } else if (!adminResult) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
        } else {
          var query = { $and: [{ status: { $ne: "DELETE" } }, { $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] }] };
          userModel.findOne(query, async (queryErr, queryRes) => {
            if (queryErr) {
              response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
            } else if (queryRes) {
              if (queryRes.email == req.body.email) {
                response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.EMAIL_EXIST);
              } else {
                response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.MOBILE_EXIST);
              }
            } else {
              req.body.permissions = {
                validatorManagement: req.body.validatorManagement,
                dashboardManagement: req.body.dashboardManagement,
                clientManagement: req.body.clientManagement,
                contractManagement: req.body.contractManagement,
                staticContentManagement: req.body.staticContentManagement,
              };
              var password = req.body.password;
              var link = `https://service-platform.mobiloitte.com/reset-password`;
              req.body.password = bcrypt.hashSync(req.body.password);
              req.body.userType = "VALIDATOR";
              
              await commonFunction.sendEmailToNotify(req.body.email, req.body.firstName, password)
              if (req.body.long && req.body.lat) {
                req.body.location = {
                  type: "Point",
                  coordinates: [
                    parseFloat(req.body.long),
                    parseFloat(req.body.lat),
                  ],
                };
              } else {
                req.body.location = {
                  type: "Point",
                  coordinates: ["25.1337", "82.5644"],
                };
              }
              new userModel(req.body).save((error, saved) => {
                if (error) {
                  response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                } else {
                  response(res, SuccessCode.SUCCESS, saved, SuccessMessage.VALIDATOR_ADDED);
                }
              });
            }
          });
        }
      })
    } catch (error) {
      console.log(error);
      response(res, ErrorCode.SOMETHING_WRONG, error, ErrorMessage.SOMETHING_WRONG);
    }
  },

  viewValidator: async (req, res) => {
    try {

      userModel.findOne({ _id: req.query._id, status: { $ne: "DELETE" }, userType: { $in: ["VALIDATOR", "ADMIN"] } },
        (validatErr, validateRes) => {
          if (validatErr) {
            console.log("===140===>>>", validatErr);
            response(
              res,
              ErrorCode.INTERNAL_ERROR,
              [],
              ErrorMessage.INTERNAL_ERROR
            );
          } else {
            response(
              res,
              SuccessCode.SUCCESS,
              validateRes,
              SuccessMessage.DETAIL_GET
            );
          }
        }
      );
    } catch (error) {
      response(
        res,
        ErrorCode.SOMETHING_WRONG,
        [],
        ErrorMessage.SOMETHING_WRONG
      );
    }
  },

  editValidator: (req, res) => {
    try {
      function update() {
        userModel.findByIdAndUpdate({ _id: req.body._id, status: { $ne: "DELETE" }, userType: "VALIDATOR" }, { $set: req.body }, { new: true }, (updateErr, updateRes) => {
          if (updateErr) {
            response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
          } else {
            response(res, SuccessCode.SUCCESS, updateRes, SuccessMessage.UPDATE_SUCCESS);
          }
        }
        );
      }
      userModel.findOne({
        _id: req.userId,
        status: { $ne: "DELETE" },
        userType: { $in: ["USER", "VALIDATOR"] },
      },
        (error1, adminRes) => {
          if (error1) {
            response(
              res,
              ErrorCode.INTERNAL_ERROR,
              [],
              ErrorMessage.INTERNAL_ERROR
            );
          } else if (!adminRes) {
            response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
          } else {
            userModel.findOne(
              {
                _id: req.body._id,
                status: { $ne: "DELETE" },
                userType: "VALIDATOR",
              },
              (error, result) => {
                if (error) {
                  response(
                    res,
                    ErrorCode.INTERNAL_ERROR,
                    [],
                    ErrorMessage.INTERNAL_ERROR
                  );
                } else if (!result) {
                  response(
                    res,
                    ErrorCode.NOT_FOUND,
                    [],
                    ErrorMessage.NOT_FOUND
                  );
                } else {
                  if (req.body.subAdminName) {
                    req.body.name = req.body.subAdminName;
                  }
                  var permission = {};
                  if (req.body.validatorManagement) {
                    permission.validatorManagement = req.body.validatorManagement;
                  }
                  if (req.body.dashboardManagement) {
                    permission.dashboardManagement =
                      req.body.dashboardManagement;
                  }
                  if (req.body.clientManagement) {
                    permission.clientManagement =
                      req.body.clientManagement;
                  }
                  if (req.body.contractManagement) {
                    permission.contractManagement = req.body.contractManagement;
                  }
                  if (req.body.notificationManagement) {
                    permission.notificationManagement =
                      req.body.notificationManagement;
                  }
                  if (req.body.staticContentManagement) {
                    permission.staticContentManagement =
                      req.body.staticContentManagement;
                  }
                  req.body.permissions = permission;
                  var query = {};
                  if (req.body.email && !req.body.mobileNumber) {
                    query = {
                      email: req.body.email,
                      status: { $ne: "DELETE" },
                      _id: { $ne: result._id },
                    };
                    userModel.findOne(query, (vendorErr, vendorRes) => {
                      if (vendorErr) {
                        response(
                          res,
                          ErrorCode.INTERNAL_ERROR,
                          [],
                          ErrorMessage.INTERNAL_ERROR
                        );
                      } else if (vendorRes) {
                        response(
                          res,
                          ErrorCode.ALREADY_EXIST,
                          [],
                          ErrorMessage.EMAIL_EXIST
                        );
                      } else {
                        update();
                      }
                    });
                  } else if (!req.body.email && req.body.mobileNumber) {
                    query = {
                      mobileNumber: req.body.mobileNumber,
                      status: { $ne: "DELETE" },
                      _id: { $ne: result._id },
                    };
                    userModel.findOne(query, (vendorErr, vendorRes) => {
                      if (vendorErr) {
                        response(
                          res,
                          ErrorCode.INTERNAL_ERROR,
                          [],
                          ErrorMessage.INTERNAL_ERROR
                        );
                      } else if (vendorRes) {
                        response(
                          res,
                          ErrorCode.ALREADY_EXIST,
                          [],
                          ErrorMessage.MOBILE_EXIST
                        );
                      } else {
                        update();
                      }
                    });
                  } else if (req.body.email && req.body.mobileNumber) {
                    query = {
                      $and: [
                        {
                          $or: [
                            { email: req.body.email },
                            { mobileNumber: req.body.mobileNumber },
                          ],
                        },
                        { status: { $ne: "DELETE" } },
                        { _id: { $ne: result._id } },
                      ],
                    };
                    userModel.findOne(query, (vendorErr, vendorRes) => {
                      if (vendorErr) {
                        response(
                          res,
                          ErrorCode.INTERNAL_ERROR,
                          [],
                          ErrorMessage.INTERNAL_ERROR
                        );
                      } else if (vendorRes) {
                        if (vendorRes.email == req.body.email) {
                          response(
                            res,
                            ErrorCode.ALREADY_EXIST,
                            [],
                            ErrorMessage.EMAIL_EXIST
                          );
                        } else {
                          response(
                            res,
                            ErrorCode.ALREADY_EXIST,
                            [],
                            ErrorMessage.MOBILE_EXIST
                          );
                        }
                      } else {
                        update();
                      }
                    });
                  } else {
                    update();
                  }
                }
              }
            );
          }
        }
      );
    } catch (error) {
      response(
        res,
        ErrorCode.SOMETHING_WRONG,
        [],
        ErrorMessage.SOMETHING_WRONG
      );
    }
  },


  deleteValidator: (req, res) => {
    try {
      userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["ADMIN", "VALIDATOR"] } }, (adErr, adRes) => {
        if (adErr) {
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR)
        } else if (!adRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          userModel.findOne(
            { _id: req.query.validatorId, status: { $ne: "DELETE" } },
            (validateErr, validateRes) => {
              if (validateErr) {
                response(
                  res,
                  ErrorCode.INTERNAL_ERROR,
                  [],
                  ErrorMessage.INTERNAL_ERROR
                );
              } else if (!validateRes) {
                response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
              } else {
                userModel.findOneAndUpdate(
                  { _id: validateRes._id },
                  { $set: { status: "DELETE" } },
                  { new: true },
                  (updateErr, updateRes) => {
                    if (updateErr) {
                      response(
                        res,
                        ErrorCode.INTERNAL_ERROR,
                        [],
                        ErrorMessage.INTERNAL_ERROR
                      );
                    } else {
                      response(
                        res,
                        SuccessCode,
                        updateRes,
                        SuccessMessage.DELETE_SUCCESS
                      );
                    }
                  }
                );
              }
            }
          );

        }
      })
    } catch (error) {
      response(
        res,
        ErrorCode.SOMETHING_WRONG,
        [],
        ErrorMessage.SOMETHING_WRONG
      );
    }
  },

  listValidator: async (req, res) => {
    try {
      var query = ({ userType: "VALIDATOR", status: { $ne: "DELETE" } })
      if (req.body.status) {
        query.status = req.body.status
      }
      if (req.body.search) {
        query.$or = [
          { email: { $regex: req.body.search, $options: 'i' } },
          { firstName: { $regex: req.body.search, $options: 'i' } },
        ]
      }
      if (req.body.fromDate && !req.body.toDate) {
        query.createdAt = { $gte: req.body.fromDate };
      }
      if (!req.body.fromDate && req.body.toDate) {
        query.createdAt = { $lte: req.body.toDate };
      }
      if (req.body.fromDate && req.body.toDate) {
        query.$and = [
          { createdAt: { $gte: req.body.fromDate } },
          { createdAt: { $lte: req.body.toDate } },
        ]
      }
      var options = {
        page: parseInt(req.body.page) || 1,
        limit: parseInt(req.body.limit) || 15,
        sort: { createdAt: -1 },
      };
      var result = await userModel.paginate(query, options)
      if (result.docs.length == 0) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
      } else {
        response(res, SuccessCode.SUCCESS, result, SuccessMessage.DETAIL_GET);
      }
    } catch (error) {
      console.log("====537", error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)

    }
  },



  blockUnblockValidator: (req, res) => {
    try {
      userModel.findOne(
        { _id: req.userId, status: { $ne: "DELETE" }, userType: "ADMIN" },
        (adminErr, adminRes) => {
          if (adminErr) {
            console.log("======1562", adminRes);
            response(
              res,
              ErrorCode.INTERNAL_ERROR,
              [],
              ErrorMessage.INTERNAL_ERROR
            );
          } else if (!adminRes) {
            console.log("====2804====", adminRes);
            response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
          } else {
            userModel.findOne({ _id: req.query.validatorId }, (err, result) => {
              if (err) {
                console.log("==2800", err);
                response(
                  res,
                  ErrorCode.INTERNAL_ERROR,
                  [],
                  ErrorMessage.INTERNAL_ERROR
                );
              } else if (!result) {
                console.log("===2817====", result);
                response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
              } else {
                if (result.status == "ACTIVE") {
                  userModel.findOneAndUpdate(
                    { _id: result._id },
                    { $set: { status: "BLOCK" } },
                    { new: true },
                    (updateErr, updateResult) => {
                      if (updateErr) {
                        console.log("===2809===", updateErr);
                        response(
                          res,
                          ErrorCode.INTERNAL_ERROR,
                          [],
                          ErrorMessage.INTERNAL_ERROR
                        );
                      } else {
                        response(
                          res,
                          SuccessCode.SUCCESS,
                          updateResult,
                          SuccessMessage.BLOCK_SUCCESS
                        );
                      }
                    }
                  );
                } else {
                  userModel.findOneAndUpdate(
                    { _id: result._id },
                    { $set: { status: "ACTIVE" } },
                    { new: true },
                    (updateErr, updateResult) => {
                      if (updateErr) {
                        console.log("===2819===", updateErr);
                        response(
                          res,
                          ErrorCode.INTERNAL_ERROR,
                          [],
                          ErrorMessage.INTERNAL_ERROR
                        );
                      } else {
                        response(
                          res,
                          SuccessCode.SUCCESS,
                          updateResult,
                          SuccessMessage.UNBLOCK_SUCCESS
                        );
                      }
                    }
                  );
                }
              }
            });
          }
        }
      );
    } catch (error) {
      response(
        res,
        ErrorCode.SOMETHING_WRONG,
        [],
        ErrorMessage.SOMETHING_WRONG
      );
    }
  }
}
