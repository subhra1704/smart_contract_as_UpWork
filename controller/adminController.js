const crypto = require("crypto");
const express = require("express");
const userModel = require("../models/userModel");
const notificationModel = require("../models/notificationModel");
const faqModel = require("../models/faqModel");
const contractModel = require("../models/contractModel");
const planModel = require("../models/planModel");
const subscriptionModel = require("../models/subscriptionModel");
const transactionModel = require("../models/transactionModel")
const contractShareModel = require("../models/contractShareModel");
const commonFunction = require("../helper/commonFunction");
const { commonResponse: response } = require("../helper/commonResponseHandler");
const { ErrorMessage } = require("../helper/message");
const { SuccessMessage } = require("../helper/message");
const { ErrorCode } = require("../helper/statusCode");
const { SuccessCode } = require("../helper/statusCode");
const multiparty = require('multiparty');
const cloudinary = require("cloudinary");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
// const hash = crypto.createHash('sha256');
// const hash = crypto.createHash('sha256');
const jsonexport = require('jsonexport');
const fs = require('fs');

const sha256 = require("sha256");
const milestoneModel = require("../models/milestoneModel");

module.exports = {

  login: async (req, res) => {
    try {
      var userData = await userModel.findOne({ email: req.body.email, status: "ACTIVE", userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] } },)
      if (!userData) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      } else {
        const check = bcrypt.compareSync(req.body.password, userData.password);
        if (check) {
          var token = jwt.sign({ id: userData._id, iat: Math.floor(Date.now() / 1000) - 30 }, "smart-contract-as-service-plateform", { expiresIn: "24h" });
          var hash = sha256("userData.name");
          let result = {
            userId: userData._id,
            token: token,
            hash: hash,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            userType: userData.userType,
            password: userData.password,
            mobileNumber: userData.mobileNumber,
            permissions: userData.permissions,
          };
          response(res, SuccessCode.SUCCESS, result, SuccessMessage.LOGIN_SUCCESS);
        } else {
          response(res, ErrorCode.INVALID_CREDENTIAL, [], ErrorMessage.INVALID_CREDENTIAL);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  resetPassword: async (req, res) => {
    try {
      var result = await userModel.findOne({ email: req.body.email, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, },)
      if (!result) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      } else {
        req.body.password = bcrypt.hashSync(req.body.newPassword);
        var confirmPassword = bcrypt.hashSync(req.body.confirmPassword);
        var check = bcrypt.compareSync(req.body.newPassword, confirmPassword);
        if (!check) {
          response(res, ErrorCode.INVALID_CREDENTIAL, [], ErrorMessage.NOT_MATCH);
        } else {
          var updateResult = await userModel.findOneAndUpdate({ _id: result._id }, { $set: { password: confirmPassword } }, { new: true },)
          response(res, SuccessCode.SUCCESS, [], SuccessMessage.PASSWORD_UPDATE)
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  forgotPassword: async (req, res) => {
    try {
      var result = await userModel.findOne({ email: req.body.email, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, },)
      if (!result) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_REGISTERED);
      } else {
        var otp3 = commonFunction.getOTP();
        var otpTime4 = new Date().getTime();
        var emailRes = await commonFunction.sendMailOtp(result.email, result.firstName, otp3)
        var otpUpdate = await userModel.findOneAndUpdate({ email: req.body.email, status: { $ne: "DELETE" }, }, { $set: { otp: otp3, otpTime: otpTime4 } }, { new: true },)
        response(res, SuccessCode.SUCCESS, otpUpdate, SuccessMessage.OTP_SEND);
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  editProfile: async (req, res) => {
    try {
      async function update() {
        var updateResult = await userModel.findByIdAndUpdate({ _id: req.userId, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, status: "ACTIVE" }, { $set: req.body }, { new: true })
        response(res, SuccessCode.SUCCESS, updateResult, SuccessMessage.UPDATE_SUCCESS);
      }
      var userResult = await userModel.findOne({ _id: req.userId, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, status: "ACTIVE" },)
      if (!userResult) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      }
      else {
        if (req.body.profilePic) {
          req.body.profilePic = await convertImage(req.body.profilePic);
        }
        if (req.body.email && !req.body.mobileNumber) {
          let query = { email: req.body.email, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, status: { $ne: "DELETE" }, _id: { $ne: userResult._id } }
          var result = await userModel.findOne(query)
          if (result) {
            response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.EMAIL_EXIST);
          }
          else {
            update();
          }
        } else if (!req.body.email && req.body.mobileNumber) {
          let query = { mobileNumber: req.body.mobileNumber, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, status: { $ne: "DELETE" }, _id: { $ne: userResult._id } }
          var result2 = await userModel.findOne(query)
          if (result2) {
            response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.MOBILE_EXIST);
          }
          else {
            update();
          }
        } else if (req.body.email && req.body.mobileNumber) {
          let query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] }, { userType: "ADMIN" }, { status: { $ne: "DELETE" } }, { _id: { $ne: userResult._id } }] }
          var result3 = await userModel.findOne(query)
          if (result3.email == req.body.email) {
            response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.EMAIL_EXIST);
          }
          else {
            response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.MOBILE_EXIST);
          }
        }
        else {
          update();
        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  getProfile: async (req, res) => {
    try {
      var userData = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] } })
      if (!userData) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      }
      else {
        response(res, SuccessCode.SUCCESS, userData, SuccessMessage.DETAIL_GET);
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }

  },

  viewUser: async (req, res) => {
    try {
      var adminRes = await userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, })
      if (!adminRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
      } else {
        var userResult = await userModel.findOne({ _id: req.body.userId, status: { $in: ["ACTIVE", "BLOCK"] }, })
        if (!userResult) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, [userResult], SuccessMessage.DATA_FOUND);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  editUser: async (req, res) => {
    try {
      var adminRes = await userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN", "INTERNAL_INTERNAL_VALIDATOR"] }, })
      if (!adminRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
      } else {
        let query = { $and: [{ _id: req.body.userId }, { status: { $in: ["ACTIVE", "BLOCK"] } }, { userType: "USER" },], };
        var subadmin = await userModel.findOne(query)
        if (!subadmin) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          if (req.body.email && !req.body.mobileNumber) {
            let query1 = { email: req.body.email, status: { $in: ["ACTIVE", "BLOCK"] }, _id: { $ne: subadmin._id }, };
            var result = await userModel.findOne(query1)
            if (result) {
              response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.EMAIL_EXIST);
            } else {
              if (req.body.image) {
                req.body["profilePic"] = await convertImage(req.body.image);
              }
              var success = await userModel.findByIdAndUpdate({ _id: subadmin._id }, { $set: req.body }, { new: true })
              response(res, SuccessCode.SUCCESS, success, SuccessMessage.UPDATE_SUCCESS);
            }
          } else if (!req.body.email && req.body.mobileNumber) {
            let query1 = { mobileNumber: req.body.mobileNumber, status: { $in: ["ACTIVE", "BLOCK"] }, _id: { $ne: subadmin._id }, };
            var result = await userModel.findOne(query1)
            if (result) {
              response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.MOBILE_EXIST);
            } else {
              if (req.body.image) {
                req.body["profilePic"] = await convertImage(req.body.image);
              }
              var success1 = await userModel.findByIdAndUpdate({ _id: subadmin._id }, { $set: req.body }, { new: true },)
              response(res, SuccessCode.SUCCESS, success1, SuccessMessage.UPDATE_SUCCESS)
            }
          } else if (req.body.email && req.body.mobileNumber) {
            let query1 = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },], }, { status: { $in: ["ACTIVE", "BLOCK"] } }, { _id: { $ne: subadmin._id } },], };
            var result = await userModel.findOne(query1)
            if (result.email == req.body.email) {
              response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.EMAIL_EXIST);
            } else {
              response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.MOBILE_EXIST);
            }
          }
          else {
            if (req.body.image) {
              req.body["profilePic"] = await convertImage(req.body.image);
            }
            var success = await userModel.findByIdAndUpdate({ _id: subadmin._id }, { $set: req.body }, { new: true })
            response(res, SuccessCode.SUCCESS, success, SuccessMessage.UPDATE_SUCCESS);
          }
          var success = await userModel.findByIdAndUpdate({ _id: subadmin._id }, { $set: req.body }, { new: true })
          response(res, SuccessCode.SUCCESS, success, SuccessMessage.UPDATE_SUCCESS);
        }
      }

    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
   * Function Name :userList
   * Description   :Adding customers via admin panel
   *
   * @return response
   */
  userList: (req, res) => {
    try {
      userModel.findOne({ _id: req.userId, userType: "ADMIN" }, (adminErr, adminRes) => {
        if (adminErr) {
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
        } else if (!adminRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          var query = { userType: { $in: ["FREELANCER", "COMPANY"] }, otpVerification: true, status: { $in: ["ACTIVE", "BLOCK"] }, };
          if (req.body.type) {
            query = {
              userType: { $regex: req.body.type, $options: "i" },
            };
          }
          if (req.body.search) {
            query = {
              userName: { $regex: req.body.search, $options: "i" },
              email: { $regex: req.body.search, $options: "i" },
            };
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
              {
                createdAt: {
                  $lte: req.body.toDate,
                },
              },
            ];
          }
          var limit = parseInt(req.body.limit);
          var options = {
            page: req.body.page || 1,
            limit: limit || 15,
            sort: { createdAt: -1 },
          };
          userModel.paginate(query, options, (err, result) => {
            if (err) {
              response(
                res,
                ErrorCode.INTERNAL_ERROR,
                [],
                ErrorMessage.INTERNAL_ERROR
              );
            } else if (result.docs.length == 0) {
              response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
            } else {
              response(res, SuccessCode.SUCCESS, result, SuccessMessage.DETAIL_GET);
            }
          });
        }
      }
      );
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
  * Function Name :blockUnblockUser
  * Description   :blockUnblockUser via admin panel
  *
  * @return response
  */

  blockUnblockUser: async (req, res) => {
    try {
      var adminData = await userModel.findOne({ _id: req.userId, userType: { $in: ["SUBADMIN", "ADMIN"] } })
      if (!adminData) {
        response(res, ErrorCode.NOT_FOUND, [], "Unauthorized user.")
      }
      else {
        var userData = await userModel.findOne({ _id: req.query._id, userType: { $in: ["FREELANCER", "VALIDATOR", "COMPANY"] } })
        if (!userData) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
        } else {

          if (userData.status == "ACTIVE") {
            var result1 = await userModel.findOneAndUpdate({ _id: userData._id }, { $set: { status: "BLOCK" } }, { new: true })
            let subject = 'Your SMART TECH Account Block Information.';
            let msg = `Dear ${userData.firstName}
                       Your account ${userData.email} has been blocked due to security reasons. Please contact your admin to unblock your account. 
                       For any support/ Queries, Kindly contact support@smartech.com
                      Best Regards,
                      SMART TECH  Team!`
            await commonFunction.sendEmailToNotify(userData.email, subject, msg);
            response(res, SuccessCode.SUCCESS, result1, SuccessMessage.BLOCK_SUCCESS);

          } else if (userData.status == "BLOCK") {
            var result = await userModel.findOneAndUpdate({ _id: userData._id }, { $set: { status: "ACTIVE" } }, { new: true })
            let subject = 'Your SMART TECH Account UnBlock Information.';
            let msg = `Dear ${userData.firstName}
                       Your account ${userData.email} has been unblocked. 
                       For any support/ Queries, Kindly contact support@smarttech.com
                      Best Regards,
                      SMART TECH  Team!`
            await commonFunction.sendEmailToNotify(userData.email, subject, msg);
            response(res, SuccessCode.SUCCESS, result, SuccessMessage.UNBLOCK_SUCCESS);
          }
        }
      }
    } catch (error) {
      console.log(error)
      return res.send({ responseCode: 501, responseMessage: "something went wrong" });
    }
  },


  editSubscription: (req, res) => {
    try {
      subscriptionModel.findOneAndUpdate({ _id: req.body.subscriptionId, status: { $ne: "DELETE" } }, { $set: req.body }, { new: true }, (error, planData) => {
        if (error) {
          response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.INTERNAL_ERROR);
        }
        else if (!planData) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        }
        else {
          response(res, SuccessCode.SUCCESS, planData, SuccessMessage.UPDATE_SUCCESS);

        }
      })
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }

  },

  /**
  * Function Name :viewPlan
  * Description   : viewPlan in Plan management
  *
  * @return response
  */
  viewSubscription: (req, res) => {
    try {
      subscriptionModel.findOne({ _id: req.params.subscriptionId, status: { $ne: "DELETE" } }, (err, result) => {
        if (err) {
          response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.INTERNAL_ERROR);
        }
        else if (!result) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        }
        else {
          response(res, SuccessCode.SUCCESS, result, SuccessMessage.DETAIL_GET);
        }
      })
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
  * Function Name :deletePlan
  * Description   : deletePlan in plan management
  *
  * @return response
  */

  deleteSubscription: (req, res) => {
    try {
      subscriptionModel.findOne({ _id: req.body.subscriptionId, status: { $ne: "DELETE" } }, (err, result) => {
        if (err) {
          response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.INTERNAL_ERROR);
        }
        else if (!result) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        }
        else {
          subscriptionModel.findOneAndUpdate({ _id: req.body.planId, status: { $ne: "DELETE" } }, { $set: { status: "DELETE" } }, { new: true }, (updateErr, updateResult) => {
            if (updateErr) {
              response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.INTERNAL_ERROR);
            }
            else if (!updateResult) {
              response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.UPDATE_NOT);
            }
            else {
              response(res, SuccessCode.SUCCESS, updateResult, SuccessMessage.DELETE_SUCCESS);
            }
          })
        }
      })
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
  * Function Name :subscriptionList
  * Description   : subscriptionList in plan management
  *
  * @return response
  */
  subscriptionList: (req, res) => {
    try {
      var query = { status: { $ne: "DELETE" } };

      if (req.body.search) {
        query.planName = new RegExp('^' + req.body.search, "i");
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
        limit: parseInt(req.body.limit) || 100,
        sort: { createdAt: -1 }
      };

      subscriptionModel.paginate(query, options, (err, result) => {
        if (err) {
          response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.INTERNAL_ERROR);
        }
        else if (result.docs.length == 0) {
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

  },



  addNotification: async (req, res) => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    today = dd + "/" + mm + "/" + yyyy;
    var time = new Date().toString();
    var t = time.slice(16, 24);
    req.body.date = `${today} ${t}`;
    try {
      var adminRes = await userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN", "VALIDATOR"] }, }, (adminErr, adminRes) => {
        if (adminErr) {
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
        } else if (!adminRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          notificationModel.findOne({ title: req.body.title, status: { $ne: "DELETE" } }, async (err, result) => {
            if (err) {
              response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
            } else if (result) {
              response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.NOTIFICATION_EXIST);
            } else {
              new notificationModel(req.body).save((saveErr, saveResult) => {
                if (saveErr) {
                  response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                } else {
                  response(res, SuccessCode.SUCCES, saveResult, SuccessMessage.NOTIFICATION_ADD);
                }
              });
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

  viewNotification: (req, res) => {
    try {
      userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, },
        (adminErr, adminRes) => {
          if (adminErr) {
            response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
          } else if (!adminRes) {
            response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
          } else {
            notificationModel.findOne({ _id: req.params.notificationId, status: { $ne: "DELETE" } }, (findErr, findResult) => {
              if (findErr) {
                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
              } else if (!findResult) {
                response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
              } else {
                response(res, SuccessCode.SUCCESS, findResult, SuccessMessage.DETAIL_GET);
              }
            }
            );
          }
        }
      );
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  notificationList: async (req, res) => {
    try {
      var query = { status: { $in: ["ACTIVE", "BLOCK"] } };
      if (req.body.search) {
        query.$and = [
          { title: { $regex: req.body.search, $options: "i" } },
          { status: { $ne: "DELETE" } },
        ];
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
        ];
      }
      var limit = parseInt(req.body.limit);
      var options = {
        page: req.body.page || 1,
        limit: limit || 10,
        sort: { createdAt: -1 },
      };

      notificationModel.paginate(query, options, (err, result) => {
        if (err) {
          response(
            res,
            ErrorCode.INTERNAL_ERROR,
            [],
            ErrorMessage.INTERNAL_ERROR
          );
        } else if (result.docs.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, result, SuccessMessage.DETAIL_GET);
        }
      });
    } catch (error) {
      response(
        res,
        ErrorCode.SOMETHING_WRONG,
        [],
        ErrorMessage.SOMETHING_WRONG
      );
    }
  },

  deleteNotification: async (req, res) => {
    try {
      var adminRes = await userModel.findOne({
        _id: req.userId,
        status: { $ne: "DELETE" },
        userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] },
      });
      if (!adminRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
      } else {
        var data = await notificationModel.findOneAndUpdate(
          { _id: req.body.notificationId, status: { $ne: "DELETE" } },
          { $set: { status: "DELETE" } },
          { new: true }
        );
        if (data) {
          response(
            res,
            SuccessCode.SUCCESS,
            [data],
            SuccessMessage.DELETE_SUCCESS
          );
        } else if (!data) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        }
      }
    } catch (error) {
      response(
        res,
        ErrorCode.SOMETHING_WRONG,
        [],
        ErrorMessage.SOMETHING_WRONG
      );
    }
  },

  addFaq: async (req, res) => {
    try {
      userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, },
        (adminErr, adminRes) => {
          if (adminErr) {
            response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
          } else if (!adminRes) {
            response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
          } else {
            faqModel.findOne(
              { question: req.body.question, status: { $ne: "DELETE" } },
              (findErr, findRes) => {
                if (findErr) {
                  response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                } else if (findRes) {
                  response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.QUESTION_EXIST);
                } else {
                  new faqModel(req.body).save((err, saveResult) => {
                    if (err) {
                      response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                    } else {
                      response(res, SuccessCode.SUCCESS, saveResult, SuccessMessage.FAQ_ADDED);
                    }
                  });
                }
              }
            );
          }
        }
      );
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  viewFaq: (req, res) => {
    try {
      userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN", "INTERNAL_VALIDATOR"] }, },
        (adminErr, adminRes) => {
          if (adminErr) {
            response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
          } else if (!adminRes) {
            response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
          } else {
            faqModel.findOne({ _id: req.params.faqId, status: { $ne: "DELETE" } }, (findErr, findResult) => {
              if (findErr) {
                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
              } else if (!findResult) {
                response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
              } else {
                response(res, SuccessCode.SUCCESS, findResult, SuccessMessage.DETAIL_GET);
              }
            }
            );
          }
        }
      );
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  faqList: (req, res) => {
    try {
      let query = { status: "ACTIVE" };

      var options = {
        page: req.body.page || 1,
        limit: req.body.limit || 10,
        sort: { createdAt: -1 }
      };
      faqModel.paginate(query, options, (err, result) => {
        if (err) {
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
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },



  completeMilestonelist: async (req, res) => {
    try {
      var milestoneRes = await milestoneModel.find({ "milestones.$.mileStoneStatus": "COMPLETE" })
      response(res, SuccessCode.DATA_FOUND, milestoneRes, SuccessMessage.DATA_FOUND)
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }

  },


  transactionList: async (req, res) => {
    try {
      let admin = await userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["ADMIN"] }, })
      if (!admin) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.DATA_NOT_FOUND)
      }
      else {
        let query = {
          status: { $ne: "DELETE" }, paymentStatus: "SUCCESS",
        };
        let match = {}
        if (req.body.search) {
          match.$or = [{ email: { $regex: req.body.search, $options: 'i' } }, { firstName: { $regex: req.body.search, $options: 'i' } }]
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
          ];
        }
        var limit = parseInt(req.body.limit);
        var options = {
          page: parseInt(req.body.page) || 1,
          limit: limit || 10,
          sort: { createdAt: -1 },
          populate: [{ path: "userId", select: "email firstName lastName", match }, { path: "subscriptionId", select: "planName" }]
        }
        let save = await transactionModel.paginate(query, options)
        if (save.docs.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        }
        else {
          response(res, SuccessCode.SUCCESS, save, SuccessMessage.DETAIL_GET)
        }
      }
    } catch (error) {
      console.log(error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }
  },

  viewTransaction: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var transRes = await transactionModel.findOne({ _id: req.query._id, status: "ACTIVE" })
        if (!transRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          response(res, SuccessCode.SUCCESS, transRes, SuccessMessage.DATA_FOUND)
        }
      }
    }
    catch {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  fundRequestList: async (req, res) => {
    try {
      var adminRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" })
      if (!adminRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
      } else {
        var milestoneRes = await milestoneModel.find({ mileStoneStatus: "COMPLETE" })
        if (!milestoneRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          response(res, SuccessCode.SUCCES, milestoneRes, "Request list fetch ")
        }
      }

    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  viewFundRequest: async (req, res) => {
    try {
      var adminRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" })
      if (!adminRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
      } else {
        var milestoneRes = await milestoneModel.find({ _id: req.body.milestoneId, mileStoneStatus: "COMPLETE" })
        if (!milestoneRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          response(res, SuccessCode.SUCCES, milestoneRes, "Request list fetch ")
        }
      }

    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },


  deleteAdmin: (req, res) => {
    try {
      userModel.deleteOne({ userType: "ADMIN" }, (err, result) => {
        if (err) {
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
            result,
            SuccessMessage.DELETE_SUCCESS
          );
        }
      });
    } catch (error) {
      response(
        res,
        ErrorCode.SOMETHING_WRONG,
        [],
        ErrorMessage.SOMETHING_WRONG
      );
    }
  },

  listContractForCompany: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        let query = { status: { $ne: "DELETE" } };
        if (req.query.userId) {
          query.userId = req.query.userId;
        }
        if (req.query.search) {
          query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ]
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
          sort: { createdAt: -1 },
          populate: "contractId validatorId"
        };
        contractModel.paginate(query, options, (err, result) => {
          if (err) {
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
    }
    catch (error) {
      console.log(error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },


  /**
  * Function Name : viewMilestone
  * Description   : viewMilestone of user
  *
  * @return response
  */
  listMilestoneForCompany: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var result = await contractModel.findOne({ _id: req.query._id, status: "ACTIVE" }).select("milestones").populate("contractId validatorId")
        if (!result) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          response(res, SuccessCode.SUCCESS, result, SuccessMessage.SUCCESS)
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },


  listContractForUser: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        let query = { status: { $ne: "DELETE" } };
        if (req.query.userId) {
          query.userId = req.query.userId;
        }
        if (req.query.search) {
          query.$or = [
            { email: { $regex: search, $options: 'i' } },
          ]
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
          sort: { createdAt: -1 },
          populate: "contractId"
        };
        contractShareModel.paginate(query, options, (err, result) => {
          if (err) {
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
    }
    catch (error) {
      console.log(error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },
  

  dashboard: async (req, res) => {
    try {
      var userRes = await userModel.count({ userType: "FREELANCER", status: "ACTIVE" })
      var allUserRes = await userModel.count({ userType: "FREELANCER" })
      var validatorRes = await userModel.count({ userType: "VALIDATOR", status: "ACTIVE" })
      var inactiveValidator = await userModel.count({ userType: "VALIDATOR" })

      var companyRes = await userModel.count({ userType: "COMPANY", status: "ACTIVE" })

      var finalRes = {
        totalActiveUser: userRes,
        alluser: allUserRes,
        totalValidator: inactiveValidator,
        totalCompany: companyRes,
        totalActiveValidator: validatorRes
      }
      response(res, SuccessCode.SUCCESS, finalRes, SuccessMessage.DATA_FOUND);

    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);

    }
  },

  /**
  * Function Name : listMilestone
  * Description   : listMilestone of user
  *
  * @return response
  */

  listMilestoneForUser: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        let query = { status: { $ne: "DELETE" } };
        if (req.query.contractId) {
          query.contractId = req.query.contractId;
        }
        if (req.query.search) {
          query.$or = [
            { email: { $regex: search, $options: 'i' } },
          ]
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
          sort: { createdAt: -1 },
          populate: "contractId"
        };
        contractShareModel.paginate(query, options, (err, result) => {
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
    }
    catch (error) {
      console.log(error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },



  viewparticularMilestone: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "ADMIN" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var transRes = await contractModel.findOne({ "milestones._id": req.query._id }).select({ milestones: { $elemMatch: { _id: req.query._id } } })
        if (!transRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          response(res, SuccessCode.SUCCESS, transRes, SuccessMessage.DATA_FOUND)
        }
      }
    }
    catch {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  ///// End of export///////////////
}
function convertDocument(array) {
  return new Promise((resolve, reject) => {
    commonFunction.multipleImageUploadCloudinary(array, (imageError, upload) => {
      if (imageError) {
        console.log("Error uploading images")
      }
      else {
        resolve(upload)
      }
    })
  })
}
function convertImage(req) {
  return new Promise((resolve, reject) => {
    commonFunction.uploadImage(req, (error, upload) => {
      if (error) {
        console.log("Error uploading image", error);
      } else {
        resolve(upload);
      }
    });
  });
}
function convertMultiImage(image) {
  return new Promise((resolve, reject) => {
    commonFunction.uploadMultipleImage(image, (error, upload) => {
      if (error) {
        console.log("Error uploading image");
      } else {
        var documentArray = [];
        upload.forEach((a) => documentArray.push(a));
        resolve(documentArray);
      }
    });
  });
}
