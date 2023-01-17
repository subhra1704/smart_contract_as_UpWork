const mongoose = require("mongoose");
const schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");

var plan = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: "users"
        },
        subscriptionId: {
            type: schema.Types.ObjectId,
            ref: "subscription"
        },
        planType: {
            type: String
        },
        amount: {
            type: String
        },
        planName: {
            type: String
        },
        validatorAdded: {
            type: Number,
            default: 0
        },
        milestoneAdded: {
            type: Number,
            default: 0
        },
        contractAdded: {
            type: Number,
            default: 0
        },
        startPlans:{
            type: Number,   
        },
        endPlans:{
            type: Number,   
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

plan.plugin(mongoosePaginate);
module.exports = mongoose.model("plan", plan);