const planModel = require('../models/planModel');
const commonFunction = require('../helper/commonFunction');
const userModel = require('../models/userModel');
const cronJob = require('cron').CronJob;


new cronJob('*/1 * * * * *', async function () {
    var plansFind = await planModel.find()
    if (plansFind.length == 0) {
        console.log("No data available .")
    } else {
        for (let index = 0; index < plansFind.length; index++) {
            let enterprisePlans = await planModel.find({ _id: plansFind[index]._id, planType: "ENTERPRISE", status: "ACTIVE" })
            console.log(enterprisePlans.length)
            if (enterprisePlans.length == 0) {
                console.log("No data available of Enterprise plans  .")
            } else {
                for (let index = 0; index < enterprisePlans.length; index++) {
                    let startEnterpriseTime = enterprisePlans[index].startPlans;
                    let endEnterpriseTime = startEnterpriseTime + 31557600000;
                    let Day_363 = endEnterpriseTime - 172800000;
                    let expireEnterprisetime = new Date().getTime();
                    if (Day_363 == expireEnterprisetime) {
                        let expiredTime = new Date(endEnterpriseTime).toISOString();
                        let userResult = await userModel.findOne({ _id: enterprisePlans[index][index].userId })
                        let subject = "Plan will be expire soon !! 😟 ";
                        let message = `Thank you for choosing <b> Smart Contract as Service Plateform </b>. <br>	
                         Your subscription plan id: ${enterprisePlans[index].subscriptionId}.  <br>		
                         Your subscription plan Type: ${enterprisePlans[index].planType} will be  expire within 2 days.<br>		
                         With amount of $${enterprisePlans[index].amount}. <br>
                         This plan will be expire on ${expiredTime}. <br>
                         Please Renew your plan before expired.`;
                        await commonFunction.sendMailCronJob(userResult.email, subject, message);
                    }
                    if (endEnterpriseTime <= expireEnterprisetime) {
                        await planModel.findByIdAndUpdate({ _id: enterprisePlans[index]._id }, { $set: { status: "BLOCK" } });
                        let userResult = await userModel.findOne({ _id: enterprisePlans[index].userId })
                        let expiredTime = new Date(endEnterpriseTime).toISOString();
                        let subject = "Plan expired !! 😞 ";
                        let message = `Thank you for choosing <b> Smart Contract as Service Plateform </b>. <br>	
                        Your subscription plan id: ${enterprisePlans[index].subscriptionId}  <br>	
                        Your subscription plan Type: ${enterprisePlans[index].planType} <b> has expired</b>. <br>
                        With amount of $${enterprisePlans[index].amount}.  <br>
                        Please Renew your plan for Add more Contract.`;
                        await commonFunction.sendMailCronJob(userResult.email, subject, message);
                        console.log("Enterprise plans has been expired.")
                    }
                    else {
                        console.log("Enterprise plans not expired.")
                    }
                }
            }
        }
    }
// }).start()
}).stop()