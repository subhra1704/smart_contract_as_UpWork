const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var schema = mongoose.Schema;
var staticKey = new schema({
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    type: {
        type: String
    },
    title: {
        type: String,
    },

    description: {
        type: String,
    },
    image: {
        type: String
    },
},
    {
        timestamps: true
    })

staticKey.plugin(mongoosePaginate);
module.exports = mongoose.model("static", staticKey)

mongoose.model("static", staticKey).find({}, (err, result) => {
    if (err) {
        console.log("Default static content error", err);
    }
    else if (result.length != 0) {
        console.log("Default static content");
    }
    else {
        var obj1 = {
            type: "T&C",
            title: "Terms & Conditions",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget"
        };
        var obj2 = {
            type: "PrivacyPolicy",
            title: "Privacy Policy",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget."
        };
        var obj3 = {
            type: "AboutUs",
            title: "About Us",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget.",
        };
        var obj4 = {
            type: "ContactUs",
            title: "Contact Us",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget.",
        };


        mongoose.model("static", staticKey).create(obj1, obj2, obj3, obj4, (staticErr, staticResult) => {
            if (staticErr) {
                console.log("Static content error.", staticErr);
            }
            else {
                console.log("Static content created.", staticResult)
            }
        })
    }
})