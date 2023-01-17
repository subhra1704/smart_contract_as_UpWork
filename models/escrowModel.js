const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const bcrypt = require("bcrypt-nodejs");
const { isString } = require("lodash");
const schema = mongoose.Schema;
var escrowModel = new schema({
    userId:{
        type: String
    },
    firstName:{
      type: String
    },
    parties:[{
     role:{
        type: String
      },
      customer:{
        type: String
      },
      currency:{
      type: String
      },
      description:{
        type: String
      },
      items:[{
        title:{
          type: String
        },
        description:{
          type: String
        },
        inspection_period:{
          type: String
        },
        quantity:{
          type: String
        },
        schedule:[{
          amount:{
            type: String
          },
          payer_customer:{
            type: String
          },
          beneficiary_customer:{
            type: String
          }
        }]
        
      }]

     }],
},
  { timestamps: true }
);
escrowModel.plugin(mongoosePaginate);
module.exports = mongoose.model("escrow", escrowModel)