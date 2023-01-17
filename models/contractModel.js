const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const bcrypt = require("bcrypt-nodejs");
const { isString } = require("lodash");
const schema = mongoose.Schema;
var contractModel = new schema({
    milestoneId: {
        type: mongoose.Types.ObjectId,
        ref: 'milestone'
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    contractName: {
        type: String
    },
    profilePic: {
        type: String
    },
    agencyTeam: [{
        type: String
    }],
    contractDocument: [{
        type: String
    }],
    privacy: {
        type: String,
        enum: ["PUBLIC", "PRIVATE"],
        default: "PUBLIC"
    },
    validatorEmail: {
        type: String
    },
    email: {
        type: String
    },
    validatorUserName: {
        type: String
    },
    clientUserName: {
        type: String
    },
    description: {
        type: String
    },
    amount: {
        type: String
    },
    startDate: {
        type: String
    },
    endDate: {
        type: String
    },
    validatorId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    // attachment: [],
    // milestones: [{
    //     type: String
    // }],

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
        mileStoneStatus: {
            type: String,
            enum: ["INPROGRESS", "COMPLETE", "INACTIVE", "APPROVED"],
            default: "INPROGRESS"
        },
        milestoneChangeApprovalStatus: {
            type: String,
            enum: ["PENDING", "DEFAULT", "APPROVE"],
            default: "DEFAULT"
        },
    }],
    maillist: [
        String
    ],
    freelancerId: [
        String
    ],
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },

    validatorContractStatus: {
        type: String,
        enum: ["PENDING", "REJECT", "APPROVED"],
        default: "PENDING"
    },
    // userContractStatus: {
    //     type: String,
    //     enum: ["PENDING", "REJECT", "APPROVED"],
    //     default: "PENDING"
    // },
    notification: {
        type: Boolean,
        default: true
    },

    favouriteContract: [{
        type: schema.Types.ObjectId,
        ref: "user"
    }],
},
    { timestamps: true }
);
contractModel.plugin(mongoosePaginate);
module.exports = mongoose.model("contract", contractModel)
