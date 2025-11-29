const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    designation: String,
    profilePicId: String,
    bio: String,
    isAdmin: { type: Boolean, default: false },
    skills: [{ type: String }], 
    coursesEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    gigOrders: [{
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gig'
        },
        status: {
            type: String,
            default: 'pending'
        }
    }],
    gigs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig'
    }],
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    profilePic: {
        type: String,
        default: 'https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png?w=256'
    },
    profilePicId: {
        type: String,
        default: null
    },
    resetPassword: {
        code: { type: String, default: null },
        expiry: {
            type: Date,
            default: () => new Date(Date.now() + 5 * 60 * 1000) 
        }
    }
});


module.exports = mongoose.model('User', userSchema)
