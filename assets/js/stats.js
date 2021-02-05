var highest_block=0;

var nf = Intl.NumberFormat();

var block_list = [];
var node_list = [];
var markers = [];
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? "hr " : "hr ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? "min " : "min ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? "sec" : "sec") : "";
    return hDisplay + mDisplay + sDisplay; 
}

function gravatar_uri(address,size){
  return 'https://secure.gravatar.com/avatar/' + md5(address) +'.jpg?s='+size+'&d=identicon&r=g';
}

function profile_link(address){
  return '<span class="user-profile" style="padding-right:5px;"><img src="' + gravatar_uri(address,24) + '" alt="profile-image" class="gravatar" ></span>' 
}

function processHistory(data){
  // nodes
  for (const [key, value] of Object.entries(data.nodes)) {
    d = {
      id: key,
      info: value
    }
    createNode(d);
  }  

  // blocks
  for (const [key, value] of Object.entries(data.blocks)) {
    d = {
      block: value
    }
    updateBlocks(d);    
  }  

  // stats
  for (const [key, value] of Object.entries(data.stats)) {
    d = {
      id:key,
      stats: value
    }
    updateStats(d);    
  }  

  // latency
  for (const [key, value] of Object.entries(data.latency)) {
    d = {
      id:key,
      latency: value
    }
    updateLatency(d);    
  }  

  // pending tx
  for (const [key, value] of Object.entries(data.pending)) {
    d = {
      id:key,
      stats: {
        pending: value
      }
    }
    updatePendingTransactions(d);    
  }  

  // ip2geo
  // TODO
  for (const [key, value] of Object.entries(data.ip2geo)) {
    d = {
      id:key,
      info: {
        ip: value.ip
      }
    }
    updateMap(d);    
  }  

}
function updateNodeCount(){
  $('#node-count').html(node_list.length);
}

function buildPill(count,warning,danger,lt=true){
  if(lt){
    if (count < danger){
      var color='danger' 
    } else {
      if (count < warning){
        var color='warning' 
      } else {
        var color='success'
      }
    }
  } else {
    if (count > danger){
      var color='danger' 
    } else {
      if (count > warning){
        var color='warning' 
      } else {
        var color='success'
      }
    }

  }
  return '<span class="font-' + color +' f-12"><h6 class="mb-0">' + nf.format(count) + '</h6></span>'
}
function buildPeerPill(count){
  return buildPill(count,6,4);
}
function buildLatencyPill(count){
  return buildPill(count,250,150,false);
}
function buildTxPill(count){
  return '<span class="font-primary f-12"><h6 class="mb-0">' + count + '</h6></span>'
}
function buildBlocksPill(node_block){
  if ((highest_block - node_block) > 5){
    var color='danger' 
  } else {
    if ((highest_block - node_block) > 2){
      var color='warning' 
    } else {
      var color='success'
    }
  }
  return '<span class="font-' + color +' f-12"><h6 class="mb-0">' + nf.format(node_block) + '</h6></span>'
}
function createNode(data){
  var tag = md5(data.id)
  if (!node_list.find(function(x){ return x === tag }) ){
    row = '<tr>' +
            '<td class="text-center"><div class="recent-images"><span class="badge badge-pill badge-info f-12 d-none" id="validator_' + tag + '"><h6 class="mb-0">Validator</h6></span></div></td>' +
            '<td class="text-center"><h5 class="default-text mb-0 f-w-700 f-18">' + data.info.name + '</h5></td>' +
            '<td class="f-w-700 text-center">' + data.info.node + '</td>' +
            '<td class="text-center" id="flag_'+ tag +'"><i class="flag-icon flag-icon- fa-2x "></i></td>' +
            '<td class="text-center" id="peers_'+ tag + '">' + buildPeerPill(0) + '</td>' +
            '<td class="text-center" id="latency_'+ tag + '">' + buildLatencyPill(0) + 'ms</td>' +
            '<td class="text-center" id="tx_'+ tag + '">' + buildTxPill(0) + '</td>' +
            '<td class="text-center" id="blocks_'+ tag + '">' + buildBlocksPill(0) + '</td>' +
          '</tr>';
    node_list.push(tag);
    updateNodeCount();
    $(row)
      .hide()
      .prependTo($('#node_table_body'))
      .fadeIn("slow")
      .addClass('normal');
    updateMap(data);
  }
}

function updateLatency(data){
  var tag = md5(data.id)
  /*
  latency
  {'id': 'Testing', 'latency': '1'}
  */
  $('#latency_' + tag).html(buildLatencyPill(data.latency))
}

function updatePendingTransactions(data){
  var tag = md5(data.id)
  /*
    pending
    {'id': 'Testing', 'stats': {'pending': 0}}
  */
  $('#tx_' + tag).html(buildTxPill(data.stats.pending))  
}

function updateStats(data){
  /*
    stats
  {'id': 'Testing', 'stats': {'active': True, 'syncing': True, 'mining': False, 'hashrate': 0, 'peers': 6, 'gasPrice': 250000000, 'uptime': 100}}
  */
  var tag = md5(data.id)
  if (data.stats.mining){
    $('#validator_' + tag).removeClass('d-none');
  } else {
    $('#validator_' + tag).addClass('d-none');
  }
  $('#peers_' + tag).html(buildPeerPill(data.stats.peers))
}

function updateNodeBlock(data){
  var tag = md5(data.id)
  $('#blocks_' + tag).html(buildBlocksPill(data.block.number));
}

var block_bar_val = 0;

function updateBlocks(data){
  if (!block_list.find(function(x){ return x === data.block.hash})){
    if (data.block.number > highest_block){
      block_list.push(data.block.hash); 
      tx_count = data.block.transactions.length;
      if (tx_count>150){
        tx_color='success'
      } else {
        if (tx_count > 10){
          tx_color='warning'
        } else {
          tx_color='danger'
        }
      }
      $('<tr class="anim info"><td><a href="https://scan.tao.network/block/' + data.block.number + '" target="_blank" class="font-info">' + data.block.hash + '</a></td><td><div class="badge badge-' + tx_color + ' label-square"><i class="fa fa-code-fork"></i><span class="f-14">' + tx_count + '</span></div></td></tr>')
        .hide()
        .prependTo($('#last_blocks_body'))
        .fadeIn("slow")
        .addClass('normal');
      $('#last_blocks_table tr:last').remove();
      if (block_list.length > 10)
        block_list = block_list.slice(0,10);   
      updateHighestBlock(data.block.number,NaN);
    }
  }
}

function updateHighestBlock(block_number,timestamp){
	$('#block-progress').css("width", "0%");
	highest_block = block_number;
	$('#block-number').html(nf.format(block_number));
	$('#last_block_time').html(timestamp);
  block_bar_val = 0;
}

function addMarkerToMap(lat,lng,key) {
  map = $('#location_map');
  if (!markers.find(function(x){ return x === key})){
    var marker = new H.map.Marker({lat:lat, lng:lng});
    map.addObject(marker);
    markers.push(key);
  }
}

function updateMap(data){
  const geo_api_key='122e3cf0c5039549e14a02ba485bc7ab';
  const geo_url = 'http://api.ipstack.com/';
  var geo_params = '?access_key='+geo_api_key+'&output=json';
  var ip = data.info.ip;
  var geo_uri = geo_url + ip + geo_params;
  var tag = md5(data.id);
  if (!markers.find(function(x){ return x === tag})){
    $.ajax({
      type: 'GET',
      url: geo_uri,
      dataType: 'json',
      success: function (result) {
        const lat = result.latitude;
        const lng = result.longitude;
        const emoji = '<i class="flag-icon flag-icon-' + result.country_code.toLowerCase() + '"></i>'; 
        $('#flag_' + tag).html(emoji);
        addMarkerToMap(lat,lng,tag);
      });
    });
  }  
/*
{
  "ip": "134.201.250.155",
  "hostname": "134.201.250.155",
  "type": "ipv4",
  "continent_code": "NA",
  "continent_name": "North America",
  "country_code": "US",
  "country_name": "United States",
  "region_code": "CA",
  "region_name": "California",
  "city": "Los Angeles",
  "zip": "90013",
  "latitude": 34.0453,
  "longitude": -118.2413,
  "location": {
    "geoname_id": 5368361,
    "capital": "Washington D.C.",
    "languages": [
        {
          "code": "en",
          "name": "English",
          "native": "English"
        }
    ],
    "country_flag": "https://assets.ipstack.com/images/assets/flags_svg/us.svg",
    "country_flag_emoji": "🇺🇸",
    "country_flag_emoji_unicode": "U+1F1FA U+1F1F8",
    "calling_code": "1",
    "is_eu": false
  },
  "time_zone": {
    "id": "America/Los_Angeles",
    "current_time": "2018-03-29T07:35:08-07:00",
    "gmt_offset": -25200,
    "code": "PDT",
    "is_daylight_saving": true
  },
  "currency": {
    "code": "USD",
    "name": "US Dollar",
    "plural": "US dollars",
    "symbol": "$",
    "symbol_native": "$"
  },
  "connection": {
    "asn": 25876,
    "isp": "Los Angeles Department of Water & Power"
  },
  "security": {
    "is_proxy": false,
    "proxy_type": null,
    "is_crawler": false,
    "crawler_name": null,
    "crawler_type": null,
    "is_tor": false,
    "threat_level": "low",
    "threat_types": null
  }
}
*/
}

var shifu_api = "https://shifu-beta.tao.network/api/network_info/"
function getShifuData(shifu_api){
    $.ajax({
      type: 'GET',
      url: shifu_api,
      dataType: 'json',
      success: function (result) {
      	block_number = parseFloat(result.current_block).toFixed(4)
        if (highest_block == 0){
          highest_block = block_number          
          updateHighestBlock(block_number,result.block_timestamp);
        }
    		if (block_bar_val < 100){
          block_bar_val = block_bar_val + 20;
          $("#block-progress").css("width", block_bar_val + "%")
    		} else {
          block_bar_val = 0;
        }
      	$('#validator-count').html(result.validator_count);
      	$('#lifetime-roi').html(result.validator_avg_roi);

        time_until_next_epoch = (Math.abs(result.current_block - (result.epoch + 1) * 360 ) * 5);
        $('#epoch').html(nf.format(parseFloat(result.epoch).toFixed(4)));
        next_epoch_block = Math.abs((result.epoch * 360) + 360 );
        epoch_perc = (360 - (next_epoch_block - result.current_block))  / 360 * 100;
        $('#epoch-progress').css("width",(epoch_perc) + "%")
        $('#last_epoch_time').html('Next: ' + secondsToHms(time_until_next_epoch));
      },
    });     
}
const everySecond=()=>{
	getShifuData(shifu_api);
}
$( document ).ready(function() {
    var i = setInterval(function() {
      everySecond();
    }, 1000);
});