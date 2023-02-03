
const port = process.env.PORT || 3001;

const express = require('express')
const app = express()
app.use(express.json())
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
let productsPag = require('./arrays/products')

const ProductDb = require('./models/products')


const User = require('./models/User')

const cors = require('cors');
app.use(cors({ origin: true, credentials: true }));
//app.use(cookieParser())


mongoose.connect('mongodb+srv://dbUser:TORi5576@cluster0.vdvef9d.mongodb.net/test').then(()=>{
    console.log('i think mongoose is connected')
})

const maxAge = 2*24*60*60;

const createToken = (id)=>{

    return jwt.sign({id},'user basic',{
        expiresIn: maxAge
    });
}


app.get('/hello',(req,res)=>{
  res.send('hi bro')
})


app.post('/Signup',async (req,res)=>{
    const email = req.body.email
    const password = req.body.password

   try {
    const createdUser = await User.create({email:email,password:password})
    const token = createToken(createdUser._id)
    //res.cookie('jwt',token,{httpOnly: true,maxAge:maxAge*1000})
    res.header('Access-Control-Allow-Credentials', true);
    res.cookie('jwt',token,{sameSite:'none', secure: true,httpOnly: true,maxAge:maxAge*1000 ,expires: 7, })

    console.log(createdUser)

    //-----------------
    res.status(200).json({
        status: "success",
        data: createdUser,
        token: token,
      });

   } catch (error) {
    console.log(error.message)
   res.send(error)
   }
})


app.post('/Login', async (req,res)=>{
    const email = req.body.email
    const password = req.body.password

   try {

    const user = await User.login(email,password)

    const token = createToken(user._id)
    res.header('Access-Control-Allow-Credentials', true);
    res.cookie('jwt',token,{sameSite:'none', secure: true,httpOnly: true,maxAge:maxAge*1000 ,expires: 7, })



    //  res.status(200).json({
    //     user: user._id,
    //      status: "success",
    //      token1 : token,
    //      AdminAccsess : user.AdiminPerms,
    //      user : {user}
    //      });

         
     res.status(200).json({
        status: "success",
        data: {
            user,
            token,
            token1: token,
            AdminAccsess : user.AdiminPerms,
        }
    });


   } catch (error) {
    console.log('getting called catch',error)
    res.json(error)
   }


})

//test is for checking if there is a user

app.post('/Test',async (req,res)=>{
    const token = req.body.jwt

    if (token) {
        let VerifiedUser = jwt.verify(token, 'user basic')
        let id = VerifiedUser.id
        console.log(id)
        let user = await User.findById(id)
        console.log(user)
        res.status(200).json({
            status: 'success',
            user: user
        })
    }else(
        res.status(400).json({
            error: 'error',
            User: null,
        })
    )
        
})


app.post('/Make-Admin', async (req,res)=>{
    const email = req.body.email
    const password = req.body.password

   
    try {
        const createdUserAdmin = await User.create({email:email,password:password, AdiminPerms: true})
        const token = createToken(createdUserAdmin._id)
        //res.cookie('jwt',token,{httpOnly: true,maxAge:maxAge*1000})
        res.header('Access-Control-Allow-Credentials', true);
        res.cookie('jwt',token,{sameSite:'none', secure: true,httpOnly: true,maxAge:maxAge*1000 ,expires: 7, })
    
        //console.log(createdUserAdmin)
    
        //-----------------

        res.status(200).json({
            status: "success",
            data: createdUserAdmin,
            token: token
          });
    
       } catch (error) {
        console.log(error.message)
       res.send(error)
       }



})



//---------------------pagnation api start------------


app.post('/Products',async (req,res)=>{
    const page = req.query.page
  try {
    const limit = 9

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const products = await ProductDb.find({}).sort({ id: 1 })

    const PagedProduct = products.slice(startIndex,endIndex)
    const ButtonIndex = Math.ceil(productsPag.length / limit)

    res.status(200).json({PagedProduct , Buttons: ButtonIndex})

  } catch (error) {
    res.send('soory there was an error bro')
  }

})

//---------------------------------------------


app.post('/populateDB',async (req,res)=>{
    try {
        console.log('worked')

        const products = await ProductDb.create(productsPag)

        res.status(200).json({products,message:'hi'})
    } catch (error) {
        res.status(400).json(error)
        res.send(error)
    }

})

app.post('/addProducts',async (req,res)=>{
    const id = req.body.id
    const name = req.body.name

    try {
        const createdUser = await ProductDb.create({id:id,name:name})

        res.status(200).json({
            createdUser:createdUser,
            message : 'it was sucessful',
            status : 'sucess'
        })

    } catch (error) {
        res.status(400).send(error)
        console.log(error.message)
    }


})

app.post('/deleteProducts',async (req,res)=>{
    const id = req.body.id

    try {

        const deleteThisUser = await ProductDb.find({id})
        const findUserId = await ProductDb.findById(deleteThisUser)
        const deletedUsercurrent = await ProductDb.deleteOne(findUserId)

        res.status(200).json({
            message : 'this product is deleted',
            status : 'sucess',
        })
        
    } catch (error) {
        res.status(400).send(error.message)
        console.log(error.message)
    }
   
})


app.get('/checkProductsAll',async (req,res)=>{

    const productsTestCheck = await ProductDb.find({})

    res.status(200).send({Products : productsTestCheck,Lenght :productsTestCheck.length})
})


app.post('/checkprodctsbyId',async (req,res)=>{
    const id = req.body.id

try {

    const ProductSpecific = await ProductDb.find({id})
    res.status(200).send({Product:ProductSpecific})
    
} catch (error) {
    res.status(400).json({error: error.message,testMessage:'it gave error'})
    console.log(error.message)
}
})



//-----------pag end-----------------------------


app.listen(port,()=>{
    console.log('server running')
})

