const express = require("express")
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer")
const sharp = require("sharp");
const { sendWelcomeEmail, sendCanceledEmail } = require("../emails/account");

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/) ){
            return cb(new Error("File must be a JPG or JPEG or PNG"))
        }
        cb(undefined, true)
        // cb(new Error("File must be a PDF"))
        // cb(undefined, true),
        // cb(undefined, false)
    }
})

router.post( "/users/me/avatar", auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send(error);
} )

router.delete( "/users/me/avatar", auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save();
    res.send()
} )

router.get( "/users/:id/avatar", async (req,res) => {
    try{
        const user = await User.findById(req.params.id)
        if( !user ){
            throw new Error()
        }
        res.set("Content-Type", "image/png");
        res.send(user.avatar)
    }catch(e){
        res.status(404).send();
    }
 } )

router.post( "/users", async ( req, res ) => {
    const user = new User(req.body);
    try{
        await user.save();
        sendWelcomeEmail( user.email, user.name )
        const token = await user.generateAuthToken();
        res.send({ user, token })
    }catch(e){
        res.status(500).send(e)
    }
    
    // user.save().then( () => {
    //     res.send(user);
    // } ).catch( (e) => {
    //     res.status( 400 );
    //     res.send(e);
    // } )
} )

router.post( "/users/login", async (req,res) => {
    try{
        const user = await User.findByUserCredentials( req.body.email, req.body.password )
        const token = await user.generateAuthToken();
        res.send({ user, token })
    }catch(e){
        res.status(400).send()
    }
} )

router.post( "/users/logout", auth, async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token !== req.token
        } )
        await req.user.save();
        res.send()
    }catch(e){
        res.status(500).send();
    }
} )

router.post( "/users/logoutAll", auth, async (req,res) => {
    try{
        req.user.tokens = []
        await req.user.save();
        res.send()
    }catch(e){
        res.status(500).send();
    }
} )

router.get( "/users/me", auth, async (req,res) => {
    res.send(req.user)

    // try{
    //     const user = await User.find({})
    //     if(!user){
    //         return res.status(404).send()
    //     }
    //     res.send( user )
    // }catch(e){
    //     res.status(500).send()
    // }
    
    // User.find( {} ).then( (user) => {
    //     if( !user ){
    //         return res.status(400).send();
    //     }
    //     res.send( user );
    // } ).catch( (e) => {
    //     res.status(500).send();
    // } )
} )

// router.get( "/users/:id", async (req, res) => {
//     const _id = req.params.id;

//     try{
//         const user = await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send( user )
//     }catch(e){
//         res.status(500).send()
//     }

//     // User.findById(_id).then( (user) => {
//     //     if( !user ){
//     //         return res.status(400).send();
//     //     }
//     //     res.send(user);
//     // } ).catch( (e) => {
//     //     res.status(500).send();
//     // } )
// } )

router.patch( "/users/me", auth, async (req,res) => {
    const body = req.body;
    const allowedUpdates = [ "name", "age", "email", "password", "tokens" ]
    const updates = Object.keys( body )
    const isValidOperation = updates.every( (update) => allowedUpdates.includes(update))
    
    if(!isValidOperation){
        return res.status(400).send({ "error": "Invalid Updates"});
    }
    
    try{
        // const user = await User.findByIdAndUpdate( _id, body, { new:true, runValidators:true } )        
        const user = req.user;

        updates.forEach( (update) => user[update] = body[update] )
        console.log(updates);
        
        await user.save();
        res.send(user)
    }catch(e){
        res.status(500).send();
    }
} )

router.delete( "/users/me", auth, async (req,res) => {
    // const _id = req.user._id;
    try{
        // const user = await User.findByIdAndDelete(_id)

        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendCanceledEmail( req.user.email, req.user.name );
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router