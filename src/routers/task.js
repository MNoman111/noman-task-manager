const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")
const router = new express.Router();

router.post( "/tasks", auth, async ( req, res ) => {
    const task = new Task( {
        ...req.body,
        owner: req.user._id
    } );

    try{
        await task.save();
        res.send( task )
    }catch(e){
        res.status(400).send(e);
    }

    // task.save().then( () => {
    //     res.send( task )
    // } ).catch( ( e ) => {
    //     res.status( 400 );
    //     res.send( e )
    // } )
} )

router.get( "/tasks/:id", auth, async (req,res) => {
    const _id = req.params.id;

    try{
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task){
            return res.status(404).send()
        }
        res.send( task )
    }catch(e){
        res.status(500).send()
    }

    // Task.findById(_id).then( (task) => {
    //     if( !task ){
    //         return res.status(400).send();
    //     }
    //     res.send(task);
    // } ).catch( (e) => {
    //     res.status(500).send(e);
    // } )
} )

router.get( "/tasks", auth, async (req,res) => {

    try{
        const limit = parseInt( req.query.limit);
        const skip = parseInt(req.query.skip);
        const sortQuery = req.query.sortBy ? req.query.sortBy.split("_"): undefined;
        const sort = {};
        const query = {};
        query.owner = req.user._id
        if( sortQuery ){
            sort[ sortQuery[ 0 ] ] = sortQuery[ 1 ] === "asc" ? 1 : -1;
        }
        
        if( req.query.completed ){
            query.completed = req.query.completed === 'true'
        }
        const task = await Task.find(query, null, { limit, skip, sort })
        if(!task){
            res.status(404).send()
        }
        res.send( task )
    }catch(e){
        res.status(500).send()
    }

    // Task.find().then( (task) => {
    //     if( !task ){
    //         return res.status(400).send()
    //     }
    //     res.send(task)
    // } ).catch( (e) => {
    //     res.status(500).send(e)
    // } )
} )

router.patch( "/tasks/:id", auth, async (req,res) => {
    const _id = req.params.id;
    const body = req.body;
    const allowedUpdates = [ "description", "completed" ]
    const updates = Object.keys( body )
    const isValidOperation = updates.every( (update) => allowedUpdates.includes(update) )

    if(!isValidOperation){
        return res.status(400).send({ "error": "Invalid Updates"});
    }

    try{
        // const task = await Task.findByIdAndUpdate( _id, body, { new:true, runValidators:true } )

        const task = await Task.findOne( {_id, owner: req.user._id } );

        if(!task){
            return res.status(404).send()
        }

        updates.forEach( (update) => task[update] = body[update] )

        await task.save()

        res.send(task)

    }catch(e){
        res.status(500).send();
    }
} )

router.delete( "/tasks/:id", auth, async (req,res) => {
    const _id = req.params.id;

    try{
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router