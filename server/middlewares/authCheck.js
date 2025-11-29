const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req, res,next) => {
    const token=req.headers.authorization?.split(" ")[1]
    const verify=jwt.verify(token,process.env.JWT_SECRET)
    if (!verify) {
        res.json({
            msg:'Invalid token',
        })
    } else {
        next()
    }
} 