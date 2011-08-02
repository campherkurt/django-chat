var Hello = {
    bosch_url : "http://bosh.metajack.im:5280/xmpp-httpbind",
    connection : null,
    start_time : null,
    user : null,
    contacts : null,
        
    log : function (msg) {
        //logs all the network activity
        $('#status_log').html("<p>" + msg + "</p>");
    },
    
    msg_log : function (msg, location) {
        //logs all the chat messages to a specific contact log box
        $('#' + location).append("<p>" + msg + "</p>");
    },
    
    send_ping : function(to) {
        var ping = $iq({to: to,
                        type: "get",
                        id: "ping1"}).c("ping", {xmlns: "urn:xmpp:ping"});
        
        Hello.start_time = (new Date()).getTime();
        Hello.connection.send(ping);
    } ,
    
    
    get_roster : function() {
        var user = Hello.connection.jid;
        var iq = $iq({type: 'get', id: 'roster'}).c('query', {xmlns: Strophe.NS.ROSTER});
        Hello.connection.send(iq); 
    },
    
    handle_roster : function(data) {
        Hello.contacts = data.children[0].children;
        
        //Displays the contacts
        for (ix in Hello.contacts) {
            if (Hello.contacts[ix].toString() == "[object Element]") {
                $('#contact_list').append('<li><a href="#" class="user_contact">' + Hello.contacts[ix].getAttribute('jid') + '</a></li>');
            } 
        }
        $('#user_contacts').removeClass('hidden');
        $('#contacts_link').click(function () {
            $('#contact_list').slideToggle();    
        });
        
        $(".user_contact").click(function () {
            var contact = $(this).text();
            Hello.build_new_chat(contact);
        });
                
    },
    
    send_status : function(to) {
        //var presence = $pres({to:to, id:'stat1'}).c('show').t('away').up().c('status').t('Off to rest.');
        var presence = $pres().c('show').t('unavailable');
        Hello.connection.send(presence);
    },
    
    send_msg : function(text, to) {
        //This does the actual work of sending a message to the BOSCH server.
        var message_text = text;
        var message = $msg({to: to, type: 'chat'}).c('body').t(message_text);  
        Hello.connection.send(message);
        return true;
    },
    
    handle_status : function(pres) {
        Hello.log("got a status return ");
        return true;
    },
    
    handle_msg : function(msg) {
        //Takes messages from the recipient/BOSCH, finds the proper logging box and then displays.
        var from_id = msg.getAttribute('from');
        if ($(msg).children('body').text()) {
            var from_text = $(msg).children('body').text();
            var pretty_contact = from_id.split("@")[0];
            var formmatted_contact = Hello.format_contact(from_id)
            
            Hello.msg_log("<strong>" + pretty_contact + "</strong>: " +from_text, formmatted_contact + "__msg_log"); 
            Hello.log(''); 
        }
        return true;
    },
    
    show_current_chats : function(contact, action) {
        //Displays all the contacts a user is currently chatting with
        var formatted_contact = Hello.format_contact(contact);
        
        if (action == 'add') {
            var id =  formatted_contact + "__current";
            var li = '<li><a href="#" id=' + id + ' class="current_contact" >' + contact + '</a></li>';
           
            $('#current_list').append(li);    
            $("#" + id).click(function() {
                Hello.build_new_chat($("#" + id).text());
                return false
            });
                       
            $('#current_chats').removeClass('hidden');
        }
    }, 
    
    format_contact : function(contact) {
        //contact id's are also used to determine the contact's div's.
        //the '@', '.' and "/blahbblah" needs to be removed.
        return contact.split('/')[0].replace('@', '_').replace(/\./g, '_');
    },
    
    build_new_chat : function(contact) {
        //Creates a new user log box and input
        //Does not build if one already exists.
        //a formatted contact id is used in the div id's.
        var formatted_contact = Hello.format_contact(contact);
        $('.user_chat_area').hide(); 
        if ($('#' + formatted_contact + '__chat_area').attr('id')) {
            $('#' + formatted_contact + '__chat_area').show();
            return false;
        }
        
        //Could this be done better? Probably.
        //TODO: Use better id's for the div's
        var chat_html = '<div id="' + formatted_contact + '__chat_area" class="user_chat_area"> \
                            <div id="' + formatted_contact + '__msg_log" class="msg_log"> \
                            </div> \
                            <form id="' + formatted_contact + '__chat_form" class="chat_form"> \
                                <input id="' + formatted_contact + '__chat_input" class="chat_input" /> \
                                <input type="hidden" value="' + contact + '" /> \
                             </form> \
                        </div> ';
        
             
        $('#full_chat_area').append(chat_html);
        
        $('.msg_log').scrollTop($('.msg_log').height());
        
        //bind the "send message" functionality to the contact form.
        $('#' + formatted_contact + '__chat_form').submit(Hello.bind_send_message_to_contact_form);
        Hello.show_current_chats(contact, 'add') ;
        return false;
    },
    
    bind_send_message_to_contact_form : function() {
        //Kinda obvious...
        var contact_form = $(this).attr('id');
        var formatted_contact= contact_form.split('__')[0];
        var input_id = $("#" + formatted_contact+ "__chat_input");
        var recipient = input_id.next();
        var text = input_id.val();
        var to = recipient.val();
        
        input_id.val('');
        Hello.send_msg(text, to);
        Hello.msg_log("<strong>me</strong>:  " + text, formatted_contact+ "__msg_log");
        return false;    
    }
        
}