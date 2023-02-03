const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = new mongoose.Schema({
    email:{
        type: String,
        required: [true,'email required'],
        minlength: 7
    },
    password: {
        type:String,
        required: [true,'password required'],
        minlength: 5
    },
    AdiminPerms: {
        type : Boolean,
        default : false
    }
})


User.pre('save',async function(next){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password,salt)
   next()
})


// login

User.statics.login = async function (email,password){
    const user = await this.findOne({email})

    if(user){
       const auth = await bcrypt.compare(password,user.password)

       if(auth){
        return user
       }
       throw Error('incorrect email or password')
    }
    throw Error('incorrect email or password')
}




const UserModel = mongoose.model('User',User)

module.exports = UserModel



