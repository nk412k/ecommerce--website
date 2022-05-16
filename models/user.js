const mongoose=require('mongoose');

const schema=mongoose.Schema;
const userSchema = new schema({
  email: {
    type: String,
    required: true,
  },
  password:{
    type:String,
    required:true,
  },
  resetToken:String,
  resetTokenExpiration:Date,
  cart: {
    items: [
      {
        productId: {
          type: schema.Types.ObjectId,
          ref: "product",
          required:true},
        quantity: {type:Number,required:true}
      },
    ]
  }
});

userSchema.methods.addToCart=function(product){
  let newQuantity = 1;
  const productIndex = this.cart.items.findIndex(
    (item) => item.productId.toString() === product._id.toString()
  );
  let updatedCartItems = [...this.cart.items];
  if (productIndex >= 0) {
    newQuantity = updatedCartItems[productIndex].quantity + 1;
    updatedCartItems[productIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart=updatedCart;
  return this.save();
}

userSchema.methods.deleteCartItem=function(prodId){
  const updatedCartItems=this.cart.items.filter(i=>i.productId!=prodId);
  const updatedCart={items:updatedCartItems};
  this.cart=updatedCart;
  return this.save();
}

userSchema.methods.clearCart=function(){
  this.cart={items:[]};
  return this.save();
}

module.exports=mongoose.model('user',userSchema);