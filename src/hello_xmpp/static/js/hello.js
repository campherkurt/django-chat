var Hello = {
    bosch_url : "http://bosh.metajack.im:5280/xmpp-httpbind",
    connection : null,
    start_time : null,
    user : null,
        
    log : function (msg) {
        console.log(msg);
        $('#status_log').html("<p>" + msg + "</p>");
    },
    
    msg_log : function (msg) {
        $('#msg_log').append("<p>" + msg + "</p>");
    },
    
    send_ping : function(to) {
        var ping = $iq({to: to,
                        type: "get",
                        id: "ping1"}).c("ping", {xmlns: "urn:xmpp:ping"});
        
        Hello.start_time = (new Date()).getTime();
        Hello.connection.send(ping);
    } ,
    
    handle_resp : function(data) {
        console.log(data);
           
    },
    
    send_status : function(to) {
        //var presence = $pres({to:to, id:'stat1'}).c('show').t('away').up().c('status').t('Off to rest.');
        var presence = $pres().c('show').t('unavailable');
        console.log(presence.toString());
        Hello.connection.send(presence);
    },
    
    send_msg : function(text, to) {
        var message_text = text;
        var message = $msg({to: to, type: 'chat'}).c('body').t(message_text);  
        Hello.connection.send(message);
        Hello.msg_log("<strong>me</strong>:  " + message_text);
        return true;
    },
    
    handle_status : function(pres) {
        Hello.log("got a status return ");
        console.log(pres);
        return true;
    },
    
    handle_msg : function(msg) {
        var from_id = msg.getAttribute('from');
        if ($(msg).children('body').text()) {
            var from_text = $(msg).children('body').text();
            Hello.msg_log("<strong>" + from_id.split("@")[0] + "</strong>: " +from_text); 
            Hello.log(''); 
        }
        console.log(msg)
        return true;
    },
    
    build_new_chat : function(contact) {
        var chat_html = '<div id="user_chat_area"> \
                            <div id="msg_log" class="msg_log">    \
                            </div>                                \
                            <form id="chat_form" class="hidden">  \
                                <input id="chat_input" />         \
                            </form>                               \
                        </div> ';
        
    }
}

$(document).ready( function() {
    $('#login_dialog').dialog({
        autoOpen: true,
        draggable: false,
        modal: true,
        title: 'Connect to XMPP',
        buttons: {
            'Connect': function () {
                $(document).trigger('connect', {
                    jid: $('#jid').val(),
                    password: $('#password').val()
                });
                $('#password').val('');
                $(this).dialog('close');
            }    
        }
    });
});    
        

$(document).bind('connect', function (ev, data) {
        
    var conn = new Strophe.Connection(Hello.bosch_url);
    conn.connect(data.jid, data.password, function (status) {
        
        if (status === Strophe.Status.ERROR) {
            Hello.log('an error has occurred');
        }
        if (status === Strophe.Status.CONNFAIL) {
            Hello.log('connection has failed');
        }
        if (status === Strophe.Status.AUTHENTICATING) {
            Hello.log('authenticating');
        }
        if (status === Strophe.Status.AUTHFAIL) {
            Hello.log('authentication has failed');
        }    
        if (status === Strophe.Status.CONNECTING) {
            Hello.log('connecting...');
        }    
        if (status === Strophe.Status.CONNECTED) {
            Hello.user = data.jid;
            $(document).trigger('connected');
            
        }
        if (status === Strophe.Status.DISCONNECTED) {
            $(document).trigger('disconnected');
        }
        
    });

    Hello.connection = conn;
});

$(document).bind('connected', function () {
    Hello.log('Connection established...');
    
    Hello.connection.addHandler(Hello.handle_resp, null, null, null);
    Hello.connection.addHandler(Hello.handle_msg, null, 'message', 'chat');
        
    var domain = Strophe.getDomainFromJid(Hello.connection.jid);
    
    //Display the contacts list
    $(document).trigger('get_contacts');
    
    $('#chat_form').removeClass('hidden');
    $('.msg_log').scrollTop($('.msg_log').height());
    $('#chat_form').submit(function () {
        var text = $("#chat_input").val();
        var to = 'kurt.campher@synthasite.com';
        $("#chat_input").val('');
        Hello.send_msg(text, to);     
        return false;
    });
    
});

$(document).bind('get_contacts', function () {
    $('#user_contacts').removeClass('hidden');
    $('#contacts_link').click(function () {
        $('#contact_list').slideToggle();    
    });
    
    $(".user_contact").click(function () {
        var contact = $(this).text();
        Hello.build_new_chat(contact);
    });
});

$(document).bind('disconnected', function () {
    Hello.log('Connection terminated.');
    Hello.connection = null;
});
            
        

        
    
        
    
                  
                  
                  
                  

