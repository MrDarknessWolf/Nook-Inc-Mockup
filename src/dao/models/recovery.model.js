import mongoose from 'mongoose'

const {Schema,model}=mongoose;
/*
const recoverySchema = new Schema({
    token_id: { type: String, required: true},
    code_id:{type:String,required:true},
    expires:{type:Date,
            default:Date.now,
            expiresAt:10}
});
*/
const recoverySchema = new Schema({
    token_id: { type: String, required: true},
    code_id:{type:String,required:true},
    createDate:{type:Date,default:Date.now()},
});

const recoveryModel= model ("RecoveryLinks",recoverySchema);

export default recoveryModel;