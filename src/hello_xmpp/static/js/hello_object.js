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
    
    handle_resp : function (data) {
        //console.log(data);
        data;
    },
    
    handle_roster : function(data) {
        if (data['firstChild']['localName'] != 'query') {
            Hello.msg_log('Your contacts could not be retrieved. Sorry...')
        }
               
        Hello.contacts = data['firstChild']['childNodes'];
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
            ChatBox.build_new_chat(contact);
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
            var formmatted_contact = Utilities.format_contact(from_id)
            
            Hello.msg_log("<strong>" + pretty_contact + "</strong>: " +from_text, formmatted_contact + "__msg_log"); 
            Hello.log(''); 
        }
        return true;
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

var ChatBox = {
    contact : null,
    formatted_contact : null,
    
    is_chat_built : function () {
        if ($('#' + ChatBox.formatted_contact + '__chat_area').attr('id')) {
            $('#' + ChatBox.formatted_contact + '__chat_area').show();  
            return true;
        }
        return false;
    },
    
    get_chat_html : function () {
        var chat_html = '<div id="' + ChatBox.formatted_contact + '__chat_area" class="user_chat_area"> \
                            <div id="' + ChatBox.formatted_contact + '__msg_log" class="msg_log"> \
                            </div> \
                            <form id="' + ChatBox.formatted_contact + '__chat_form" class="chat_form"> \
                                <input id="' + ChatBox.formatted_contact + '__chat_input" class="chat_input" /> \
                                <input type="hidden" value="' + ChatBox.contact + '" /> \
                             </form> \
                        </div> ';
        
        $('#full_chat_area').append(chat_html);
        $('.msg_log').scrollTop($('.msg_log').height());
        //bind the "send message" functionality to the contact form.
        $('#' + ChatBox.formatted_contact + '__chat_form').submit(Hello.bind_send_message_to_contact_form);
        
    },
    
    build_new_chat : function (contact) {
        ChatBox.contact = contact;
        ChatBox.formatted_contact = Utilities.format_contact(contact);
        
        $('.user_chat_area').hide();
                
        if (ChatBox.is_chat_built()) {
            return false;
        }
        
        ChatBox.get_chat_html();
        ChatBox.show_current_chats('add') ;
        return false;
    },
    
    show_current_chats : function(action) {
        //Displays all the contacts a user is currently chatting with
        if (action == 'add') {
            var id =  ChatBox.formatted_contact + "__current";
            var li = '<li><a href="#" id=' + id + ' class="current_contact" >' + ChatBox.contact + '</a></li>';
           
            $('#current_list').append(li);    
            $("#" + id).click(function() {
                ChatBox.build_new_chat($("#" + id).text());
                return false
            });
                       
            $('#current_chats').removeClass('hidden');
        }
    }, 
    
}

var Utilities = {
    format_contact : function(contact) {
        //contact id's are also used to determine the contact's div's.
        //the '@', '.' and "/blahbblah" needs to be removed.
        return contact.split('/')[0].replace('@', '_').replace(/\./g, '_');
    },
    
}