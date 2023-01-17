const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const bcrypt = require("bcrypt-nodejs");
const { isString } = require("lodash");
const schema = mongoose.Schema;
var contractShareModel = new schema({
    milestoneId: {
        type: mongoose.Types.ObjectId,
        ref: 'milestone'
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    freelancerId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    companyId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    contractId: {
        type: mongoose.Types.ObjectId,
        ref: 'contract'
    },
    maillist: [
        String
    ],
    email: {
        type: String
    },
    milestoneChangeApprovalStatus: {
        type: String,
        enum: ["PENDING", "DEFAULT", "APPROVE"],
        default: "DEFAULT"
    },
    userContractStatus: {
        type: String,
        enum: ["PENDING", "REJECT", "APPROVED"],
        default: "PENDING"
    },

    // milestones: [{
    //     type: Array
    // }
    // ],

    milestones: [{
        milestone: {
            type: String,
        },
        taskName: {
            type: String
        },
        // assignee: {
        //     type: String
        // },
        dueDate: {
            type: String
        },
        amount: {
            type: String
        },
        description: {
            type: String
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "LOW"
        },
        comment:{
            type:String
        },
        validatorContractStatus: {
            type: String,
            enum: ["PENDING", "REJECT", "APPROVED"],
            default: "PENDING"
        },
        mileStoneStatus: {
            type: String,
            enum: ["INPROGRESS", "COMPLETE", "INACTIVE", "APPROVED"],
            default: "INPROGRESS"
        },
    }],
   
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
},


    { timestamps: true }
);
contractShareModel.plugin(mongoosePaginate);
module.exports = mongoose.model("contractShare", contractShareModel)
