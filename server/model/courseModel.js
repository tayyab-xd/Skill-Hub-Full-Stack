const mongoose=require('mongoose')

const courseSchema=mongoose.Schema({
    title:String,
    description:String,
    category:String,
    thumbnail:String,
    thumbnailId:String,
    videoId:String,
    video:String,
    students:[{
      userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
      enrollDate:{type:Date,default:Date.now},
    }],
    reviews:[{
      userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
      createdAt:{type:Date,default:Date.now},
      comment:String,
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
      },
})

module.exports=mongoose.model('Course',courseSchema)
