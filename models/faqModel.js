const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var schema = mongoose.Schema;
var faqModel = new schema({    
    question: {
        type: String
    },
    answer: {
        type: String
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

faqModel.plugin(mongoosePaginate);
module.exports = mongoose.model("faq", faqModel);
mongoose.model("faq", faqModel).find({}, (err, result) => {
    if (err) {
        console.log("Default static plan error", err);
    }
    else if (result.length != 0) {
        console.log("Default static faq content");
    }
    else {
        var obj1 = {
            question: "What are Smart Contracts?" ,
            answer: "A smart contract is a set of promises, specified in digital form,” explains Nick Szabo, [1] the computer scientist who originated the concept in 1996."
        };
        var obj2 = {
            question: "Can Smart Contracts Be Trusted?",
            answer: "n a presentation by Nick Szabo entitled Smart Contracts [4], a smart contract is likened to a coin-operated vending machine where the payment is held in a type of escrow by the vending machine until the desired item is selected then the money is transferred to the vendor as the commodity is dispensed to the purchaser, all without the human intervention of a third party. The vending machine itself, similar to a smart contract, serves as the third party."
        };
        var obj3 = {
            question: "Can Smart Contracts Communicate with External Parties?",
            answer: "Yes! However, “the executing logic in a smart contract cannot do anything outside of the blockchain,” explains Adam Gall writing for DecentCrypto. “The only way to update blockchain state is to trigger that state change by sending a new transaction into the system.” The way information regarding fulfillment of elements of a smart contract is inserted is through use of an oracle, a web service that “provides ‘trusted’ data to a smart contract, through transactions.”"
        };
       
        mongoose.model("faq", faqModel).create(obj1,obj2, obj3, (staticErr, staticResult) => {
            if (staticErr) {
                console.log("Static content faq error.", staticErr);
            }
            else {
                console.log("Static content faq created.", staticResult)
            }
        })
    }
})