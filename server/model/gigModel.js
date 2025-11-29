const mongoose=require('mongoose')

const gigSchema=mongoose.Schema({
    title:String,
    description:String,
    category:String,
    price:Number,
    deliveryTime:String,
    images:[String],
    orders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
      }],
    reviews:[{
          userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
          createdAt:{type:Date,default:Date.now},
          comment:String,
          stars:Number
        }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
      },
    createdDate:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model('Gig',gigSchema)
