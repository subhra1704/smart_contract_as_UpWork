const userModel = require('../models/userModel');
const commonFunction = require("../helper/commonFunction");
const transactionModel = require('../models/transactionModel');
const subscriptionModel = require('../models/subscriptionModel')
const { commonResponse: response } = require('../helper/commonResponseHandler');
const { ErrorMessage } = require('../helper/message');
const { SuccessMessage } = require('../helper/message');
const { ErrorCode } = require('../helper/statusCode');
const { SuccessCode } = require('../helper/statusCode');
const planModel = require("../models/planModel");
// const stripe = require('stripe')('sk_test_51J40NISHXHqrNtWa5vKHV24aCJuhIcD7s7UCldOgxeeML6NyI9Ds3eZoZIiodt4yXZcjpSaJJOlym7WSoX2RyT1e00yeMC47LU')
const stripe = require('stripe')('sk_test_LBKlAsWDMrZ7FTcXKkH9iatQ00tS0lPXG3');

module.exports = {
    payment: async (req, res) => {
        try {
            console.log(req.body)
            var updated, transSaved, planCheck;
            var userRes = await userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: { $in: ["COMPANY", "FREELANCER"] } })
            if (!userRes) {
                response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.USER_NOT_FOUND);
            } else {
                var subscriptionRes = await subscriptionModel.findOne({ _id: req.body._id, status: "ACTIVE" })
                if (!subscriptionRes) {
                    response(res, ErrorCode.NOT_FOUND, [], ErrorMessage.NOT_FOUND)
                } else {
                    var updateObj = {
                        subscriptionId: subscriptionRes._id,
                        planType: subscriptionRes.planType,
                        planName: subscriptionRes.planName,
                        amount: subscriptionRes.amount,
                        startPlans: new Date().getTime(),
                        endPlans: (new Date().getTime()) + 31557600000
                    }
                    var incrementObj = {
                        validatorAdded: subscriptionRes.validatorAdded,
                        milestoneAdded: subscriptionRes.milestoneAdded,
                        contractAdded: subscriptionRes.contractAdded
                    }
                    // if (subscriptionRes.planType == "PRO" || subscriptionRes.planType == "ENTERPRISE") {
                        if (subscriptionRes.planType == "ENTERPRISE") {
                        var token = await stripe.tokens.create({
                            card: {
                                number: req.body.cardNumber ? req.body.cardNumber : "4242 4242 4242 4242",
                                exp_month: req.body.exp_month ? req.body.exp_month : 12,
                                exp_year: req.body.exp_year ? req.body.exp_year : 2025,
                                cvc: req.body.cvv ? req.body.cvv : 223
                            },
                        });
                        var charge = await stripe.charges.create({
                            amount: subscriptionRes.amount,
                            currency: 'usd',
                            source: token.id,
                            description: 'Plan charge',
                        });
                        console.log("===51", charge, token)
                        var transObj = {
                            userId: userRes._id,
                            subscriptionId: subscriptionRes._id,
                            amount: subscriptionRes.amount,
                            paymentDate: new Date().toISOString(),
                            chargeId: charge.id,
                            paymentStatus: "SUCCESS"
                        };
                        var responseRes = {
                            userId: userRes._id,
                            subscriptionId: subscriptionRes._id,
                            planType: subscriptionRes.planType,
                            planName: subscriptionRes.planName,
                            amount: subscriptionRes.amount,
                            paymentDate: new Date().toISOString(),
                            chargeId: charge.id,
                            paymentStatus: "SUCCESS"
                        }
                        planCheck = await planModel.findOne({ userId: userRes._id, status: "ACTIVE" });
                        if (planCheck) {
                            updated = await planModel.findByIdAndUpdate({ _id: planCheck._id }, { $set: updateObj, $inc: incrementObj }, { new: true });
                            if (updated) {
                                transSaved = await new transactionModel(transObj).save();
                                if (transSaved) {
                                    let expired1= updated.startPlans + 31557600000;
                                    let expiredTime = new Date(expired1).toISOString();
                                    let subject = "Thanks For Subscription !😀";
                                    let message = `Thank you for choosing <b> Smart Contract as Service Plateform </b>. <br> 
                                    Your subscription plan id: ${updated.subscriptionId} <br>
                                    Your subscription plan Type: ${updated.planType}.<br>
                                    with amount of $${updated.amount}<br>
                                    This plan will be expire on ${expiredTime}`;
                                    await commonFunction.sendMailCronJob(userRes.email, subject, message);
                                    response(res, SuccessCode.SUCCESS, responseRes, SuccessMessage.SUCCESS)
                                }
                            }
                        } else {
                            var saved = await new planModel({
                                subscriptionId: subscriptionRes._id,
                                userId: userRes._id,
                                amount: subscriptionRes.amount,
                                planType: subscriptionRes.planType,
                                planName: subscriptionRes.planName,
                                validatorAdded: subscriptionRes.validatorAdded,
                                milestoneAdded: subscriptionRes.milestoneAdded,
                                contractAdded: subscriptionRes.contractAdded,
                                startPlans: new Date().getTime(),
                                endPlans: (new Date().getTime()) + 31557600000
                            }).save();
                            if (saved) {
                                transSaved = await new transactionModel(transObj).save();
                                if (transSaved) {
                                    let expired1= saved.startPlans + 31557600000;
                                    let expiredTime = new Date(expired1).toISOString();
                                    let subject = "Thanks For Subscription !😀";
                                    let message = `Thank you for choosing <b> Smart Contract as Service Plateform </b>. <br> 
                                    Your subscription plan id: ${saved.subscriptionId} <br>
                                    Your subscription plan Type: ${saved.planType}.  <br>
                                    with amount of $${saved.amount}. <br>
                                    This plan will be expire on ${expiredTime}. <br>`
                                    await commonFunction.sendMailCronJob(userRes.email, subject, message);
                                    response(res, SuccessCode.SUCCESS, responseRes, SuccessMessage.SUCCESS)
                                }
                            }
                        }
                    } else {
                        planCheck = await planModel.findOne({ userId: userRes._id, status: "ACTIVE" })
                        if (planCheck) {
                            updated = await planModel.findByIdAndUpdate({ _id: planCheck._id }, { $set: updateObj, $inc: incrementObj }, { new: true });
                            if (updated) {
                                transSaved = await new transactionModel(transObj).save();
                                if (transSaved) {
                                    let expired1= updated.startPlans + 31557600000;
                                    let expiredTime = new Date(expired1).toISOString();
                                    let subject = "Thanks For Subscription !😀";
                                    let message = `Thank you for choosing <b> Smart Contract as Service Plateform </b>.<br>
                                     Your subscription plan id: ${updated.subscriptionId}<br>
                                     Your subscription plan Type: ${updated.planType}.<br>
                                     with amount of $${updated.amount}. <br>
                                     This plan will be expire on ${expiredTime} <br>`;
                                    await commonFunction.sendMailCronJob(userRes.email, subject, message);
                                    response(res, SuccessCode.SUCCESS, responseRes, SuccessMessage.SUCCESS)
                                }
                            }
                        } else {
                            var saved1 = await new planModel({
                                subscriptionId: subscriptionRes._id,
                                userId: userRes._id,
                                amount: subscriptionRes.amount,
                                planType: subscriptionRes.planType,
                                planName: subscriptionRes.planName,
                                validatorAdded: subscriptionRes.validatorAdded,
                                milestoneAdded: subscriptionRes.milestoneAdded,
                                contractAdded: subscriptionRes.contractAdded,
                                startPlans: new Date().getTime(),
                                endPlans: (new Date().getTime()) + 31557600000
                            }).save();
                            if (saved1) {
                                transSaved = await new transactionModel(transObj).save();
                                if (transSaved) {
                                    let expired1= saved1.startPlans + 31557600000;
                                    let expiredTime = new Date(expired1).toISOString();
                                    let subject = "Thanks For Subscription !😀";
                                    let message = `Thank you for choosing <b> Smart Contract as Service Plateform </b>. <br> 
                                    Your subscription plan id: ${saved1.subscriptionId}<br>
                                    Your subscription plan Type: ${saved1.planType}.<br>
                                    with amount of $${saved1.amount}. <br>
                                    This plan will be expire on ${expiredTime} <br>`;
                                    await commonFunction.sendMailCronJob(userRes.email, subject, message);
                                    response(res, SuccessCode.SUCCESS, responseRes, SuccessMessage.SUCCESS)
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.log("===30", error)
            return res.send({ responseCode: 500, responseMessage: "Something went wrong.", error: error })
        }
    },


    // End of exports
}