const mongoose = require("mongoose");
const schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");

var subscriptionModel = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: "users"
        },
        planName: {
            type: String
        },
        planType: {
            type: String
            
        },
        currency:{
            type: String
        },
        
        validatorAdded:{
            type: Number,
            default: 0
        },
        milestoneAdded:{
            type: Number,
            default: 0
        },
        contractAdded:{
            type: Number,
            default: 0

        },
        amount: {
            type: Number
        },
        status: {
            type: String,
            enum: ["ACTIVE", "DELETE", "BLOCK"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);
subscriptionModel.plugin(mongoosePaginate);
module.exports = mongoose.model("subscription", subscriptionModel);
mongoose.model("subscription", subscriptionModel).find({}, (err, result) => {
    if (err) {
        console.log("Default static plan error", err);
    }
    else if (result.length != 0) {
        console.log("Default static plan content");
    }
    else {
        var obj1 = {
            planType: "FREE",
            planName: "FREE PLAN",
            // validatorAdded: 1,
            milestoneAdded: 0,
            contractAdded: 1,
            currency:"$",
            amount: 0,
        };
        // var obj2 = {
        //     planType: "PRO",
        //     planName: "PRO PLAN",
        //     validatorAdded: 10,
        //     milestoneAdded: 0,
        //     contractAdded: 10,
        //     currency:"$",
        //     amount: 500,
        // };
        var obj3 = {
            planType: "ENTERPRISE",
            planName: "ENTERPRISE PLAN",
            // validatorAdded: 0 ,
            milestoneAdded: 0,
            contractAdded: 0,
            currency:"$",
            amount: 1000,
        };
       
        mongoose.model("subscription", subscriptionModel).create(obj1, obj3, (staticErr, staticResult) => {
            if (staticErr) {
                console.log("Static content Plan error.", staticErr);
            }
            else {
                console.log("Static content Plan created.", staticResult)
            }
        })
    }
})