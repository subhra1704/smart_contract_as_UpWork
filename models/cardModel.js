const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var schema = mongoose.Schema;
var cardModel = new schema({
    accountHolderName: {
        type: String
    },
    cardNumber: {
        type: String
    },
    expiryDate: {
        type: String
    },
    cvv: {
        type: String
    },
    postCode: {
        type: String
    },
    cardType: {
        type: String,
        enum: ["CREDIT", "DEBIT"]
    },
    defaultCard: {
        type: Boolean,
        default: true
    },
    customerId: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    transactionStatus: {
        type: String,
        enum: ["PENDING", "COMPLETED", "REFUNDED"],
        default: "PENDING"
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
},
    {
        timestamps: true
    })

cardModel.plugin(mongoosePaginate);
module.exports = mongoose.model("card", cardModel)