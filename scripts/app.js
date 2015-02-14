/**
 * Created by kakato10 on 2/7/2015.
 */
require.config( {
    paths : {
        "jquery" : "../bower_components/jquery/dist/jquery",
        "handlebars" : "../bower_components/handlebars/handlebars",
        "bootstrap" : "../bower_components/bootstrap/dist/js/bootstrap"
    },
    shim : {
        "handlebars" : {
            exports : "Handlebars"
        },
        "bootstrap" : {
            "deps" : [ "jquery" ]
        }
    }
} );


require( [ 'jquery', 'handlebars', 'serverHelper', 'bootstrap' ], function ( $, Handlebars, serverHelper )
{
    $( document ).ready( function ()
        {
            var usernames = [];
            //hash function
            String.prototype.hashCode = function ()
            {
                var hash = 0, i, chr, len;
                if ( this.length == 0 )
                {
                    return hash;
                }
                for ( i = 0, len = this.length; i < len; i++ )
                {
                    chr = this.charCodeAt( i );
                    hash = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            };

            function clearLogInForm()
            {
                $( '#usernameLogIn' ).val( '' );
                $( '#passwordLogIn' ).val( '' );
            }

            function clearRegisterForm()
            {
                $( '#usernameRegister' ).val( '' );
                $( '#passwordRegister' ).val( '' );
                $( '#passwordConfirmRegister' ).val( '' );
                $( '#emailRegister' ).val( '' );
            }


            function prepareRegistration()
            {
                var username = $( '#usernameRegister' ).val(),
                    password = $( '#passwordRegister' ).val().hashCode(),
                    confirmationPassword = $( '#passwordConfirmRegister' ).val().hashCode(),
                    email = $( '#emailRegister' ).val(),
                    usernameInUse = false;
                serverHelper.loadUsernames( username, function ( data )
                    {
                        usernames = data;
                        usernameInUse = usernames.some( function ( user )
                        {
                            console.log( user.username == username );
                            return user.username == username;
                        } );

                        //check passwords matching
                        if ( password == confirmationPassword )
                        {
                            //check if the username is in use
                            if ( !usernameInUse )
                            {
                                serverHelper.registerUser( {
                                    username : username,
                                    password : password,
                                    email : email
                                } );
                                $( '#registerModal' ).modal( 'hide' );
                                clearRegisterForm();
                            }
                            else
                            {
                                window.alert( 'Username is already in use!' );
                            }
                        }
                        else
                        {
                            window.alert( 'Passwords do not match!' );
                        }

                    }
                );
            }

            function prepareLogIn()
            {
                var username = $( '#usernameLogIn' ).val();
                var password = $( '#passwordLogIn' ).val();
                serverHelper.tryLogIn( { username : username, password : password.hashCode() }, function ( data, textStatus )
                {
                    console.log( textStatus );
                    console.log( data );
                    serverHelper.getLoggedUser( function ( err )
                    {
                        if ( err )
                        {
                            console.log( err )
                        }
                    } );
                    //window.location.replace( 'http://localhost:19641/mongo/hirundo/profile.html' );
                } );
            }

            //EVENTS
            //register user
            $( '#register' ).on( 'click', function ()
            {
                prepareRegistration();
            } );

            //clear logging form
            $( '#cancelLogIn' ).on( 'click', function ()
            {
                clearLogInForm();
            } );

            $( '#confirmLogIn' ).on( 'click', function ()
            {
                prepareLogIn();
            } );
        }
    )
    ;
} )
;
