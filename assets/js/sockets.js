function successNotify(){
	$.notify({
		  title:'SUCCESS',
		  message:'Websocket connected!'
		},
		{
		  type:'success',
		  allow_dismiss:false,
		  newest_on_top:true ,
		  mouse_over:true,
		  showProgressbar:true,
		  spacing:10,
		  timer:2000,
		  placement:{
		    from:'top',
		    align:'center'
		  },
		  offset:{
		    x:30,
		    y:30
		  },
		  delay:1000 ,
		  z_index:10000,
		  animate:{
		    enter:'animated bounce',
		    exit:'animated bounce'
		}
		});

}

function failNotify(){
	$.notify({
	  title:'WARNING',
	  message:'Websocket disconnected! Attempting to reconnect...'
	},
	{
	  type:'danger',
	  allow_dismiss:false,
	  newest_on_top:true ,
	  mouse_over:true,
	  showProgressbar:true,
	  spacing:10,
	  timer:2000,
	  placement:{
	    from:'top',
	    align:'center'
	  },
	  offset:{
	    x:30,
	    y:30
	  },
	  delay:1000 ,
	  z_index:10000,
	  animate:{
	    enter:'animated bounce',
	    exit:'animated bounce'
	}
	});	
}
$( document ).ready(function() {
	// Create a WebSocket Connection  
	var url = window.location.href;
	var arr = url.split("/");
	var shifu_addr = arr[2]
	var socket_api = "/socket"
	var websocket_uri = shifu_addr + socket_api
	const startConnection=()=>{
		return new WebSocket("wss://" + websocket_uri);
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
		console.log(event)
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
		var websocket= new WebSocket("wss://" + websocket_uri);
	}  
});
