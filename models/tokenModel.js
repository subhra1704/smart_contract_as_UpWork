const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = mongoose.Schema;
var tokenSchema = new schema(
    {
        tokenName: {
            type: String
        },
        tokenImage: {
            type: String
        },
        contractAddress: {
            type: String
        },
        decimal: {
            type: Number
        },
        price: {
            type: Number
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        }
    },
    { timestamps: true }
);

tokenSchema.plugin(mongoosePaginate);
tokenSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("token", tokenSchema);

mongoose.model("token", tokenSchema).find((err, result) => {
    if (err) {
        console.log("Default token error", err);
    }
    else if (result.length != 0) {
        console.log("Default token");
    }
    else {
        var obj = {
            tokenName: "Token",
            tokenImage: "https://res.cloudinary.com/mobiloitte-testing/image/upload/v1612846159/fwmmc9ocbadutbfqqm9j.png",
            price: 10,
            decimal: 18
        };

        mongoose.model("token", tokenSchema).create(obj, (err1, tokenResult) => {
            if (err1) {
                console.log("Token error.", err1);
            }
            else {
                console.log("Token created.", tokenResult)
            }
        })
    }
})