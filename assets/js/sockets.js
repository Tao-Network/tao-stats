function successNotify(){
			Lobibox.notify('success', {
			sound: false,
		    pauseDelayOnHover: true,
            continueDelayOnInactiveTab: false,
		    position: 'center top',
		    showClass: 'rollIn',
            hideClass: 'rollOut',
            icon: 'fa fa-check-circle',
            width: 600,
		    msg: 'Websocket connected!'
		    });

}

function failNotify(){
	Lobibox.notify('error', {
	sound: false,
    pauseDelayOnHover: true,
    continueDelayOnInactiveTab: false,
    icon: 'fa fa-times-circle',
    position: 'center top',
    showClass: 'lightSpeedIn',
    hideClass: 'lightSpeedOut',
    width: 600,
    msg: 'Websocket disconnected! Attempting to reconnect...'
    });
}
$( document ).ready(function() {
	// Create a WebSocket Connection  
	var url = window.location.href;
	var arr = url.split("/");
	var shifu_addr = arr[2]
	var socket_api = "/socket"
	var websocket_uri = shifu_addr + socket_api
	var protocol = ''
	if (url.indexOf('https')>-1){
		protocol = 'wss'
	} else {
		protocol='ws'
	}
	const startConnection=()=>{
		var uri = protocol + "://" + websocket_uri
		console.log(uri)
		return new WebSocket(uri);
	}

	var websocket = startConnection();

	websocket.onopen = function(event)
	{ onOpen(event) };

	   //Event handler for close 
	websocket.onclose = function(event)
	{ onClose(event) };

	   //Event handler for message
	websocket.onmessage = function(event)
	{ onMessage(event) }; 

	//Event handler for error
	websocket.onerror = function(event) 
	{ onError(event) }; 

	// Function for respective event    
	function onOpen(event) { 
		$('#socket-connection').removeClass("font-danger");
		$('#socket-connection').addClass("font-success");
		successNotify();
	} 
	function onClose(event){ 
		$('#socket-connection').removeClass("font-success");
		$('#socket-connection').addClass("font-danger");
		failNotify();
		websocket = startConnection();
	} 
	function onMessage(event){ 
		msg = JSON.parse(event.data);
		topic = msg.emit[0];
		payload = msg.emit[1];
		if (topic == "hello"){
			createNode(payload); 
			// recalculate everything
		}
		if (topic == "history"){
			processHistory(payload);
			// recalculate everything
		}
		if (topic == "stats"){
			updateStats(payload);
			// recalculate everything
		}
		if (topic == "block"){
			updateBlocks(payload);
  			updateNodeBlock(payload);
			// recalculate everything
		}
		if (topic == "latency"){
			updateLatency(payload);
			// recalculate everything
		}
		if (topic == "pending"){
			updatePendingTransactions(payload);
			// recalculate everything
		}
		if (topic == "end"){
			// remove node
			// recalculate everything
		}
	}  
	function onError(event) { 
		$('#socket-connection').removeClass("font-success");
		$('#socket-connection').addClass("font-danger");
		failNotify();
		websocket = startConnection();
	}
	var i = setInterval(function(){
		if (websocket.readyState === WebSocket.CLOSED) {
			$('#socket-connection').removeClass("font-success");
			$('#socket-connection').addClass("font-danger");
			websocket = startConnection();
		}
	}, 1000);  
});
