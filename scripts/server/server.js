/**
 * Created by kakato10 on 2/7/2015.
 */
"use strict";

var express                     = require( "express" ),
    cookieParser                = require( 'cookie-parser' ),
    bodyParser                  = require( "body-parser" ),
    app                         = express(),
    mongoose                    = require( "mongoose" ),
    session                     = require( 'express-session' ),
    PORT                        = 3030,
    Schema                      = mongoose.Schema,
    basicUserProjection         = { username : 1, followedUsers : 1, postedMessages : 1 },
    usernameOnlyUserProjection  = { username : 1 },
    followedUsersUserProjection = { followedUsers : 1 },
    messagesUserProjection      = { username : 1, postedMessages : 1 };

mongoose.connect( "mongodb://localhost/expirationDateApp" );
app.use( cookieParser() )
    .use( session( {
        secret : '123secret123',
        resave : true,
        saveUninitialized : true,
        httpOnly: false
    } ) );

var Message = mongoose.model( "Message", {
    author : { type : Schema.Types.ObjectId, ref : 'User' },
    text : String,
    dateRegistered : Date,
    location : String
} );

var MessageSchema = new Schema( {
    author : { type : Schema.Types.ObjectId, ref : 'User' },
    text : String,
    dateRegistered : Date,
    location : String
} );

var User = mongoose.model( "User", {
    username : String,
    email : String,
    password : String,
    dateRegistered : Date,
    followedUsers : [ { type : Schema.Types.ObjectId, ref : 'User' } ],
    postedMessages : [ MessageSchema ]
} );

function requireLogin( req, res, next )
{
    console.log( req.session );
    if ( !req.session.user )
    {
        res.redirect( '/login' );
    }
    else
    {
        next();
    }
}


app.all( "*", function ( req, res, next )
{
    res.header( "Access-Control-Allow-Origin", "*" );
    res.header( "Access-Control-Allow-Headers", [ "X-Requested-With", "Content-Type", "Access-Control-Allow-Methods" ] );
    res.header( "Access-Control-Allow-Methods", [ "DELETE" ] );
    next();
} );

app.use( bodyParser.json() );

//lists all usernames
app.get( "/usernames", function ( req, res )
{
    User.find( {}, usernameOnlyUserProjection, function ( err, users )
    {
        res.json( users );
    } );
} );


app.get( '/logout', function ( req, res )
{
    req.session.reset();
    res.redirect( '/' );
} );

//lists all users
app.get( "/users", function ( req, res )
{
    User.find( {}, basicUserProjection, function ( err, users )
    {
        res.json( users );
    } );
} );

//checking credentials
app.post( "/login", function ( req, res )
{
    User.findOne( { username : req.body.username },
        function ( err, user )
        {
            if ( !user )
            {
                res.status( 500 );
                res.json( 'user_does_not_exist' );
            }
            else
            {
                if ( req.body.password == user.password )
                {
                    req.session.user = user;
                    res.send(user);
                }
                else
                {
                    res.status( 500 );
                    res.json( 'passwords_do_not_match' );
                }
            }
        }
    );
} );

//lists all messages
app.get( "/messages", function ( req, res )
{
    Message.find( function ( err, messages )
    {
        res.json( messages );
    } );
} );


////drop database
//(function dropUserCollections()
//{
//    mongoose.connection.collections['users'].drop( function(err) {
//        console.log('collection dropped');
//    });
//}());

//creates a user
app.post( "/user", function ( req, res )
{
    var user = new User( {
        username : req.body.username,
        password : req.body.password,
        email : req.body.email,
        dateRegistered : new Date(),
        followedUsers : [],
        postedMessages : []
    } );
    user.save( function ( err )
    {
        if ( err )
        {
            res.status( 500 );
            res.json( {
                status : "error_on_saving"
            } );
        }
        res.json( {
            status : "saved"
        } );
    } );
} );

//creates a message
app.post( '/message', function ( req, res )
{
    var messageObject = {
            author : req.body.id,
            text : req.body.messageText,
            dateRegistered : new Date(),
            location : req.body.location
        },
        message = new Message( messageObject );
    message.save( function ( err )
    {
        if ( err )
        {
            res.status( 500 );
            res.json( {
                status : err
            } );
        }
        User.findByIdAndUpdate( req.body.id,
            {
                $push : {
                    "postedMessages" : messageObject
                }
            }, function ( err )
            {
                if ( err )
                {
                    res.status( 500 );
                    res.json( {
                        status : err
                    } );
                }
                res.json( {
                    status : "saved"
                } );
            }
        )
    } )
} );

//follow or unfollow a user
app.post( "/followUser", function ( req, res )
{
    var query = { "_id" : req.body[ "_id" ] },
        update = { $push : { followedUsers : req.body.userToFollow } };
    User.update( query, update, function ( err )
    {
        if ( err )
        {
            res.status( 500 );
            res.json( {
                status : err
            } );
        }
        res.json( {
            status : "saved"
        } );
    } );
} );

//follow or unfollow a user
app.post( "/unfollowUser", function ( req, res )
{
    var query = { "_id" : req.body[ "_id" ] },
        update = { $pull : { followedUsers : req.body.userToUnfollow } };
    User.update( query, update, function ( err )
    {
        if ( err )
        {
            res.status( 500 );
            res.json( {
                status : err
            } );
        }
        res.json( {
            status : "saved"
        } );
    } );
} );

//get a specific user
app.get( "/user/:id", function ( req, res )
{
    var query = { "_id" : req.params.id };
    User.findOne( query, basicUserProjection, function ( err, user )
    {
        if ( err )
        {
            res.status( 500 );
            res.json( {
                status : "error_on_getting_a_single_user"
            } );
        }
        res.json( user );
    } );
} );

//get a specific user
app.get( "/loggedUser", function ( req, res )
{
    console.log( 'getting logged user' );
    console.log( req.session );
    //var query = { "_id" : req. };
    //User.findOne( query, basicUserProjection, function ( err, user )
    //{
    //    if ( err )
    //    {
    //        res.status( 500 );
    //        res.json( {
    //            status : "error_on_getting_a_single_user"
    //        } );
    //    }
    //    res.json( user );
    //} );
} );


//get all messages of a specific user
app.get( "/getMessages/:id", requireLogin, function ( req, res )
{
    var query = { "_id" : req.params.id };
    User.findOne( query, followedUsersUserProjection, function ( err, user )
    {
        if ( err )
        {
            res.status( 500 );
            res.json( {
                status : "error_on_retrieving_followed_users"
            } );
        }
        query = { "_id" : { $in : user.followedUsers } };
        User.aggregate( [
            { $match : query },
            { $unwind : '$postedMessages' },
            { $sort : { 'postedMessages.dateRegistered' : -1 } },
            { $limit : 50 }
        ], function ( err, messages )
        {
            if ( err )
            {
                res.status( 500 );
                res.json( {
                    status : "error_on_retrieving_messages"
                } );
            }
            res.json( messages );
        } )


    } );
} );


//// deletes a product
//app.delete( "/product/delete", function ( req, res )
//{
//    Product.findOneAndRemove( { productName : req.body.productName, expirationDate : req.body.expirationDate },
//        function ( err )
//        {
//            res.json( {
//                status : "deleted"
//            } );
//        } );
//} );

console.log( "App is listening at port: " + PORT );
app.listen( PORT );