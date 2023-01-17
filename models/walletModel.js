const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const bcrypt = require("bcrypt-nodejs");
const schema = mongoose.Schema;
var walletSchema = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: "users"
        },
        userType:{
            type:String,
            enum: ["ADMIN","COMPANY","FREELANCER","SUBADMIN","VALIDATOR","USER"],
            default: "FREELANCER",
        },    
        walletAddress: {
            type: String
        },
        currency: {
            type: String,
            enum: ["BTC", "ETH","AVT"],
            default: "ETH"
        },
        
        coinTitle:{
            type: String,
            enum:["Ethereum","Bitcoin","Aventus"],
            default:"Ethereum"
        },
        privateKey: {
            type: String
        },
        coinImage:{
            type: String
        },
        token: {
            type: String
        },
        amount: {
            type: String
        },
        walletAddressQRCode:{
            type: String
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
    },
    { timestamps: true }
);

walletSchema.plugin(mongoosePaginate);
walletSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("wallet", walletSchema);