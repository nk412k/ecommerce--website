const mongoose=require('mongoose');

const schema=mongoose.Schema;
const porductSchema=new schema({
  title:{
    type:String,
    required:true,
  },
  price:{
    type:Number,
    required:true
  },
  imageUrl:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true,
  },
  userId:{
    type:schema.Types.ObjectId,
    required:true,
    ref:'user',
  }
});

module.exports=mongoose.model('product',porductSchema);