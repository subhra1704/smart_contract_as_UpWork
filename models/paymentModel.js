const mongoose = require('mongoose')
// const mongoosePaginate = require('mongoose-Paginate')
const paymentKey = new mongoose.Schema({
    transactionId: {
        type: String
    },
    userId: {
        type: String
    },
   
    receiptNumber: {
        type: String
    },
    chargeId: {
        type: String
    },
    receiptUrl: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ["Success", "Pending", "Cancel", "Refund", "Completed"],
        default: "Success"
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    amount: {
        type: Number
    },
    cancelDate: {
        type: String
    },
    currency: {
        type: String
    },
    description: {
        type: String
    },
    cardNumber: {
        type: String
    },
    month: {
        type: String
    },
    year: {
        type: String
    },
    cvc: {
        type: Number
    }
},
    {
        timestamps: true

    })
module.exports = mongoose.model('payment', paymentKey)