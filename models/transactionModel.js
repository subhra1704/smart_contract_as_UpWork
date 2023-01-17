const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var schema = mongoose.Schema;
var transactionSchema = new schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: "users"
    },
    subscriptionId: {
        type: schema.Types.ObjectId,
        ref: "subscription"
    },
    paymentDate: {
        type: String
    },
    chargeId: {
        type: String
    },
    amount: {
        type: Number
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "SUCCESS", "REFUNDED", "FAILED"],
        default: "PENDING"
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
}, {
    timestamps: true
})

transactionSchema.plugin(mongoosePaginate);
transactionSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("transaction", transactionSchema)
