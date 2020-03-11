const mongoose = require("mongoose");

const connectionURL = process.env.CONNECTION_URL

mongoose.connect(connectionURL, { 
    useCreateIndex: true, 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

// me.save().then( () => {
//     console.log(me);
// } ).catch( (error) => {
//     console.log("Error!", error);
// } )

// task1.save().then( () => {
//     console.log(task1);
// } ).catch( (error) => {
//     console.log("Error!", error);
// } );