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
    
    //Hello.connection.addHandler(Hello.handle_resp, null, null, null);
    Hello.connection.addHandler(Hello.handle_msg, null, 'message', 'chat');
    Hello.connection.addHandler(Hello.handle_roster, null, null, 'result', 'roster');
    
    var domain = Strophe.getDomainFromJid(Hello.connection.jid);
    
    //Display the contacts list
    $(document).trigger('get_contacts');
    
   
});

$(document).bind('get_contacts', function () {
   Hello.get_roster(); 
});

$(document).bind('disconnected', function () {
    Hello.log('Connection terminated.');
    Hello.connection = null;
});
            
        

        
    
        
    
                  
                  
                  
                  

