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
        refreshUsers();
        refreshRemainginCharectersCount();
        var users = [],
            loggedUser = {
                _id : "54db9c246b136d381c6c1a8a",
                followedUsers : []
            };
        refreshTimeline();
        serverHelper.getLoggedUser();

        //remove hardcoded user!!!!!!!!!!!!!!!!!!!!
        function refreshUsers()
        {
            serverHelper.loadUsers( function ( data, textStatus )
            {
                console.log( textStatus );
                users = data;
                console.log( users );
                refreshFollowModal();
            } );
        }

        function followsUser( userId )
        {
            return loggedUser.followedUsers.indexOf( userId ) != -1;
        }

        function refreshFollowModal()
        {
            var allRows = '',
                $listOfUsers = $( '#listOfUsers' );
            users.forEach( function ( user )
            {
                allRows += generateFollowRow( user );
            } );

            $listOfUsers.empty( '' );
            $listOfUsers.append( allRows );
        }

        function generateFollowRow( user )
        {
            var followRowHtml;
            if ( user._id != loggedUser._id )
            {
                if ( followsUser( user._id ) )
                {
                    followRowHtml = $( "#userFollowed" ).html();
                }
                else
                {
                    followRowHtml = $( '#userNotFollowed' ).html();
                }
                var userRowTemplate = Handlebars.compile( followRowHtml );
                return userRowTemplate( user );
            }
            return '';
        }

        function unfollowUser( userId )
        {
            var index = loggedUser.followedUsers.indexOf( userId );
            loggedUser.followedUsers.splice( index, 1 );
        }

        function followUser( userId )
        {
            loggedUser.followedUsers.push( userId );
        }

        function updateLoggedUser( callback )
        {
            serverHelper.getUserWithBasicProjection( loggedUser[ "_id" ], function ( data )
            {
                loggedUser = data;
                console.log( 'our new user ISSSSSS', data );
            } );
        }

        function getMessageLength()
        {
            var $messageField = $( '#message' ),
                charactersCount = $messageField.val().length;
            return charactersCount;
        }

        function clearMessageInput()
        {
            $( '#message' ).val( '' );
            refreshRemainginCharectersCount();
        }

        function saveMessage()
        {
            var messageLength = getMessageLength();
            if ( messageLength <= 140 && messageLength > 0 )
            {
                var $messageField = $( '#message' ),
                    message = $messageField.val();
                serverHelper.saveMessage( loggedUser[ "_id" ], message, undefined, function ()
                {

                    //make passing of location
                    clearMessageInput();
                } );
            }
            else
            {
                window.alert( 'The message you\'re trying to save is bigger than 140 characters or it is empty!' );
            }
        }

        function refreshRemainginCharectersCount()
        {
            var $messageField = $( '#message' ),
                maxCharacters = 140,
                charactersLeft = maxCharacters - getMessageLength(),
                text = '';
            if ( charactersLeft < 0 )
            {
                $messageField.addClass( 'charactersExceeded' );
                text = 'Characters left: 0';
            }
            else
            {
                $messageField.removeClass( 'charactersExceeded' );
                text = 'Characters left: ' + (charactersLeft);
            }
            $( '#characters' ).text( text );
        }

        function generateMessageRender( username, message )
        {
            var data = {
                username : username,
                dateREgistered : message.dateREgistered,
                text : message.text
            };
            var messageDivHtml = $( "#messageTemplate" ).html();
            var messageTemplate = Handlebars.compile( messageDivHtml );
            return messageTemplate( data );
        }

        function refreshTimeline()
        {
            serverHelper.getMessages( loggedUser[ "_id" ], function ( messages )
            {
                var $timeline = $( '#timeline' ),
                    htmlToAppend = '';
                messages.forEach( function ( message )
                {
                    var username = message.username;
                    htmlToAppend += generateMessageRender( username, message.postedMessages );
                } );
                $timeline.empty();
                $timeline.append( htmlToAppend );
            } );
        }

        //EVENTS
        $( "#follow" ).on( 'click', refreshUsers );
        $( document ).on( 'click', '.followUser', function ( event )
        {
            var userToFollow = $( event.target ).data( 'user-id' );
            followUser( $( event.target ).data( 'user-id' ) );
            serverHelper.followUser( loggedUser[ "_id" ], userToFollow, function ()
            {
                updateLoggedUser();
                refreshUsers();
                refreshTimeline();

            } );
        } );

        $( document ).on( 'click', '.unfollowUser ', function ( event )
        {
            var userToUnfollow = $( event.target ).data( 'user-id' );
            unfollowUser( userToUnfollow );
            serverHelper.unfollowUser( loggedUser[ "_id" ], userToUnfollow, function ()
            {
                updateLoggedUser();
                refreshUsers();
                refreshTimeline();
            } );
        } );

        $( "#saveMessage" ).on( 'click', saveMessage );
        $( '#message' ).bind( 'input propertychange', refreshRemainginCharectersCount );
    } )
    ;
} );
