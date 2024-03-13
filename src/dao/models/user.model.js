import mongoose from "mongoose";

const userCollection ="user";
const {Schema,model } =mongoose;

const userSchema = new Schema ({
    name:String,
    last_name:String,
    email:String,
    age:Number,
    password: String,
    cart_id:String,
    role:{type:String, default:"user"},
    documents:[{
        doc_name:String,
        filename:String,
        reference:String,
    }],
    last_connection:Date,
})

const userModel = model(userCollection,userSchema)

export default userModel;