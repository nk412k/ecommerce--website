const mongoose=require('mongoose');
const schema=mongoose.Schema;
const orderSchema=new schema({
    products:[{
        product:{type:Object,required:true},
        quantity:{type:Number,required:true}
    }],
    user:{
        email:{type:String,require:true},
        userId:{type:schema.Types.ObjectId,ref:'user',required:true}
    }
});

module.exports=mongoose.model('order',orderSchema);