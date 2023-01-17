const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const bcrypt = require("bcrypt-nodejs");
const commonFunction = require('../helper/commonFunction');
const schema = mongoose.Schema;
var userModel = new schema(
  {
    userCode: {
      type: String
    },
    userName: {
      type: String
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    mobileNumber: {
      type: String
    },
    email: {
      type: String
    },
    password: {
      type: String
    },
    dateOfBirth: {
      type: String
    },
    address: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    countryCode: {
      type: String
    },
    zipCode: {
      type: String
    },
    agencyTeam: {
      type: String
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Trans"]
    },
    profilePic: {
      type: String,
      default: ""
    },
    otp: {
      type: Number
    },
    emailVerification: {
      type: Boolean,
      default: false
    },
    otpVerification: {
      type: Boolean,
      default: false
    },
    otpTime: {
      type: Number
    },

    deviceType: {
      type: String
    },
    deviceToken: {
      type: String
    },
    message: {
      type: String
    },
    notification: {
      type: Boolean,
      default: true
    },
    permissions: {
      validatorManagement: {
        type: Boolean,
        default: false
      },
      dashboardManagement: {
        type: Boolean,
        default: false
      },
      clientManagement: {
        type: Boolean,
        default: false
      },
      contractManagement: {
        type: Boolean,
        default: false
      },
      notificationManagement: {
        type: Boolean,
        default: false
      },
      staticContentManagement: {
        type: Boolean,
        default: false
      },
      planManagement: {
        type: Boolean,
        default: false
      },
      transactionManagement: {
        type: Boolean,
        default: false
      },
    },
    token: {
      type: String
    },

    userType: {
      type: String,
      enum: ["ADMIN", "COMPANY", "SUBADMIN", "VALIDATOR", "FREELANCER"],
      default: "FREELANCER",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCK", "DELETE"],
      default: "ACTIVE"
    },
    validateStatus: {
      type: String,
      enum: ["DRAFT", "VALIDATION", "COMPLETED", "ACTIVE", "INREVIEW"],
      default: "ACTIVE"
    },
  },
  { timestamps: true }
);

userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("users", userModel);

mongoose.model("users", userModel).find({ userType: "ADMIN" }, async (err, result) => {
  if (err) {
    console.log("DEFAULT ADMIN ERROR", err);
  }
  else if (result.length != 0) {
    console.log("Default Admin.");
  }
  else {
    let obj = {
      userType: "ADMIN",
      firstName: "Subhra",
      lastName: "Rai",
      userName: "SubhraRai",
      countryCode: "+91",
      mobileNumber: "9935976078",
      email: "no-subhra@mobiloitte.com",
      dateOfBirth: "04/10/1999",
      gender: "Female",
      password: bcrypt.hashSync("Mobiloitte@1"),
      address: "Varansi, UP, India",
      contractAddress: "0x7a1103c278547a44d73dee74a4d59b583ec2c8cd",
      profilePic: "https://res.cloudinary.com/mobiloitte-testing/image/upload/v1607430771/i56tnqvvwpzguxwarfjf.jpg",
      permissions: {
        validatorManagement: true,
        dashboardManagement: true,
        clientManagement: true,
        contractManagement: true,
        notificationManagement: true,
        staticContentManagement: true,
        transactionManagement: true,
        planManagement: true
      },
    };

    mongoose.model("users", userModel).create(obj, async (err1, result1) => {
      if (err1) {
        console.log("DEFAULT ADMIN  creation ERROR", err1);
      } else {
        // const ethAvtWallet = await commonFunction.createWalletETH_AVT(result1._id, result1.userType);
        // console.log("187", ethAvtWallet);
        console.log("DEFAULT ADMIN Created");
      }
    });
  }
});
