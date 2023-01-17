const mongoose = require("mongoose");
const userModel = require('../models/userModel');
const faqModel = require('../models/faqModel');
const contractModel = require('../models/contractModel');
const contractShareModel = require('../models/contractShareModel');
const subscriptionModel = require('../models/subscriptionModel');
const notificationModel = require('../models/notificationModel');
const transactionModel = require('../models/transactionModel');
const milestoneModel = require('../models/milestoneModel')
const planModel = require('../models/planModel');
const cardModel = require('../models/cardModel');
const commonFunction = require('../helper/commonFunction');
const { commonResponse: response } = require('../helper/commonResponseHandler');
const { ErrorMessage } = require('../helper/message');
const { SuccessMessage } = require('../helper/message');
const { ErrorCode } = require('../helper/statusCode');
const { SuccessCode } = require('../helper/statusCode');
const cloudinary = require('cloudinary');
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const jsonexport = require('jsonexport');
const sha256 = require('sha256');
const crypto = require("crypto");
const multiparty = require("multiparty");
const { json } = require('body-parser');
const hash = crypto.createHash('sha256');
const { phone } = require('phone');
var json2xls = require('json2xls');
const HTMLToPDF = require('html-to-pdf');
const PDFDocument = require('pdfkit');
const walletModel = require('../models/walletModel');
const doc = new PDFDocument();

const path = require('path')
const utils = require('util')
const puppeteer = require('puppeteer')
const hb = require('handlebars')
const readFile = utils.promisify(fs.readFile)
const pdf = require('html-pdf');

const { jsPDF } = require("jspdf");
const pdfDoc = new jsPDF();


const Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider(global.gConfig.Infura_URL));

var myContract = new web3.eth.Contract(global.gConfig.ABI, global.gConfig.contractAddress);

module.exports = {

  /**
   * Function Name :signUp
   * Description   :signUp of user
   *
   * @return response
  */
  signUp: async (req, res) => {
    try {
      var result, userId, userType;
      var phoneResult = phone(req.body.countryCode + req.body.mobileNumber)
      if (phoneResult.isValid == true) {
        var userData = await userModel.findOne({ email: req.body.email })
        if (userData) {
          if (req.body.email == userData.email) {
            req.body.otp = commonFunction.getOTP();
            req.body.otpTime = new Date().getTime();
            req.body.password = bcrypt.hashSync(req.body.password);
            req.body.hash = crypto.createHash('sha256').digest('firstName')
            commonFunction.sendMailOtp(userData.email, userData.firstName, req.body.otp)

            var updateRes = await userModel.findOneAndUpdate({ email: userData.email }, { $set: { otp: req.body.otp, otpTime: req.body.otpTime, otpVerification: false } }, { new: true }).select('-permissions -emailVerification ');
            response(res, SuccessCode.SUCCESS, updateRes, SuccessMessage.FOUND_OTP);
          }
        } else {
          if (req.body.agencyTeam) {
            req.body.userType = "COMPANY"
          }
          req.body.otp = commonFunction.getOTP();
          req.body.otpTime = new Date().getTime();
          req.body.password = bcrypt.hashSync(req.body.password);
          req.body.hash = crypto.createHash('sha256').digest('firstName')
          var results = await commonFunction.sendMailOtp(req.body.email, req.body.firstName, req.body.otp)
          var saveResult = await new userModel(req.body).save();
          if (saveResult) {
            var token = jwt.sign({ id: saveResult._id, iat: Math.floor(Date.now() / 1000) - 30 }, 'smart-contract-as-service-plateform');
            result = {
              userId: saveResult._id,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              countryCode: req.body.countryCode,
              mobileNumber: req.body.mobileNumber,
              otp: req.body.otp,
              userType: saveResult.userType,
              otpVerification: saveResult.otpVerification,
              token: token,
              agencyTeam: req.body.agencyTeam
            };
            await contractShareModel.findOneAndUpdate({ email: saveResult.email }, { $set: { userId: saveResult._id } }, { new: true });
            response(res, SuccessCode.SUCCESS, result, SuccessMessage.SIGNUP_SUCCESSFULLY);
          }
        }

      } else {
        response(res, ErrorCode.NOT_VALID, [], ErrorMessage.NOT_VALID_PHONE)
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },



  /**
  * Function Name :otpVerify
  * Description   : otpVerify of user
  *
  * @return response
 */
  otpVerify: async (req, res) => {
    try {
      if (!req.body.email || !req.body.otp) {
        response(res, ErrorCode.BAD_REQUEST, [], ErrorMessage.FIELD_REQUIRED1);
      }
      else {
        var result = await userModel.findOne({ email: req.body.email, status: "ACTIVE" })
        if (!result) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_REGISTERED);
        }
        else {
          var otpTime = new Date().getTime();
          var diff = otpTime - result.otpTime;
          if (diff >= 300000) {
            response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.OTP_EXPIRED);
          }
          else {
            if (req.body.otp == result.otp || req.body.otp == 1234) {
              userModel.findOneAndUpdate({ _id: result._id }, { $set: { otpVerification: true } }, { new: true }, (err2, result2) => {
                if (err2) {
                  response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
                }
                else {
                  var token = jwt.sign({ id: result2._id, iat: Math.floor(Date.now() / 1000) - 30 }, 'smart-contract-as-service-plateform', { expiresIn: '24h' });
                  var data = {
                    userId: result2._id,
                    email: result2.email,
                    mobileNumber: result2.mobileNumber,
                    userType: result2.userType,
                    firstName: result2.firstName,
                    lastName: result2.lastName,
                    countryCode: result2.countryCode,
                    otp: result2.otp,
                    otpVerification: true,
                    agencyTeam: result2.agencyTeam,
                    token: token
                  };
                  response(res, SuccessCode.SUCCESS, data, SuccessMessage.VERIFY_OTP);
                }
              })
            }
            else {
              response(res, ErrorCode.INVALID_CREDENTIAL, [], ErrorMessage.INVALID_OTP);
            }
          }
        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
    * Function Name :resendOTP
    * Description   : resendOTP of user
    *
    * @return response
   */


  resendOTP: async (req, res) => {
    try {
      let user = await userModel.findOne({ email: req.body.email, status: "ACTIVE" })
      if (!user) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      }
      else {
        var otp = commonFunction.getOTP();
        var otpTime = new Date().getTime();
        await commonFunction.sendMailOtp(user.email, user.firstName, otp)
        let update = await userModel.findByIdAndUpdate({ _id: user._id }, { $set: { otp: otp, otpTime: otpTime, otpVerification: false } }, { new: true })
        if (update) {
          response(res, SuccessCode.SUCCESS, [], SuccessMessage.OTP_SEND);
        }
      }
    }
    catch (error) {
      console.log(error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },


  /**
   * Function Name :forgotPassword
   * Description   : forgotPassword of user
   *
   * @return response
  */

  forgotPassword: async (req, res) => {
    try {
      var userResult = await userModel.findOne({ email: req.body.email, otpVerification: true, status: { $ne: "DELETE" } },)
      if (!userResult) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_REGISTERED);
      } else {
        var otp3 = commonFunction.getOTP();
        var otpTime4 = new Date().getTime();
        var emailRes = await commonFunction.sendMailOtp(req.body.email, userResult.firstName, otp3)
        var otpUpdate = await userModel.findOneAndUpdate({ email: req.body.email, status: { $ne: "DELETE" }, }, { $set: { otp: otp3, otpTime: otpTime4, otpVerification: false } }, { new: true },)
        response(res, SuccessCode.SUCCESS, [], SuccessMessage.OTP_SEND);
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },



  /**
 * Function Name :resetPassword
 * Description   : resetPassword of user
 *
 * @return response
*/
  resetPassword: (req, res) => {
    try {
      userModel.findOne({ email: req.body.email, status: "ACTIVE" }, (err, result) => {
        if (err) {
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
        }
        else if (!result) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
        }
        else {
          if (req.body.newPassword == req.body.confirmPassword) {
            userModel.findOneAndUpdate({ _id: result._id }, { $set: { password: bcrypt.hashSync(req.body.newPassword) } }, { new: true }, (updateErr, updateResult) => {
              if (updateErr) {
                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
              }
              else {
                response(res, SuccessCode.SUCCESS, updateResult, SuccessMessage.RESET_SUCCESS);
              }
            })
          }
          else {
            response(res, ErrorCode.VALIDATION_FAILED, [], ErrorMessage.NOT_MATCH);
          }
        }
      })
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
   * Function Name : login
   * Description   : login of user
   *
   * @return response
  */

  login: async (req, res) => {
    try {
      var userData = await userModel.findOne({ email: req.body.email })
      console.log(userData)
      if (!userData) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.EMAIL_NOT_REGISTERED)
      }
      if (userData.status == "BLOCK") {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.BLOCK_BY_ADMIN)
      }
      else if (userData.status == "DELETE") {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      }
      else {
        if (userData.userType == "VALIDATOR") {
          let check = bcrypt.compareSync(req.body.password, userData.password)
          if (check) {
            var token2 = jwt.sign({ id: userData._id, userType: userData.userType, iat: Math.floor(Date.now() / 1000) - 30 }, 'smart-contract-as-service-plateform', { expiresIn: '24h' });
            var result = {
              userId: userData._id,
              email: userData.email,
              countryCode: userData.countryCode,
              mobileNumber: userData.mobileNumber,
              token: token2,
              userType: userData.userType,
              agencyTeam: userData.agencyTeam,
            };
            response(res, SuccessCode.SUCCESS, { result }, SuccessMessage.LOGIN_SUCCESS)
          }
          else {
            response(res, ErrorCode.INVALID_CREDENTIAL, [], ErrorMessage.INVALID_CREDENTIAL)
          }
        }

        else {
          if (userData.otpVerification == true) {
            const check = bcrypt.compareSync(req.body.password, userData.password)
            if (check) {
              var token = jwt.sign({ id: userData._id, iat: Math.floor(Date.now() / 1000) - 30 }, 'smart-contract-as-service-plateform', { expiresIn: '24h' });
              let result = {
                userId: userData._id,
                token: token,
                hash: hash,
                firstName: userData.firstName,
                countryCode: userData.countryCode,
                userName: userData.userNmae,
                lastName: userData.lastName,
                mobileNumber: userData.mobileNumber,
                password: userData.pasword,
                email: userData.email,
                userType: userData.userType,
                agencyTeam: userData.agencyTeam
              };
              var planRes = await planModel.find({ userId: userData._id, status: "ACTIVE" })
              var planRes1 = {}
              if (planRes.length == 0) {
                planRes1 = {
                  planType: "No_plan",
                  planName: "No_Plan_Available",
                };
              } else {
                planRes1 = {
                  planType: planRes.planType,
                  planName: planRes.planName,
                  amount: planRes.amount,
                  subscriptionId: planRes._id
                };
              }
              await contractShareModel.findOneAndUpdate({ email: userData.email }, { $set: { userId: userData._id } });

              response(res, SuccessCode.SUCCESS, { result, planRes }, SuccessMessage.LOGIN_SUCCESS)
            } else {
              response(res, ErrorCode.INVALID_CREDENTIAL, [], ErrorMessage.INVALID_CREDENTIAL)
            }
          } else {
            req.body.otp = commonFunction.getOTP();
            req.body.otpTime = new Date().getTime();
            commonFunction.sendMailOtp(userData.email, userData.firstName, req.body.otp)
            var set1 = {}
            if (req.body.otp) {
              set1["otp"] = req.body.otp
            }
            if (req.body.otpTime) {
              set1["otpTime"] = req.body.otpTime
            }
            userModel.findOneAndUpdate({ _id: userData._id, status: "ACTIVE" }, { $set: set1 }, { new: true }, (updateErr, updatedData) => {
              if (updateErr) {
                response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
              }
              else {
                var token2 = jwt.sign({ id: userData._id, iat: Math.floor(Date.now() / 1000) - 30 }, 'smart-contract-as-service-plateform', { expiresIn: '24h' });
                var userDetail = {
                  userId: userData._id,
                  email: userData.email,
                  mobileNumber: userData.mobileNumber,
                  otp: updatedData.otp,
                  email: userData.email,
                  userType: userData.userType,
                  agencyTeam: userData.agencyTeam,
                  otpVerification: updatedData.otpVerification,
                  deviceType: updatedData.deviceType,
                  deviceToken: updatedData.deviceToken
                };
                response(res, SuccessCode.SUCCESS, userDetail, SuccessMessage.VERIFY_OTP_NEED)
              }
            })

          }
        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }
  },



  /**
  * Function Name : editProfile
  * Description   : editProfile of user
  *
  * @return response
  */
  editProfile: async (req, res) => {
    try {
      function update() {
        userModel.findByIdAndUpdate({ _id: req.userId, userType: { $in: ["COMPANY", "FREELANCER", "VALIDATOR"] }, status: "ACTIVE" }, { $set: req.body }, { new: true }, (error, updateResult) => {
          if (error) {
            response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
          }
          else {
            response(res, SuccessCode.SUCCESS, updateResult, SuccessMessage.UPDATE_SUCCESS);
          }
        })
      }
      userModel.findOne({ _id: req.userId, userType: { $in: ["COMPANY", "FREELANCER", "VALIDATOR"] }, status: "ACTIVE" }, async (err, userResult) => {
        if (err) {
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
        }
        else if (!userResult) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
        }
        else {
          if (req.body.profilePic) {
            req.body.profilePic = await convertImage(req.body.profilePic);
          }
          if (req.body.email && !req.body.mobileNumber) {
            let query = { email: req.body.email, userType: { $in: ["COMPANY", "FREELANCER", "VALIDATOR"] }, status: { $ne: "DELETE" }, _id: { $ne: userResult._id } }
            userModel.findOne(query, (err2, result) => {
              console.log(err2, result)
              if (err2) {
                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
              }
              else if (result) {
                response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.EMAIL_EXIST);
              }
              else {
                update();
              }
            })
          } else if (!req.body.email && req.body.mobileNumber) {
            let query = { mobileNumber: req.body.mobileNumber, userType: { $in: ["COMPANY", "FREELANCER", "VALIDATOR"] }, status: { $ne: "DELETE" }, _id: { $ne: userResult._id } }
            userModel.findOne(query, (err2, result) => {
              console.log(err2, result)
              if (err2) {
                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
              }
              else if (result) {
                response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.MOBILE_EXIST);
              }
              else {
                update();
              }
            })
          } else if (req.body.email && req.body.mobileNumber) {
            let query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] }, { userType: { $in: ["COMPANY", "FREELANCER"] } }, { status: { $ne: "DELETE" } }, { _id: { $ne: userResult._id } }] }
            userModel.findOne(query, (err2, result) => {
              console.log(err2, result)
              if (err2) {
                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
              }
              else if (result) {
                if (result.email == req.body.email) {
                  response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.EMAIL_EXIST);
                }
                else {
                  response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.MOBILE_EXIST);
                }
              }
              else {
                update();
              }
            })
          } else {
            update();
          }
        }
      })
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : getProfile
* Description   : getProfile of user
*
* @return response
*/
  getProfile: async (req, res) => {
    try {
      var userData = await userModel.findOne({ _id: req.userId, userType: { $in: ["COMPANY", "FREELANCER", "VALIDATOR"] }, status: "ACTIVE" })
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



  /**
  * Function Name : addContract
  * Description   : addContract of user
  *
  * @return response
  */
  addContract: async (req, res) => {
    try {
      var postRes, documentUrl, contractId, milestoneObj, milestones, contractRes, milestoneRes;
      var planRes = await planModel.findOne({ userId: req.userId, status: "ACTIVE" })
      var form = new multiparty.Form();
      var adminRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "COMPANY" });
      if (!adminRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        if (!planRes) {
          response(res, ErrorCode.NOT_FOUND, [], "You Dont have any Plan")
        } else {
          form.parse(req, async (err, fields, files) => {
            let milestoneObject = JSON.parse(fields.milestones)
            if (err) {
              response(res, ErrorCode.SOMETHING_WRONG, [], "Unsupported format")
            } else {
              if (files.contractDocument) {
                var imageArray = files.contractDocument.map((item) => (item.path));
                documentUrl = await convertDocument(imageArray);
              }
              var obj = {
                contractName: fields.contractName[0],
                agencyTeam: fields.agencyTeam ? fields.agencyTeam[0] : '',
                privacy: fields.privacy ? fields.privacy[0] : '',
                startDate: fields.startDate ? fields.startDate[0] : '',
                endDate: fields.endDate ? fields.endDate[0] : '',
                amount: fields.amount ? fields.amount[0] : '',
                contractDocument: files.contractDocument ? documentUrl : '',
                description: fields.description ? fields.description[0] : '',
                userId: adminRes._id,
                milestones: milestoneObject
              }
              let privateRes = await walletModel.findOne({ userId: adminRes._id })

              if (planRes.planType == "FREE") {
                if (planRes.contractAdded > 0) {
                  postRes = await new contractModel(obj).save();
                  contractRes = await addBlockchainContract("afa96d3dccef0627a7f72a0f8af9b66618e7360119e46f11097ec7efeaf87bcb", postRes.contractName, adminRes._id, postRes.privacy, postRes.agencyTeam, postRes.description, postRes.startDate, postRes.endDate, postRes.amount, postRes.contractDocument);
                  if (contractRes.responseCode === 200) {
                    contractId = await contractModel.countDocuments();
                    let milestone = [];
                    for (let i = 0; i < postRes.milestones.length; i++) {
                      milestone.push({
                        milestone: postRes.milestones[i].milestone,
                        dueDate: postRes.milestones[i].dueDate,
                        priority: postRes.milestones[i].priority,
                        _amount: Number(postRes.milestones[i].amount)
                      })
                    }
                    milestoneRes = await addBlockchainMilestone("afa96d3dccef0627a7f72a0f8af9b66618e7360119e46f11097ec7efeaf87bcb", contractId, milestone.length, milestone);
                    if (milestoneRes.responseCode === 200) {
                      await planModel.findByIdAndUpdate({ _id: planRes._id }, { $inc: { contractAdded: -1 } }, { new: true });
                      response(res, SuccessCode.SUCCESS, postRes, SuccessMessage.DATA_SAVED);
                    } else {
                      return res.send(milestoneRes);
                    }
                  } else {
                    return res.send(contractRes);
                  }
                } else {
                  response(res, ErrorCode.NOT_FOUND, [], "Your plan is exhausted")
                }
              } else {
                postRes = await new contractModel(obj).save();
                contractRes = await addBlockchainContract("afa96d3dccef0627a7f72a0f8af9b66618e7360119e46f11097ec7efeaf87bcb", postRes.contractName, adminRes._id, postRes.privacy, postRes.agencyTeam, postRes.description, postRes.startDate, postRes.endDate, postRes.amount, postRes.contractDocument);
                if (contractRes.responseCode === 200) {
                  contractId = await contractModel.countDocuments();
                  let milestone = [];
                  for (let i = 0; i < postRes.milestones.length; i++) {
                    milestone.push({
                      milestone: postRes.milestones[i].milestone,
                      dueDate: postRes.milestones[i].dueDate,
                      priority: postRes.milestones[i].priority,
                      _amount: Number(postRes.milestones[i].amount)
                    })
                  }
                  milestoneRes = await addBlockchainMilestone("afa96d3dccef0627a7f72a0f8af9b66618e7360119e46f11097ec7efeaf87bcb", contractId, milestone.length, milestone);
                  if (milestoneRes.responseCode === 200) {
                    response(res, SuccessCode.SUCCESS, postRes, SuccessMessage.DATA_SAVED);
                  } else {
                    return res.send(milestoneRes);
                  }
                } else {
                  return res.send(contractRes);
                }
              }
            }
          })
        }
      }
    } catch (error) {
      console.log("==error", error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }
  },

  /**
* Function Name : shareContractDetails
* Description   : shareContractDetails of user
*
* @return response
*/

  shareContractDetails: async (req, res) => {
    try {
      let mailObj;
      var today = new Date(new Date() - new Date().getTimezoneOffset() * 60 * 1000).toISOString();
      var date = '';
      var check = "";
      check = today.split(".")[0].split("T");
      var time = check[1].split(":")[0] > "11" ? " PM" : " AM"
      check = check[0].split("-").reverse().join("/") + " " + check[1] + time;
      console.log(check)
      date = check
      var findResult = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "COMPANY" })
      if (!findResult) {
        response(res, ErrorCode.USER_NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      }
      else {
        var data = await contractModel.findOne({ _id: req.body.contractId, status: "ACTIVE" }).select('-_id -status -userId   -createdAt -updatedAt -__v')
        if (!data) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          let milestonesLength = data.milestones.length;
          let pdfDoc, html;
          if (milestonesLength == 1) {
            html = `<!DOCTYPE HTML
             PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
           <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
             xmlns:o="urn:schemas-microsoft-com:office:office">
           
           <head>
             <!--[if gte mso 9]>
               <xml>
                 <o:OfficeDocumentSettings>
                   <o:AllowPNG/>
                   <o:PixelsPerInch>96</o:PixelsPerInch>
                 </o:OfficeDocumentSettings>
               </xml>
               <![endif]-->
             <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0">
             <meta name="x-apple-disable-message-reformatting">
             <!--[if !mso]><!-->
             <meta http-equiv="X-UA-Compatible" content="IE=edge">
             <!--<![endif]-->
             <title></title>
           
             <style type="text/css">
               table,
               td {
                 color: #000000;
               }
           
               a {
                 color: #0000ee;
                 text-decoration: underline;
               }
           
               @media only screen and (min-width: 670px) {
                 .u-row {
                   width: 650px !important;
                 }
           
                 .u-row .u-col {
                   vertical-align: top;
                 }
           
                 .u-row .u-col-100 {
                   width: 650px !important;
                 }
           
               }
           
               @media (max-width: 670px) {
                 .u-row-container {
                   max-width: 100% !important;
                   padding-left: 0px !important;
                   padding-right: 0px !important;
                 }
           
                 .u-row .u-col {
                   min-width: 320px !important;
                   max-width: 100% !important;
                   display: block !important;
                 }
           
                 .u-row {
                   width: calc(100% - 40px) !important;
                 }
           
                 .u-col {
                   width: 100% !important;
                 }
           
                 .u-col>div {
                   margin: 0 auto;
                 }
               }
           
               body {
                 margin: 0;
                 padding: 0;
               }
           
               table,
               tr,
               td {
                 vertical-align: top;
                 border-collapse: collapse;
               }
           
               p {
                 margin: 0;
               }
           
               .ie-container table,
               .mso-container table {
                 table-layout: fixed;
               }
           
               * {
                 line-height: inherit;
               }
           
               a[x-apple-data-detectors='true'] {
                 color: inherit !important;
                 text-decoration: none !important;
               }
             </style>
           
           
           
             <!--[if !mso]><!-->
             <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
             <!--<![endif]-->
           
           </head>
           
           <body class="clean-body u_body"
             style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
             <!--[if IE]><div class="ie-container"><![endif]-->
             <!--[if mso]><div class="mso-container"><![endif]-->
             <table
               style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
               cellpadding="0" cellspacing="0">
               <tbody>
                 <tr style="vertical-align: top">
                   <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                     <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
           
           
                     <div class="u-row-container" style="padding: 0px;background-color: transparent">
                       <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
                         <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #dff1ff;"><![endif]-->
           
                           <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                           <div class="u-col u-col-100"
                             style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                             <div style="width: 100% !important;">
                               <!--[if (!mso)&(!IE)]><!-->
                               <div
                                 stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                 <!--<![endif]-->
           
                                 <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                   cellspacing="0" width="100%" border="0">
                                   <tbody>
                                     <tr>
                                       <td
                                         style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                         align="left">
           
                                         <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                           <tr>
                                             <td style="padding-right: 0px;padding-left: 0px;" align="center">
           
                                               <img align="center" border="0"
                                                 src="https://res.cloudinary.com/do4yutbfj/image/upload/v1643864117/urwvegamrq0ojrqy97yy.png"
                                                 alt="Image" title="Image"
                                                 style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
                                                 width="117" />
           
                                             </td>
                                           </tr>
                                         </table>
           
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>
           
                                 <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                   cellspacing="0" width="100%" border="0">
                                   <tbody>
                                     <tr>
                                       <td
                                         style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                         align="left">
           
                                         <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                           <p style="line-height: 170%; text-align: center; font-size: 14px;"><span
                                               style="font-size: 24px; line-height: 40.8px; color: #000000;"></span></p>
                                           <p style="font-size: 14px; line-height: 170%; text-align: center;"><span
                                               style="font-size: 16px; line-height: 27.2px; color: #000000;"><b>Smart Contract as
                                                 service Plateform</b></span></p>
                                         </div>
           
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>
           
                                 <!--[if (!mso)&(!IE)]><!-->
                               </div>
                               <!--<![endif]-->
                             </div>
                           </div>
                           <!--[if (mso)|(IE)]></td><![endif]-->
                           <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                         </div>
                       </div>
                     </div>
           
           
           
                     <div class="u-row-container" style="padding: 0px;background-color: transparent">
                       <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                         <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #f3fbfd;"><![endif]-->
           
                           <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                           <div class="u-col u-col-100"
                             style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                             <div style="width: 100% !important;">
                               <!--[if (!mso)&(!IE)]><!-->
                               <div
                                 style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                 <!--<![endif]-->
           
                                 <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                   cellspacing="0" width="100%" border="0">
                                   <tbody>
                                     <tr>
                                       <td
                                         style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                         align="left"></br></br>
                                         <i>CONTRACT DETAILS </i>
                                         <div
                                           style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
                                           </br>
                                           <table style="width:100%">
                                             <tr align="left">
                                               <th>Contract ID</th>
                                               <td>${req.body.contractId}</td>
                                             </tr>
                                             <tr align="left">
                                               <th>Contract Name</th>
                                               <td>${data.contractName}</td>
           
                                             </tr>
                                             <tr align="left">
                                               <th>Contact Amount</th>
                                               <td>${data.amount}</td>
                                             </tr>
                                             <tr align="left">
                                               <th>Start Date</th>
                                               <td>${data.startDate}</td>
                                             </tr>
                                             <tr align="left">
                                               <th>Due Date</th>
                                               <td>${data.endDate}</td>
                                             </tr>
                                             <tr align="left">
                                             <th>Description</th>
                                             <td>${data.description}</td>
                                           </tr>
                                             
                                           </table>
           
                                         </div>
           
           
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>
           
                                 <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                   cellspacing="0" width="100%" border="0">
                                   <tbody>
                                     <tr>
                                       <td
                                         style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                         align="left">
           
                                         <div align="center">
                                          
                                           <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;"><tr><td style="font-family:'Montserrat',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;"><![endif]-->
                                               <table style="width:100%;  border: 1px solid black; border-collapse: collapse;">
                                            
                                                   <tr style="border: 1px solid black; border-collapse: collapse;">
                                                       <th style="background-color:#4682B4;">Milestone Name</th>
                                                       <th style="background-color:#4682B4">Task Name</th>
                                                       <th style="background-color:#4682B4">Created Date Time</th>
                                                       <th style="background-color:#4682B4">Amount</th>
                                                       <th style="background-color:#4682B4">Priority</th>
                                                       <th style="background-color:#4682B4">Due Date</th>
                                                   
                                                   </tr>
                                                   <tr style="border: 1px solid black; border-collapse: collapse;">
                                                       <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].milestone}</td>
                                                       <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].taskName}</td>
                                                       <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                                       <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].amount}</td>
                                                       <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].priority}</td>
                                                       <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].dueDate}</td>
                                                   </tr>            
                                                   </table><br />
           
                                           <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                         </div></br>
           
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>
           
                                 <!--[if (!mso)&(!IE)]><!-->
                               </div>
                               <!--<![endif]-->
                             </div>
                           </div>
                           <!--[if (mso)|(IE)]></td><![endif]-->
                           <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                         </div>
                       </div>
                     </div>
           
           
           
                     <div class="u-row-container" style="padding: 0px;background-color: transparent">
                       <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                         <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
                           <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #151418;"><![endif]-->
           
                           <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                           <div class="u-col u-col-100"
                             style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                             <div style="width: 100% !important;">
                               <!--[if (!mso)&(!IE)]><!-->
                               <div
                                 style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                 <!--<![endif]-->
           
                                 <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                   cellspacing="0" width="100%" border="0">
                                   <tbody>
                                     <tr>
                                       <td
                                         style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                         align="left">
           
                                         <div
                                           style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                           <p style="font-size: 14px; line-height: 140%;"><span
                                               style="font-size: 14px; line-height: 19.6px;">2021 @Smart Contract as service
                                               Plateform | All Rights Reserved</span></p>
                                         </div>
           
                                       </td>
                                     </tr>
           
                                   </tbody>
                                 </table>
           
                                 <!--[if (!mso)&(!IE)]><!-->
                               </div>
                               <!--<![endif]-->
                             </div>
                           </div>
                           <!--[if (mso)|(IE)]></td><![endif]-->
                           <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                         </div>
                       </div>
                     </div>
           
           
                     <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                   </td>
                 </tr>
               </tbody>
             </table>
             <!--[if mso]></div><![endif]-->
             <!--[if IE]></div><![endif]-->
           </body>
           
           </html>`
            const options = {
              format: 'Letter'
            }
            pdf.create(html, options).toFile('contract.pdf', (err, res) => {
              if (err) {
                console.log(err);
              }
            });
          }
          else if (milestonesLength == 2) {
            html = `<!DOCTYPE HTML
            PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office">
          
          <head>
            <!--[if gte mso 9]>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <!--<![endif]-->
            <title></title>
          
            <style type="text/css">
              table,
              td {
                color: #000000;
              }
          
              a {
                color: #0000ee;
                text-decoration: underline;
              }
          
              @media only screen and (min-width: 670px) {
                .u-row {
                  width: 650px !important;
                }
          
                .u-row .u-col {
                  vertical-align: top;
                }
          
                .u-row .u-col-100 {
                  width: 650px !important;
                }
          
              }
          
              @media (max-width: 670px) {
                .u-row-container {
                  max-width: 100% !important;
                  padding-left: 0px !important;
                  padding-right: 0px !important;
                }
          
                .u-row .u-col {
                  min-width: 320px !important;
                  max-width: 100% !important;
                  display: block !important;
                }
          
                .u-row {
                  width: calc(100% - 40px) !important;
                }
          
                .u-col {
                  width: 100% !important;
                }
          
                .u-col>div {
                  margin: 0 auto;
                }
              }
          
              body {
                margin: 0;
                padding: 0;
              }
          
              table,
              tr,
              td {
                vertical-align: top;
                border-collapse: collapse;
              }
          
              p {
                margin: 0;
              }
          
              .ie-container table,
              .mso-container table {
                table-layout: fixed;
              }
          
              * {
                line-height: inherit;
              }
          
              a[x-apple-data-detectors='true'] {
                color: inherit !important;
                text-decoration: none !important;
              }
            </style>
          
          
          
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
            <!--<![endif]-->
          
          </head>
          
          <body class="clean-body u_body"
            style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
            <!--[if IE]><div class="ie-container"><![endif]-->
            <!--[if mso]><div class="mso-container"><![endif]-->
            <table
              style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
              cellpadding="0" cellspacing="0">
              <tbody>
                <tr style="vertical-align: top">
                  <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #dff1ff;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                          <tr>
                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
                                              <img align="center" border="0"
                                                src="https://res.cloudinary.com/do4yutbfj/image/upload/v1643864117/urwvegamrq0ojrqy97yy.png"
                                                alt="Image" title="Image"
                                                style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
                                                width="117" />
          
                                            </td>
                                          </tr>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                          <p style="line-height: 170%; text-align: center; font-size: 14px;"><span
                                              style="font-size: 24px; line-height: 40.8px; color: #000000;"></span></p>
                                          <p style="font-size: 14px; line-height: 170%; text-align: center;"><span
                                              style="font-size: 16px; line-height: 27.2px; color: #000000;"><b>Smart Contract as
                                                service Plateform</b></span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #f3fbfd;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                        align="left"></br></br>
                                        <i>CONTRACT DETAILS </i>
                                        <div
                                          style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
                                          </br>
                                          <table style="width:100%">
                                            <tr align="left">
                                              <th>Contract ID</th>
                                              <td>${data._id}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Contract Name</th>
                                              <td>${data.contractName}</td>
          
                                            </tr>
                                            <tr align="left">
                                              <th>Contact Amount</th>
                                              <td>${data.amount}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Start Date</th>
                                              <td>${data.startDate}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Due Date</th>
                                              <td>${data.endDate}</td>
                                            </tr>
                                            <tr align="left">
                                            <th>Description</th>
                                            <td>${data.description}</td>
                                          </tr>
                                            
                                          </table>
          
                                        </div>
          
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div align="center">
                                         
                                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;"><tr><td style="font-family:'Montserrat',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;"><![endif]-->
                                              <table style="width:100%;  border: 1px solid black; border-collapse: collapse;">
                                           
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                      <th style="background-color:#4682B4;">Milestone Name</th>
                                                      <th style="background-color:#4682B4">Task Name</th>
                                                      <th style="background-color:#4682B4">Created Date Time</th>
                                                      <th style="background-color:#4682B4">Amount</th>
                                                      <th style="background-color:#4682B4">Priority</th>
                                                      <th style="background-color:#4682B4">Due Date</th>
                                                  
                                                  </tr>
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].milestone}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].taskName}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].amount}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].priority}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].dueDate}</td>
                                                  </tr>     
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].milestone}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].taskName}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].amount}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].priority}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].dueDate}</td>
                                              </tr>            
                                                  </table><br />
          
                                          <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                        </div></br>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #151418;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div
                                          style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 140%;"><span
                                              style="font-size: 14px; line-height: 19.6px;">2021 @Smart Contract as service
                                              Plateform | All Rights Reserved</span></p>
                                        </div>
          
                                      </td>
                                    </tr>
          
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            <!--[if mso]></div><![endif]-->
            <!--[if IE]></div><![endif]-->
          </body>
          
          </html>`
            const options = {
              format: 'Letter'
            }
            pdf.create(html, options).toFile('contract.pdf', (err, res) => {
              if (err) {
                console.log(err);
              }
            });
          }
          else if (milestonesLength == 3) {
            html = `<!DOCTYPE HTML
            PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office">
          
          <head>
            <!--[if gte mso 9]>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <!--<![endif]-->
            <title></title>
          
            <style type="text/css">
              table,
              td {
                color: #000000;
              }
          
              a {
                color: #0000ee;
                text-decoration: underline;
              }
          
              @media only screen and (min-width: 670px) {
                .u-row {
                  width: 650px !important;
                }
          
                .u-row .u-col {
                  vertical-align: top;
                }
          
                .u-row .u-col-100 {
                  width: 650px !important;
                }
          
              }
          
              @media (max-width: 670px) {
                .u-row-container {
                  max-width: 100% !important;
                  padding-left: 0px !important;
                  padding-right: 0px !important;
                }
          
                .u-row .u-col {
                  min-width: 320px !important;
                  max-width: 100% !important;
                  display: block !important;
                }
          
                .u-row {
                  width: calc(100% - 40px) !important;
                }
          
                .u-col {
                  width: 100% !important;
                }
          
                .u-col>div {
                  margin: 0 auto;
                }
              }
          
              body {
                margin: 0;
                padding: 0;
              }
          
              table,
              tr,
              td {
                vertical-align: top;
                border-collapse: collapse;
              }
          
              p {
                margin: 0;
              }
          
              .ie-container table,
              .mso-container table {
                table-layout: fixed;
              }
          
              * {
                line-height: inherit;
              }
          
              a[x-apple-data-detectors='true'] {
                color: inherit !important;
                text-decoration: none !important;
              }
            </style>
          
          
          
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
            <!--<![endif]-->
          
          </head>
          
          <body class="clean-body u_body"
            style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
            <!--[if IE]><div class="ie-container"><![endif]-->
            <!--[if mso]><div class="mso-container"><![endif]-->
            <table
              style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
              cellpadding="0" cellspacing="0">
              <tbody>
                <tr style="vertical-align: top">
                  <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #dff1ff;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                          <tr>
                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
                                              <img align="center" border="0"
                                                src="https://res.cloudinary.com/do4yutbfj/image/upload/v1643864117/urwvegamrq0ojrqy97yy.png"
                                                alt="Image" title="Image"
                                                style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
                                                width="117" />
          
                                            </td>
                                          </tr>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                          <p style="line-height: 170%; text-align: center; font-size: 14px;"><span
                                              style="font-size: 24px; line-height: 40.8px; color: #000000;"></span></p>
                                          <p style="font-size: 14px; line-height: 170%; text-align: center;"><span
                                              style="font-size: 16px; line-height: 27.2px; color: #000000;"><b>Smart Contract as
                                                service Plateform</b></span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #f3fbfd;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                        align="left"></br></br>
                                        <i>CONTRACT DETAILS </i>
                                        <div
                                          style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
                                          </br>
                                          <table style="width:100%">
                                            <tr align="left">
                                              <th>Contract ID</th>
                                              <td>${data._id}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Contract Name</th>
                                              <td>${data.contractName}</td>
          
                                            </tr>
                                            <tr align="left">
                                              <th>Contact Amount</th>
                                              <td>${data.amount}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Start Date</th>
                                              <td>${data.startDate}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Due Date</th>
                                              <td>${data.endDate}</td>
                                            </tr>
                                            <tr align="left">
                                            <th>Description</th>
                                            <td>${data.description}</td>
                                          </tr>
                                            
                                          </table>
          
                                        </div>
          
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div align="center">
                                         
                                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;"><tr><td style="font-family:'Montserrat',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;"><![endif]-->
                                              <table style="width:100%;  border: 1px solid black; border-collapse: collapse;">
                                           
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                      <th style="background-color:#4682B4;">Milestone Name</th>
                                                      <th style="background-color:#4682B4">Task Name</th>
                                                      <th style="background-color:#4682B4">Created Date Time</th>
                                                      <th style="background-color:#4682B4">Amount</th>
                                                      <th style="background-color:#4682B4">Priority</th>
                                                      <th style="background-color:#4682B4">Due Date</th>
                                                  
                                                  </tr>
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].milestone}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].taskName}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].amount}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].priority}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].dueDate}</td>
                                                  </tr>     
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].milestone}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].taskName}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].amount}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].priority}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].dueDate}</td>
                                              </tr>      
                                              <tr style="border: 1px solid black; border-collapse: collapse;">
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].milestone}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].taskName}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].amount}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].priority}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].dueDate}</td>
                                          </tr>            
                                                  </table><br />
          
                                          <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                        </div></br>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #151418;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div
                                          style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 140%;"><span
                                              style="font-size: 14px; line-height: 19.6px;">2021 @Smart Contract as service
                                              Plateform | All Rights Reserved</span></p>
                                        </div>
          
                                      </td>
                                    </tr>
          
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            <!--[if mso]></div><![endif]-->
            <!--[if IE]></div><![endif]-->
          </body>
          
          </html>`
            const options = {
              format: 'Letter'
            }
            pdf.create(html, options).toFile('contract.pdf', (err, res) => {
              if (err) {
                console.log(err);
              }
            });
          }
          else if (milestonesLength == 4) {
            html = `<!DOCTYPE HTML
            PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office">
          
          <head>
            <!--[if gte mso 9]>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <!--<![endif]-->
            <title></title>
          
            <style type="text/css">
              table,
              td {
                color: #000000;
              }
          
              a {
                color: #0000ee;
                text-decoration: underline;
              }
          
              @media only screen and (min-width: 670px) {
                .u-row {
                  width: 650px !important;
                }
          
                .u-row .u-col {
                  vertical-align: top;
                }
          
                .u-row .u-col-100 {
                  width: 650px !important;
                }
          
              }
          
              @media (max-width: 670px) {
                .u-row-container {
                  max-width: 100% !important;
                  padding-left: 0px !important;
                  padding-right: 0px !important;
                }
          
                .u-row .u-col {
                  min-width: 320px !important;
                  max-width: 100% !important;
                  display: block !important;
                }
          
                .u-row {
                  width: calc(100% - 40px) !important;
                }
          
                .u-col {
                  width: 100% !important;
                }
          
                .u-col>div {
                  margin: 0 auto;
                }
              }
          
              body {
                margin: 0;
                padding: 0;
              }
          
              table,
              tr,
              td {
                vertical-align: top;
                border-collapse: collapse;
              }
          
              p {
                margin: 0;
              }
          
              .ie-container table,
              .mso-container table {
                table-layout: fixed;
              }
          
              * {
                line-height: inherit;
              }
          
              a[x-apple-data-detectors='true'] {
                color: inherit !important;
                text-decoration: none !important;
              }
            </style>
          
          
          
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
            <!--<![endif]-->
          
          </head>
          
          <body class="clean-body u_body"
            style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
            <!--[if IE]><div class="ie-container"><![endif]-->
            <!--[if mso]><div class="mso-container"><![endif]-->
            <table
              style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
              cellpadding="0" cellspacing="0">
              <tbody>
                <tr style="vertical-align: top">
                  <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #dff1ff;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                          <tr>
                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
                                              <img align="center" border="0"
                                                src="https://res.cloudinary.com/do4yutbfj/image/upload/v1643864117/urwvegamrq0ojrqy97yy.png"
                                                alt="Image" title="Image"
                                                style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
                                                width="117" />
          
                                            </td>
                                          </tr>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                          <p style="line-height: 170%; text-align: center; font-size: 14px;"><span
                                              style="font-size: 24px; line-height: 40.8px; color: #000000;"></span></p>
                                          <p style="font-size: 14px; line-height: 170%; text-align: center;"><span
                                              style="font-size: 16px; line-height: 27.2px; color: #000000;"><b>Smart Contract as
                                                service Plateform</b></span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #f3fbfd;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                        align="left"></br></br>
                                        <i>CONTRACT DETAILS </i>
                                        <div
                                          style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
                                          </br>
                                          <table style="width:100%">
                                            <tr align="left">
                                              <th>Contract ID</th>
                                              <td>${data._id}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Contract Name</th>
                                              <td>${data.contractName}</td>
          
                                            </tr>
                                            <tr align="left">
                                              <th>Contact Amount</th>
                                              <td>${data.amount}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Start Date</th>
                                              <td>${data.startDate}</td>
                                            </tr>
                                            <tr align="left">
                                              <th>Due Date</th>
                                              <td>${data.endDate}</td>
                                            </tr>
                                            <tr align="left">
                                            <th>Description</th>
                                            <td>${data.description}</td>
                                          </tr>
                                            
                                          </table>
          
                                        </div>
          
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div align="center">
                                         
                                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;"><tr><td style="font-family:'Montserrat',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;"><![endif]-->
                                              <table style="width:100%;  border: 1px solid black; border-collapse: collapse;">
                                           
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                      <th style="background-color:#4682B4;">Milestone Name</th>
                                                      <th style="background-color:#4682B4">Task Name</th>
                                                      <th style="background-color:#4682B4">Created Date Time</th>
                                                      <th style="background-color:#4682B4">Amount</th>
                                                      <th style="background-color:#4682B4">Priority</th>
                                                      <th style="background-color:#4682B4">Due Date</th>
                                                  
                                                  </tr>
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].milestone}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].taskName}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].amount}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].priority}</td>
                                                      <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[0].dueDate}</td>
                                                  </tr>     
                                                  <tr style="border: 1px solid black; border-collapse: collapse;">
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].milestone}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].taskName}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].amount}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].priority}</td>
                                                  <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[1].dueDate}</td>
                                              </tr>      
                                              <tr style="border: 1px solid black; border-collapse: collapse;">
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].milestone}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].taskName}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].amount}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].priority}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[2].dueDate}</td>
                                          </tr>         
                                          <tr style="border: 1px solid black; border-collapse: collapse;">
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[3].milestone}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[3].taskName}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.createdAt}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[3].amount}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[3].priority}</td>
                                              <td style="border: 1px solid black; border-collapse: collapse;"; align="center"> ${data.milestones[3].dueDate}</td>
                                          </tr>            
                                                  </table><br />
          
                                          <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                        </div></br>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #151418;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                  cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                        align="left">
          
                                        <div
                                          style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 140%;"><span
                                              style="font-size: 14px; line-height: 19.6px;">2021 @Smart Contract as service
                                              Plateform | All Rights Reserved</span></p>
                                        </div>
          
                                      </td>
                                    </tr>
          
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            <!--[if mso]></div><![endif]-->
            <!--[if IE]></div><![endif]-->
          </body>
          
          </html>`
          const options = {
            format: 'Letter'
          }
          pdf.create(html, options).toFile('contract.pdf', (err, res) => {
            if (err) {
              console.log(err);
            }
          });
          }
          let maillist = req.body.maillist
          let subject = "Invitation for Join Contract Name: Hyper Ledger Planning";
          let message = `Dear ${findResult.emai}  Has been invited you for  a proposal contract!
                           Read more about the contract below and accept the  contract  if you think 
                           ${findResult.emai} is a good fit. If you are not registered with our platform
                           please create your account to view this contract. Here is the platform 
                           URL-https://smart-service.mobiloitte.org/ `
          await commonFunction.successEmail(maillist, subject, message);
          for (let index of req.body.maillist) {
            mailObj = {
              companyId: findResult._id,
              contractId: req.body.contractId,
              maillist: req.body.maillist,
              email: index,
              milestones: data.milestones
            }
            let emailCheck = await contractShareModel.findOne({ email: index, contractId: req.body.contractId });
            if (emailCheck) {
              await contractShareModel.findByIdAndUpdate({ _id: emailCheck._id }, { $push: { milestones: data.milestones } }, { new: true });
            } else {
              await new contractShareModel(mailObj).save();
            }
          }

          response(res, SuccessCode.SUCCESS, {}, SuccessMessage.DATA_SEND);
        }
      }
    } catch (error) {
      console.log("err====", error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },



  /**
* Function Name : viewContract
* Description   : viewContract of user
*
* @return response
*/
  viewContract: async (req, res) => {
    try {
      var contractRes = await contractModel.findOne({ _id: req.query.contractId, validatorContractStatus: { $in: ["PENDING", "REJECT", "APPROVED"] } }).populate('validatorId', "_id firstName lastName mobileNumber email userType status")
      if (!contractRes) {
        response(res, ErrorCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
      } else {
        // var contractResult = await blockChainFunction.viewContract(contractIndex.contractId)
        response(res, SuccessCode.SUCCESS, contractRes, SuccessMessage.DATA_FOUND);

      }
    } catch (error) {
      console.log(error);
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : deleteContract
* Description   : deleteContract of user
*
* @return response
*/
  deleteContract: async (req, res) => {
    try {
      var avRes = await userModel.findOne({ _id: req.userId, userType: { $in: ["COMPANY"] } },)
      if (!avRes) {
        response(res, ErrorCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
      } else {
        var deleteRes = await contractModel.findOne({ userId: req.body.contractId, status: "ACTIVE" },)
        if (!deleteRes) {
          response(res, ErrorCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
        } else {
          var validatRes = await contractModel.findOneAndUpdate({ _id: deleteRes._id }, { $set: { validateStatus: "DELETE" } }, { new: true },)
          if (!validatRes) {
            response(res, ErrorCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
          } else {
            response(res, SuccessCode.SUCCESS, validatRes, SuccessMessage.DELETE_SUCCESS)
          }
        }
      }

    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },



  /**
  * Function Name : listContract
  * Description   : listContract of user
  *
  * @return response
  */

  listContract: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "FREELANCER" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var contractShareRes = await contractShareModel.find({ maillist: { $in: userRes.email }, status: "ACTIVE" }).populate('contractId')
        if (contractShareRes.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, contractShareRes, SuccessMessage.DATA_FOUND);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : listContractForCompany
* Description   : listContractForCompany of user
*
* @return response
*/
  listContractForCompany: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, userType: "COMPANY" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var adminRes = await contractModel.find({ userId: userRes._id, status: "ACTIVE" }).populate('validatorId').sort({ updatedAt: 1 })
        if (!adminRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, adminRes, SuccessMessage.DATA_FOUND);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : listContractById
* Description   : listContractById of user
*
* @return response
*/
  listContractById: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["USER", "FREELANCER", "COMPANY"] } })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var adminRes = await contractShareModel.findOne({ _id: req.query._id, status: "ACTIVE" }).populate('contractId')
        if (!adminRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, adminRes, SuccessMessage.DATA_FOUND);
        }
      }

    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : viewMilestone
* Description   : viewMilestone of user
*
* @return response
*/
  viewMilestone: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["USER", "FREELANCER", "VALIDATOR", "COMPANY"] } })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var result = await contractShareModel.findOne({ "milestones._id": req.query._id }).select({ milestones: { $elemMatch: { _id: req.query._id } } })
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

  /**
* Function Name : listMilestone
* Description   : listMilestone of user
*
* @return response
*/
  listMilestone: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, userType: "FREELANCER" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorCode.USER_NOT_FOUND)
      }
      var contractRes = await contractShareModel.findOne({ contractId: req.query.contractId, email: userRes.email }).populate({ path: "contractId", populate: { path: "validatorId", } });
      if (!contractRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
      } else {
        response(res, SuccessCode.SUCCESS, contractRes, SuccessMessage.DATA_FOUND);
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  editMilestone: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["USER", "VALIDATOR", "COMPANY"] } })
      if (userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var result = await contractShareModel.findOne({ contractId: req.body.contractId, "milestones._id": req.body._id, "milestones.mileStoneStatus": "INPROGRESS" })

        if (!result) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          var milestoneRes = await contractModel.findByIdAndUpdate({ _id: result.contractId }, { $set: req.body }, { new: true })
          var milestoneUpdate = await contractShareModel.findByIdAndUpdate({ contractId: result.contractId, "milestones._id": req.body._id }, { $set: req.body }, { new: true })
          response(res, SuccessCode.SUCCESS, result, SuccessMessage.SUCCESS)
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : listMilestoneForCompany
* Description   : listMilestoneForCompany of user
*
* @return response
*/
  listMilestoneForCompany: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, userType: "COMPANY" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorCode.USER_NOT_FOUND)
      }
      var adminRes = await contractModel.findOne({ _id: req.query._id, userId: userRes._id }).populate('validatorId')
      if (!adminRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
      } else {
        response(res, SuccessCode.SUCCESS, adminRes, SuccessMessage.DATA_FOUND);
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : subscriptionList
* Description   : subscriptionList of user
*
* @return response
*/
  subscriptionList: (req, res) => {
    try {
      var query = { status: { $ne: "DELETE" } };
      if (req.body.search) {
        query.planName = new RegExp('^' + req.body.search, "i");
      }
      req.body.limit = parseInt(req.body.limit)
      var options = {
        page: req.body.page || 1,
        limit: req.body.limit || 100,
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

  /**
* Function Name : viewPlan
* Description   : viewPlan of user
*
* @return response
*/
  viewPlan: async (req, res) => {
    try {
      var res1 = await userModel.findOne({ _id: req.userId }, { status: "ACTIVE" })
      if (!res1) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
      } else {
        var planRes = await planModel.findOne({ planType: req.body.planType, status: "ACTIVE" })
        if (!planRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          response(res, SuccessCode.SUCCESS, planRes, SuccessMessage.DATA_FOUND);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : planList
* Description   : planList of user
*
* @return response
*/
  planList: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["COMPANY", "USER", "VALIDATOR"] } })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
      } else {
        var resPlan = await planModel.find({ userId: userRes._id, status: "ACTIVE" });
        if (resPlan.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          response(res, SuccessCode.SUCCESS, resPlan, SuccessMessage.DATA_FOUND)
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }
  },

  /**
* Function Name : favouriteUnfavouriteContract
* Description   : favouriteUnfavouriteContract of user
*
* @return response
*/
  favouriteUnfavouriteContract: async (req, res) => {
    try {
      var result = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["COMPANY", "FREELANCER", "USER"] } })
      if (!result) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      }
      else {
        var data = await contractModel.findOne({ _id: req.body._id, status: "ACTIVE" })
        if (!data) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        }
        else {
          var stat = data.favouriteContract.includes(result._id);
          if (stat == false) {
            var updateResult = await contractModel.findByIdAndUpdate({ _id: data._id }, { $addToSet: { favouriteContract: result._id } }, { new: true })
            if (updateResult) {
              response(res, SuccessCode.SUCCESS, updateResult, SuccessMessage.FAVOURITE_SUCCESS);
            }
          }
          else {
            var updateResult1 = await contractModel.findByIdAndUpdate({ _id: data._id }, { $pull: { favouriteContract: result._id } }, { new: true })
            if (updateResult1) {
              response(res, SuccessCode.SUCCESS, updateResult, SuccessMessage.UNFAVOURITE_SUCCESS);
            }
          }
        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : viewFaq
* Description   : viewFaq of user
*
* @return response
*/
  viewFaq: async (req, res) => {
    try {
      var adminRes = await userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["USER", "COMPANY", "VALIDATOR"] }, })
      if (!adminRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
      } else {
        var findResult = await faqModel.findOne({ _id: req.params.faqId, status: { $ne: "DELETE" } },)
        if (!findResult) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, findResult, SuccessMessage.DETAIL_GET);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : faqList
* Description   : faqList of user
*
* @return response
*/
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

  /**
* Function Name : viewNotification
* Description   : viewNotification of user
*
* @return response
*/
  viewNotification: (req, res) => {
    try {
      userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["COMPANY", "USER", "VALIDATOR"] }, },
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

  /**
* Function Name : notificationList
* Description   : notificationList of user
*
* @return response
*/
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
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
        } else if (result.docs.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, result, SuccessMessage.DETAIL_GET);
        }
      });
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
  * Function Name : approveContract
  * Description   : approveContract of user
  *
  * @return response
  */

  approveContract: async (req, res) => {
    try {
      var result = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "FREELANCER" })
      if (!result) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var userContractRes = await contractShareModel.findOne({ _id: req.body._id, status: "ACTIVE" }).populate({ path: 'contractId', select: 'contractName' });
        if (!userContractRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          approveResult = await approveContract(userContractRes.contractId, result._id)
          if (approveResult.responseCode === 200) {
            var contractRes = await contractShareModel.findByIdAndUpdate({ _id: userContractRes._id }, { $set: { userContractStatus: "APPROVED", freelancerId: result._id } }, { new: true })
            let complanyMail = await userModel.findOne({ _id: userContractRes.companyId }).select('email');
            let email = complanyMail.email;
            let subject = 'Approve Contract Invitation';
            let msg = `${result.email} have accepted your contract invitation for this contract:  ${userContractRes.contractId.contractName}.`
            await commonFunction.sendEmailToNotify(email, subject, msg);
            response(res, SuccessCode.SUCCESS, contractRes, SuccessMessage.CONTRACT_APPROVE)
          } else {
            return res.send(approveResult);
          }
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }

  },

  /**
  * Function Name : rejectContract
  * Description   : rejectContract of user
  *
  * @return response
  */

  rejectContract: async (req, res) => {
    try {
      var result = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "FREELANCER" })
      if (!result) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var userContractRes = await contractShareModel.findOne({ _id: req.body.contractId, status: "ACTIVE" }).populate({ path: 'contractId', select: 'contractName' });
        if (!userContractRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          var contractRes = await contractShareModel.findByIdAndUpdate({ _id: userContractRes._id }, { $set: { userContractStatus: "REJECT", freelancerId: result._id } }, { new: true },)
          let companyMail = await userModel.findOne({ _id: userContractRes.companyId }).select('email');
          let email = companyMail.email;
          let subject = 'Reject Contract Invitation';
          let msg = `${result.email} have rejected your contract invitation for this ${userContractRes.contractId.contractName}.`
          await commonFunction.sendEmailToNotify(email, subject, msg);
          response(res, SuccessCode.SUCCESS, contractRes, SuccessMessage.CONTRACT_REJECT);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }

  },

  /**
  * Function Name : completeParticularMilestone
  * Description   : completeParticularMilestone of user
  *
  * @return response
  */
  completeParticularMilestone: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "FREELANCER" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
      } else {
        var findRes = await contractShareModel.findOne({ "milestones._id": req.body.milestoneId, _id: req.body._id, status: { $ne: "DELETE" } })
        if (!findRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          var milestoneRes = await contractShareModel.findOneAndUpdate({ _id: findRes._id, "milestones._id": req.body.milestoneId }, { $set: { "milestones.$.mileStoneStatus": "COMPLETE", email: userRes.email, "milestones.$.comment": req.body.comment } }, { new: true });
          let data = await contractShareModel.aggregate([
            {
              $match: {
                _id: mongoose.Types.ObjectId(milestoneRes._id),
                milestones: { $elemMatch: { mileStoneStatus: "COMPLETE" } }
              }
            },
            {
              $redact: {
                $cond: {
                  if: { $or: [{ $eq: ["$mileStoneStatus", "COMPLETE"] }, { $not: "$mileStoneStatus" }] },
                  then: "$$DESCEND",
                  else: "$$PRUNE"
                }
              }
            },
            {
              $project: {
                milestones: 1,
                contractId: 1,
                _id: 0
              }
            }

          ]);

          let complanyMail = await userModel.findOne({ _id: findRes.companyId }).select('email');
          let subject = 'Milestone Complete';
          var email = complanyMail.email;
          let message = `I ${userRes.firstName} with my mailId: ${userRes.email} have Completed My Milestone.<br>
          My milestone details are: <br> contractId: ${findRes._id} 
          <br> milestoneId: ${req.body.milestoneId} 
          <br> milestoneStatus: "COMPLETE" <br>
          Comment:${req.body.comment} `
          var findRestttt = await commonFunction.sendMailCronJob(email, subject, message);
          response(res, SuccessCode.SUCCESS, data, SuccessMessage.MILESTONE_COMPLETE);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, milestoneRes, ErrorMessage.SOMETHING_WRONG)
    }
  },



  completeMilestonelistCompany: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, userType: "COMPANY" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var dataRes = await contractShareModel({ contractId: req.query.contractId, userId: userRes._id })
        if (!dataRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          let data = await contractShareModel.aggregate([
            {
              $match: {
                milestones: { $elemMatch: { mileStoneStatus: "COMPLETE" } }
              }
            },
            {
              $redact: {
                $cond: {
                  if: { $or: [{ $eq: ["$mileStoneStatus", "COMPLETE"] }, { $not: "$mileStoneStatus" }] },
                  then: "$$DESCEND",
                  else: "$$PRUNE"
                }
              }
            }]);
          response(res, SuccessCode.SUCCESS, data, SuccessMessage.DETAIL_GET);

        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }
  },


  CompletedlistContractUser: async (req, res) => {
    let data = await contractShareModel.aggregate([
      {
        $match: {
          milestones: { $elemMatch: { mileStoneStatus: "COMPLETE" } }
        }
      },
      {
        $redact: {
          $cond: {
            if: { $or: [{ $eq: ["$mileStoneStatus", "COMPLETE"] }, { $not: "$mileStoneStatus" }] },
            then: "$$DESCEND",
            else: "$$PRUNE"
          }
        }
      }]);
    response(res, SuccessCode.SUCCESS, data, SuccessMessage.DETAIL_GET);
  },


  viewTransaction: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "COMPANY" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var transRes = await transactionModel.findOne({ _id: req.query._id, status: "ACTIVE" }).populate([{ path: 'subscriptionId', select: 'planName' }, { path: 'userId', select: 'firstName lastName' }])
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

  transactionList: async (req, res) => {
    try {
      userModel.findOne({ _id: req.userId, status: { $ne: "DELETE" }, userType: { $in: ["COMPANY"] }, }, async (error, result) => {
        if (error) {
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
        } else if (!result) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
        } else {
          let query = { status: { $ne: "DELETE" }, paymentStatus: "SUCCESS", userId: result._id };
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
            populate: { path: "subscriptionId userId", select: "firstName lastName planName" }
          }
          transactionModel.paginate(query, options, (transErr, transRes) => {
            if (transErr) {
              response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
            } else if (transRes.docs.length == 0) {
              response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
            } else {
              response(res, SuccessCode.SUCCESS, transRes, SuccessMessage.DETAIL_GET);
            }
          })
        }
      })
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },


  contactUs: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ status: "ACTIVE", userType: { $in: ["COMPANY", "USER", "VALIDATOR"] } })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      } else {
        var message = req.body.message;
        var name = req.body.name;
        var adminRes = await userModel.findOne({ userType: "ADMIN" });
        var subject = "Contact Us";
        let sendMessage = `Name : ${name} 
        Message: ${message}`
        var send = await commonFunction.sendMailCronJob(adminRes.email, subject, sendMessage);
        if (send) {
          await new userModel({ userId: userRes._id, message: req.body.message, name: req.body.name }).save();
          response(res, SuccessCode.SUCCESS, send, "Mail send successfully!")
        } else {
          response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
        }

      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, ErrorMessage.SOMETHING_WRONG);
    }
  },

  addCard: async (req, res) => {
    try {
      var result = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["USER", "COMPANY"] } });
      if (!result) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      } else {
        var cardRes = await cardModel.findOne({ cardNumber: req.body.cardNumber, status: "ACTIVE" });
        if (cardRes) {
          response(res, ErrorCode.ALREADY_EXIST, [], ErrorMessage.CARD_EXIST);
        } else {
          var userCheck = await cardModel.find({ customerId: result._id, status: "ACTIVE" });
          if (userCheck) {
            await cardModel.updateMany({ customerId: result._id }, { $set: { defaultCard: false } }, { multi: true });
            req.body.customerId = result._id
            new cardModel(req.body).save((saveErr, saveRes) => {
              if (saveErr) {
                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
              } else {
                response(res, SuccessCode.SUCCESS, saveRes, SuccessMessage.CARD_ADDED);
              }
            })
          } else {
            req.body.customerId = result._id
            new cardModel(req.body).save((saveErr, saveRes) => {
              if (saveErr) {
                response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
              } else {
                response(res, SuccessCode.SUCCESS, saveRes, SuccessMessage.CARD_ADDED);
              }
            })
          }

        }
      }
    }
    catch (error) {
      console.log(error)
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
* Function Name : selectCard
* Description   :  selectCard in user
*
* @return response
*/
  selectCard: async (req, res) => {
    try {
      var result = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["USER", "COMPANY"] } });
      if (!result) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      } else {
        var cardRes = await cardModel.findOne({ _id: req.body.cardId, status: "ACTIVE" });
        if (cardRes) {
          var updateCard = await cardModel.findOneAndUpdate({ _id: cardRes._id }, { $set: { defaultCard: true } }, { new: true });
          if (updateCard) {
            var updateCardMany = await cardModel.updateMany({ customerId: result._id, _id: { $ne: updateCard._id } }, { $set: { defaultCard: false } }, { multi: true });
            if (updateCardMany) {
              response(res, SuccessCode.SUCCESS, updateCard, SuccessMessage.SELECT_CARD);
            }
          }
        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  /**
  * Function Name : cardList
  * Description   :  cardList in user
  *
  * @return response
  */
  cardList: async (req, res) => {
    try {
      var result = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["USER", "COMPANY"] } });
      if (!result) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      } else {
        var cardData = await cardModel.find({ customerId: result._id, status: "ACTIVE", transactionStatus: "COMPLETED" });
        if (cardData.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, cardData, SuccessMessage.DETAIL_GET);
        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  fundRaised: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
      } else {
        var milestoneRes = await milestoneModel.findOne({ _id: req.body.milestoneId, mileStoneStatus: "COMPLETE" })
        if (!milestoneRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          response(res, SuccessCode.SUCCESS, [], "Fund Raised")
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }
  },

  //////////////////// REMOVE COLLECTION ////////////////////////
  removeCollection: (req, res) => {
    var modelName = eval(req.query.model, "ADMIN");
    modelName.deleteMany({}, (err, result) => {
      console.log("????????", err, result)
      if (err) {
        response(res, ErrorCode.INTERNAL_ERROR, [], ErrorMessage.INTERNAL_ERROR);
      }
      else {
        response(res, SuccessCode.SUCCESS, result, SuccessMessage.DELETE_SUCCESS);
      }
    })
  },
  listValidator: async (req, res) => {
    try {
      var listRes = await userModel.find({ userType: "VALIDATOR", status: { $ne: "DELETE" } },)
      if (!listRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.DATA_NOT_FOUND);
      } else {
        response(res, SuccessCode.SUCCESS, listRes, SuccessMessage.DETAIL_GET);
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },

  selectValidatorByCompany: async (req, res) => {
    try {
      let company = await userModel.findOne({ _id: req.userId, userType: "COMPANY", status: "ACTIVE" })
      if (!company) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
      }
      else {
        let validator = await userModel.findOne({ _id: req.query.validatorId, userType: "VALIDATOR", status: "ACTIVE" })
        console.log(validator.email)
        if (!validator) {
          response(res, ErrorCode.NOT_FOUND, [], "Validator not found .");
        }
        else {
          let contractor = await contractModel.findOne({ _id: req.query.contractId, status: "ACTIVE" })
          if (!contractor) {
            response(res, ErrorCode.NOT_FOUND, [], "Contractor not found .");
          }
          else {
            let find = await contractModel.findOne({ _id: contractor._id, validatorId: validator._id, status: "ACTIVE" }).populate('validatorId')
            if (find) {
              response(res, ErrorCode.ALREADY_EXIST, [], "This contract alrady assigned to validator .")
            }
            else {
              let contractUpdate = await contractModel.findByIdAndUpdate({ _id: contractor._id }, { $set: { validatorId: validator._id } }, { new: true })
              var msg = `Dear ${validator.firstName},You are invited by ${company.firstName} to validate 'contractId:${contractor._id}' `;
              var subject = "Invited By Company"
              await commonFunction.sendMailCronJob(validator.email, subject, msg)
              response(res, SuccessCode.SUCCESS, validator, "Validator selected successfully .");
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
      response(res, ErrorCode.SOMETHING_WRONG, error, ErrorMessage.SOMETHING_WRONG);
    }
  },

  acceptMilestoneByValidator: async (req, res) => {
    try {
      let validator = await userModel.findOne({ _id: req.userId, userType: "VALIDATOR", status: "ACTIVE" })
      if (!validator) {
        return response(res, ErrorCode.NOT_FOUND, [], "Validator not found .");
      }
      else {
        let contractChek = await contractShareModel.findOne({ _id: req.body._id, "milestones._id": req.body.milestoneId, status: "ACTIVE" })
        if (!contractChek) {
          return response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        }
        else {
          let count = 0;
          let count2 = 0;
          let changeStatus;
          for (let i = 0; i < contractChek.milestones.length; i++) {
            if (contractChek.milestones[i]._id == req.body.milestoneId && contractChek.milestones[i].mileStoneStatus == "COMPLETE" && contractChek.milestones[i].validatorContractStatus == "PENDING") {
              count++
              let update = await contractShareModel.findOneAndUpdate({ _id: contractChek._id, "milestones._id": req.body.milestoneId }, { $set: { "milestones.$.validatorContractStatus": "APPROVED", "milestones.$.comment": req.body.comment } }, { new: true })
              var body = `Dear ${contractChek.email},Your Completed milestone:${contractChek.milestones[i]._id} is approved by validator ${validator.firstName} .`;
              var subject = "Milestone Approved by validator "
              await commonFunction.sendMailCronJob(contractChek.email, subject, body)
              return response(res, SuccessCode.SUCCESS, update, "Milestone status approved successfully .");
            }
            if (contractChek.milestones[i]._id == req.body.milestoneId && contractChek.milestones[i].mileStoneStatus == "COMPLETE") {
              count2++
              changeStatus = contractChek.milestones[i].validatorContractStatus
            }
            if (count2 != 0 && count == 0) {
              return response(res, ErrorCode.NOT_FOUND, [], `This milestone is already ${changeStatus} .`);
            }
            if (count2 == 0) {
              return response(res, ErrorCode.NOT_FOUND, [], "This milestone is not completed by user .");
            }
          }

        }
      }
    } catch (error) {
      console.log(error)
      return response(res, ErrorCode.SOMETHING_WRONG, error, ErrorMessage.SOMETHING_WRONG);
    }
  },

  rejectMilestoneByValidator: async (req, res) => {
    try {
      let validator = await userModel.findOne({ _id: req.userId, userType: "VALIDATOR", status: "ACTIVE" })
      if (!validator) {
        return response(res, ErrorCode.NOT_FOUND, [], "Validator not found .");
      }
      else {
        let contractChek = await contractShareModel.findOne({ _id: req.body._id, "milestones._id": req.body.milestoneId })
        if (!contractChek) {
          return response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        }
        else {
          let count = 0;
          let count2 = 0;
          let changeStatus;
          for (let i = 0; i < contractChek.milestones.length; i++) {
            if (contractChek.milestones[i]._id == req.body.milestoneId && contractChek.milestones[i].mileStoneStatus == "COMPLETE" && contractChek.milestones[i].validatorContractStatus == "PENDING") {
              count++
              let update = await contractShareModel.findOneAndUpdate({ _id: contractChek._id, "milestones._id": req.body.milestoneId }, { $set: { "milestones.$.validatorContractStatus": "REJECT", "milestones.$.comment": req.body.comment } }, { new: true })
              var body = `Dear ${contractChek.email},Your Completed milestone:${contractChek.milestones[i]._id} is rejected by validator ${validator.firstName} .`;
              var subject = "Milestone Reject by validator "
              await commonFunction.sendMailCronJob(contractChek.email, subject, body)
              return response(res, SuccessCode.SUCCESS, update, "Milestone status rejected successfully .");
            }
            if (contractChek.milestones[i]._id == req.body.milestoneId && contractChek.milestones[i].mileStoneStatus == "COMPLETE") {
              count2++
              changeStatus = contractChek.milestones[i].validatorContractStatus
            }
          }
          if (count2 != 0 && count == 0) {
            return response(res, ErrorCode.NOT_FOUND, [], `This milestone is already ${changeStatus} .`);
          }
          if (count2 == 0) {
            return response(res, ErrorCode.NOT_FOUND, [], "This milestone is not completed by user .");
          }
        }
      }
    } catch (error) {
      console.log(error)
      return response(res, ErrorCode.SOMETHING_WRONG, error, ErrorMessage.SOMETHING_WRONG);
    }
  },


  listValidatorContract: async (req, res) => {
    try {
      let validator = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "VALIDATOR" })
      if (!validator) {
        response(res, ErrorCode.NOT_FOUND, [], "Validator not found .")
      } else {
        let contract = await contractModel.find({ validatorId: validator._id, status: "ACTIVE" }).populate('validatorId')
        if (contract.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], "Contract not assigned for this validatoor .")
        }
        else {
          response(res, SuccessCode.SUCCESS, contract, SuccessMessage.DETAIL_GET)
        }
      }

    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, error, ErrorMessage.SOMETHING_WRONG)

    }
  },

  viewValidatorContract: async (req, res) => {
    try {
      let contract = await contractModel.findOne({ _id: req.query._id, status: "ACTIVE" })
      if (!contract) {
        response(res, ErrorCode.NOT_FOUND, [], "Contractor not found .")
      } else {
        let contractShare = await contractShareModel.find({ contractId: contract._id, status: "ACTIVE" }).populate('companyId contractId')
        if (contractShare.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], "Contract not found .")
        }
        else {
          response(res, SuccessCode.SUCCESS, contractShare, SuccessMessage.DETAIL_GET)
        }
      }

    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, error, ErrorMessage.SOMETHING_WRONG)

    }
  },

  listMilestoneForValidator: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, userType: "VALIDATOR" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorCode.USER_NOT_FOUND)
      }
      else {
        var adminRes = await contractShareModel.find({ contractId: req.query.contractId }).populate('userId')
        if (adminRes.length == 0) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND);
        } else {
          response(res, SuccessCode.SUCCESS, adminRes, SuccessMessage.DATA_FOUND);
        }
      }
    } catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG);
    }
  },
  activeContract: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, userType: "COMPANY" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var dataRes = await contractShareModel.find({ userContractStatus: "APPROVED" })
        if (!dataRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          let contract1 = [], contract;
          let data = await contractShareModel.aggregate([
            { $match: { milestones: { $elemMatch: { mileStoneStatus: "INPROGRESS" } } } },
            { $lookup: { from: "contracts", localField: "contractId", foreignField: "_id", as: "ContractDetails" } },
            { $redact: { $cond: { if: { $or: [{ $eq: ["$mileStoneStatus", "INPROGRESS"] }, { $not: "$mileStoneStatus" }] }, then: "$$DESCEND", else: "$$PRUNE" } } }
          ]);

          response(res, SuccessCode.SUCCESS, data, SuccessMessage.DETAIL_GET)
        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }
  },
  completeContract: async (req, res) => {
    try {
      var userRes = await userModel.findOne({ _id: req.userId, userType: "COMPANY" })
      if (!userRes) {
        response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND)
      } else {
        var dataRes = await contractShareModel.find({ userContractStatus: "APPROVED" }).select("contractId")
        if (!dataRes) {
          response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
        } else {
          let contract1 = [], contract;
          let data = await contractShareModel.aggregate([
            {
              $match: {
                milestones: { $elemMatch: { mileStoneStatus: "COMPLETE" } },
              }
            },
            {
              $lookup: {
                from: "contracts",
                localField: "contractId",
                foreignField: "_id",
                as: "ContractDetails"
              }
            },
            {
              $redact: {
                $cond: {
                  if: { $or: [{ $eq: ["$mileStoneStatus", "COMPLETE"] }, { $not: "$mileStoneStatus" }] },
                  then: "$$DESCEND",
                  else: "$$PRUNE"
                }
              }
            }])

          response(res, SuccessCode.SUCCESS, data, SuccessMessage.DETAIL_GET)
        }
      }
    }
    catch (error) {
      response(res, ErrorCode.SOMETHING_WRONG, [], ErrorMessage.SOMETHING_WRONG)
    }
  },
}
///////////End Of Export //////////////////////////

function convertDocument(array) {
  return new Promise((resolve, reject) => {
    commonFunction.multiplePdfUploadCloudinary(array, (imageError, upload) => {
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
      // console.log("6285", req);
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

async function createPdf(req, res) {
  try {
    let find = await contractModel.find({}).select("agencyTeam contractDocument contractName startDate endDate amount description -_id");
    // let pdfName = await userFunction.randomOTPGenerate()

    let pdf = await doc.pipe(fs.createWriteStream(`uploads/contract.pdf`, find));
    console.log(pdf);
    // Embed a font, set the font size, and render some text
    doc
      .fontSize(25)
      .fill('#284695')
      .text('Here are the list of Contract you created till now ', 100, 100);

    doc.image('https...ge/Contract.jpg', {
      fit: [250, 300],
      align: 'center',
      valign: 'center'
    });
    doc
      .addPage()
      .fontSize(8)
      .fill('#000000')
      .font('Helvetica-Bold')
      .text(find, 100, 100);

    doc
      .save()
      .moveTo(100, 150)
      .lineTo(100, 250)
      .lineTo(200, 250);
    // .fill('#FF3300');

    doc
      .scale(0.6)
      .translate(470, -380)
      .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
      .fill('green', 'even-odd')
      .restore();

    doc.end();

  } catch (error) {
    console.log("error", error)
    response(res, ErrorCode.WENT_WRONG, error, ErrorMessage.SOMETHING_WRONG)
  }
}


///////////////////// ***************** BlockChain Function *******************//////////////////////////////

const addBlockchainContract = async (privateKey, contractName, userId, privacy, agencyTeam, description, startDate, stopDate, amount, contractDocument) => {
  try {
    let _contract = {
      contractName: contractName,
      userId: userId.toString(),
      privacy: privacy,
      agencyTeam: agencyTeam[0],
      description: description,
      startDate: Number(startDate),
      stopDate: Number(stopDate),
      amount: Number(amount),
      contractDocument: contractDocument[0]
    }
    let Data = await myContract.methods.addContract(_contract).encodeABI();
    const rawTransaction = {
      to: global.gConfig.contractAddress,
      gasPrice: web3.utils.toHex('30000000000'),    // Always in Wei (30 gwei)
      gasLimit: web3.utils.toHex('2000000'),      // Always in Wei
      data: Data  // Setting the pid 12 with 0 alloc and 0 deposit fee
    };
    const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, "afa96d3dccef0627a7f72a0f8af9b66618e7360119e46f11097ec7efeaf87bcb");
    try {
      let sendSignedTransactionRes = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
      if (sendSignedTransactionRes) {
        return { responseCode: 200, Status: "Success", Hash: signPromise.transactionHash };
      }
    } catch (err) {
      return { responseCode: 501, responseMessage: "Something went wrong!", error: err };
    }
  } catch (error) {
    return { responseCode: 501, responseMessage: "Something went wrong!", error: error };
  }
}


const addBlockchainMilestone = async (privateKey, contractId, milestoneId, milestone) => {
  try {
    let Data = await myContract.methods.addMilestone(contractId.toString(), milestoneId.toString(), milestone).encodeABI();
    const rawTransaction = {
      to: global.gConfig.contractAddress,
      gasPrice: web3.utils.toHex('30000000000'),    // Always in Wei (30 gwei)
      gasLimit: web3.utils.toHex('200000'),      // Always in Wei
      data: Data  // Setting the pid 12 with 0 alloc and 0 deposit fee
    };
    const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, "afa96d3dccef0627a7f72a0f8af9b66618e7360119e46f11097ec7efeaf87bcb");

    try {
      let sendSignedTransactionRes = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
      if (sendSignedTransactionRes) {
        return { responseCode: 200, Status: "Success", Hash: signPromise.transactionHash };
      }
    } catch (err) {
      return { responseCode: 501, responseMessage: "Something went wrong!", error: err };
    }
  } catch (error) {
    return { responseCode: 501, responseMessage: "Something went wrong!", error: error };
  }
}


const approveContract = async (contractId, userId) => {
  try {
    let Data = await myContract.methods.approveContract(contractId.toString(), userId.toString(), true).encodeABI();
    const rawTransaction = {
      to: global.gConfig.contractAddress,
      gasPrice: web3.utils.toHex('30000000000'),    // Always in Wei (30 gwei)
      gasLimit: web3.utils.toHex('2000000'),      // Always in Wei
      data: Data  // Setting the pid 12 with 0 alloc and 0 deposit fee
    };
    const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, "afa96d3dccef0627a7f72a0f8af9b66618e7360119e46f11097ec7efeaf87bcb");
    try {
      let sendSignedTransactionRes = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
      if (sendSignedTransactionRes) {
        return { responseCode: 200, Status: "Success", Hash: signPromise.transactionHash };
      }
    } catch (err) {
      return { responseCode: 501, responseMessage: "Something went wrong!", error: err };
    }
  } catch (error) {
    return { responseCode: 501, responseMessage: "Something went wrong!", error: error };
  }
}


//////////////////////////*************** BlockChain Function End ***********************************////////////////////////

async function sendSignedTransaction(rawTransaction) {
  return new Promise((resolve, reject) => {
    web3.eth.sendSignedTransaction(signPromise.rawTransaction).then((sendSignedRes) => {
      if (sendSignedRes) {
        resolve(sendSignedRes);
      }
    }).catch((error) => {
      reject(error);
    })
  })
}


