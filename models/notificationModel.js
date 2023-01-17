const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var schema = mongoose.Schema;
var notificationKey = new schema({
    userId: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: "https://res.cloudinary.com/dkoznoze6/image/upload/v1563943105/n7zdoyvpxxqhexqybvkx.jpg"
    },
    notificationType: {
        type: String
    },
    date: {
        type: String,
        
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
}, {
    timestamps: true
})

notificationKey.plugin(mongoosePaginate);
module.exports = mongoose.model("notification", notificationKey)