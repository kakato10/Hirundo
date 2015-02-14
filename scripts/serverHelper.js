/**
 * Created by kakato10 on 2/9/2015.
 */
define( 'serverHelper', [ "jquery", 'bootstrap' ], function ( $ )
{
    return {
        //log in
        tryLogIn : function ( data, callback )
        {
            console.log( JSON.stringify( data ) );
            $.ajax( {
                url : 'http://localhost:3030/login',
                type : "POST",
                contentType : "application/json",
                dataType : "json",
                data : JSON.stringify( data )
            } ).done( function ( info, textStatus )
            {
                callback( info, textStatus );
            } );
        },

        //get basic projection of a user
        getLoggedUser : function ( callback )
        {
            console.log( 'getting logged user' );
            $.ajax( {
                url : "http://localhost:3030/loggedUser",
                type : "GET",
                contentType : "application/json"
            } ).done( function ( data, textStatus )
            {
                console.log( "the currently logges user is", textStatus, data );
                callback( data );
            } );
        },

        //return all usernames of registered users
        loadUsernames : function ( username, callback )
        {
            $.ajax( {
                url : "http://localhost:3030/usernames",
                type : "GET",
                contentType : "application/json",
            } ).done( function ( data, textStatus )
            {
                callback( data, textStatus );
            } );
        },

        //returns a list of all registered users
        loadUsers : function ( callback )
        {
            $.ajax( {
                url : "http://localhost:3030/users",
                type : "GET",
                contentType : "application/json",
            } ).done( function ( data, textStatus )
            {
                callback( data, textStatus );
            } );
        },

        //register a user
        registerUser : function ( data )
        {
            $.ajax( {
                url : "http://localhost:3030/user",
                type : "POST",
                contentType : "application/json",
                dataType : "json",
                data : JSON.stringify( data )
            } ).done( function ( data, textStatus )
            {
                console.log( data, textStatus );
            } );
        },

        //follow or unfollow a user
        followUser : function ( userId, userToFollow, callback )
        {
            $.ajax( {
                url : "http://localhost:3030/followUser",
                type : "POST",
                contentType : "application/json",
                dataType : "json",
                data : JSON.stringify( {
                        "_id" : userId,
                        userToFollow : userToFollow,
                    }
                )
            } ).done( function ( data, textStatus )
            {
                console.log( data, textStatus );
                callback();
            } );
        },

        //follow or unfollow a user
        unfollowUser : function ( userId, userToUnfollow, callback )
        {
            $.ajax( {
                url : "http://localhost:3030/unfollowUser",
                type : "POST",
                contentType : "application/json",
                dataType : "json",
                data : JSON.stringify( {
                        "_id" : userId,
                        userToUnfollow : userToUnfollow,
                    }
                )
            } ).done( function ( data, textStatus )
            {
                console.log( data, textStatus );
                callback();
            } );
        },

        //get basic projection of a user
        getUserWithBasicProjection : function ( id, callback )
        {
            $.ajax( {
                url : "http://localhost:3030/user/" + id,
                type : "GET",
                contentType : "application/json"
            } ).done( function ( data, textStatus )
            {
                console.log( "the user is", textStatus, data );
                callback( data );
            } );
        },

        saveMessage : function ( id, message, location, callback )
        {
            var requestBody = {
                id : id,
                messageText : message,
                location : location || 'asdfsda'
            };
            console.log( requestBody );
            $.ajax( {
                url : "http://localhost:3030/message",
                type : "Post",
                contentType : "application/json",
                dataType : "json",
                data : JSON.stringify( requestBody )
            } ).done( function ( textStatus )
            {
                console.log( textStatus );
                callback();
            } );
        },

        getMessages : function ( id, callback )
        {
            $.ajax( {
                url : "http://localhost:3030/getMessages/" + id,
                type : "GET",
                contentType : "application/json"
            } ).done( function ( data, textStatus )
            {
                //callback( data );
                callback( data );
            } );
        },

    }
} )
;

