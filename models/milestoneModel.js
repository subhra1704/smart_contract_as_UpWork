const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const bcrypt = require("bcrypt-nodejs");
const { isString } = require("lodash");
const schema = mongoose.Schema;
var milestoneModel = new schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    contractId: {
        type: mongoose.Types.ObjectId,
        ref: 'contract'
    },
    milestones:[{
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
        amount:{
            type: String
        },
        description:{
            type: String
        },
        milestoneChangeApprovalStatus: {
            type: String,
            enum: ["PROCESSING", "REJECT","DEFAULT", "APPROVE"],
            default:"DEFAULT"
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "LOW"
        },
        mileStoneStatus:{
            type: String,
            enum:["INPROGRESS","COMPLETE","INACTIVE","APPROVED"],
            default:"INPROGRESS"
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
milestoneModel.plugin(mongoosePaginate);
module.exports = mongoose.model("milestone", milestoneModel)
