import asyncio,json,logging
import aiohttp, sys, pytz, os
from aiohttp import web
from aiohttp_wsgi import WSGIHandler
from aiohttp_session import get_session
from flask import Flask, render_template, jsonify
import pydash 
from types import SimpleNamespace
from ip2geotools.databases.noncommercial import DbIpCity
from collections import OrderedDict
from itertools import islice
from pathlib import Path

class SlicableOrderedDict(OrderedDict):
	def __getitem__(self, k):
		if not isinstance(k, slice):
			return OrderedDict.__getitem__(self, k)
		x = SlicableOrderedDict()
		for idx, key in enumerate(self.keys()):
			if k.start <= idx < k.stop:
				x[key] = self[key]
		return x

PATH = Path(__file__).resolve().parent
ASSET_PATH = os.path.join(PATH,'assets')


SECRET = 'trowel-moral-freedom-able-chest-success-climate'
INFO = {}
LATENCY = {}
STATS = {}
PENDING = {}
IP_ADDR = {}
BLOCKS=SlicableOrderedDict()

MAX_BLOCKS_HISTORY = 10
MAX_TRANSACTION_HISTORY = 100
MAX_HISTORY_UPDATE = 50
MAX_CONNECTION_ATTEMPTS = 50
CONNECTION_ATTEMPTS_TIMEOUT = 1000
QUORUM_COUNT=150

app = Flask(__name__)
app.config['DEBUG'] = True
app.jinja_loader.searchpath.insert(0, '.')

log = logging.getLogger(__name__)

@app.route('/')
def index():
	return render_template('index.html')

class ClientSocket(web.View):
	async def get(self):
		ws = web.WebSocketResponse()
		await ws.prepare(self.request)
		if (not 'websockets' in self.request.app.keys()):
			self.request.app['websockets']=[]
		
		self.request.app['websockets'].append(ws)
		await send_history(ws)
		async for msg in ws:
			if msg.tp == MsgType.text:
				if msg.data == 'close':
					await ws.close()
				else:
					log.debug(result)
			elif msg.tp == MsgType.error:
				log.debug('ws connection closed with exception %s' % ws.exception())

		self.request.app['websockets'].remove(ws)
		log.debug('websocket connection closed')

		return ws

async def send_history (ws):
	# this is the socket for the UI
	data = {
		'emit':[ 'history', {		
			'nodes':INFO,
			'latency': LATENCY,
			'stats': STATS,
			'pending': PENDING,
			'blocks': BLOCKS,
			'ip2geo':IP_ADDR
		}]
	} 
	await ws.send_str(json.dumps(data))

async def emit(_ws,topic,payload=None):
	if payload is None:
		msg={ 'emit':[ topic ] }
	else:
		msg={ 'emit':[ topic, payload] }
	if _ws is not None:
		if _ws._req is not None:
			if _ws._req.transport is not None:
				if not _ws._req.transport.is_closing():
					await _ws.send_str(json.dumps(msg))


async def handle_hello(socket, payload):
	global INFO
	global IP_ADDR
	if payload['secret'] == SECRET:
		INFO[payload['id']]=payload['info']
		if payload['ip'][0:7] == '192.168':
			lat=0.0
			longi=0.0
		else:
			lat=0.0
			longi=0.0
		IP_ADDR[payload['id']]={
			'ip':payload['ip'],
			'geo': '{0},{1}'.format(lat,longi) 
		}
		print (payload)
		await emit(socket,'ready')
	else:
		await socket.close()

async def handle_node_ping(socket,payload):
	await emit(socket,'node-pong',{
		'clientTime':payload['clientTime'],
		'serverTime':pydash.utilities.now()
	})

async def handle_latency(socket, payload):
	global LATENCY
	LATENCY[payload['id']]=payload['latency']

async def handle_history(socket, payload):
	print(payload)

async def handle_stats(socket, payload):
	global STATS
	STATS[payload['id']]=payload['stats']

async def handle_pending(socket, payload):
	global PENDING
	PENDING[payload['id']]=payload['stats']['pending']

async def handle_block(socket, payload):
	global BLOCKS
	BLOCKS.update({ payload['block']['hash'] : payload['block'] })
	BLOCKS.move_to_end(payload['block']['hash'],last=False)
	keeper = 0
	if len(BLOCKS) > MAX_BLOCKS_HISTORY:
		BLOCKS=BLOCKS[0:MAX_BLOCKS_HISTORY-1]

async def handle_update(socket, payload):
	print(payload)

class NodeSocket(web.View):
	"""
	hello
	{'id': 'Testing', 'info': {'name': 'Testing', 'node': 'tao/Testing/v2.2.1-stable/linux-amd64/go1.12.17', 'port': 20202, 'net': '558', 'protocol': 'eth/63', 'api': 'No', 'os': 'linux', 'os_v': 'amd64', 'client': '0.1.1', 'canUpdateHistory': True}, 'secret': 'trowel-moral-freedom-able-chest-success-climate'}
	node-ping
	{'clientTime': '2021-02-04 14:24:53.044383714 +0000 UTC m=+18476.440831755', 'id': 'Testing'}
	latency
	{'id': 'Testing', 'latency': '1'}
	block
	{'block': {'number': 3721676, 'hash': '0x1083cf440419f5a082d0e59530441f61a8715675e3adf5e43e910aee1fda6b13', 'parentHash': '0xeeea3669e9138f052d8763fcb612dca68597da502f5ff2db6fbfb8c9003cab94', 'timestamp': 1612448693, 'miner': '0x053b283836c9bc6f4bb1eec207337089cba8bdd6', 'gasUsed': 0, 'gasLimit': 84000000, 'difficulty': '19', 'totalDifficulty': '19672013', 'transactions': [{'hash': '0x89398aa948b8f8b18e767ed9bea957507973d31d4dffd82796a1bfe595b586f2'}], 'transactionsRoot': '0x43d84d2e02f5ade429f15ab140e4806a22b5863366d70858c1c0367209f8049a', 'stateRoot': '0x1e4e904ec924e359adb16dfedf37d8a7a071b660ba9965d6d187eb9a6c7df186', 'uncles': []}, 'id': 'Testing'}
	pending
	{'id': 'Testing', 'stats': {'pending': 0}}
	stats
	{'id': 'Testing', 'stats': {'active': True, 'syncing': True, 'mining': False, 'hashrate': 0, 'peers': 6, 'gasPrice': 250000000, 'uptime': 100}}
	"""
	async def get(self):
		ws = web.WebSocketResponse()
		await ws.prepare(self.request)
		_id=''
		try:
			if (not 'websockets' in self.request.app.keys()):
				self.request.app['websockets']=[]
			async for msg in ws:
				if msg.type == aiohttp.WSMsgType.TEXT:
					ser = json.loads(msg.data)
					topic = ser['emit'][0]
					ser['emit'][1]['ip'] = self.request.remote
					payload = ser['emit'][1]
					_id = payload['id']
					for _ws in self.request.app['websockets']:
						if _ws is not None:
							if _ws._req is not None:
								if _ws._req.transport is not None:
									if not _ws._req.transport.is_closing():
										await _ws.send_str(json.dumps(ser))
					function=getattr(sys.modules[__name__], 'handle_{0}'.format(topic.replace('-','_')))
					if topic == 'end':
						del INFO[_id]
						del LATENCY[_id]
						del STATS[_id]
						del PENDING[_id]
						del IP_ADDR[_id]
						await ws.close()
					else:
						await function(ws,payload)
				elif msg.type == aiohttp.WSMsgType.ERROR:
					# delete node 
					print('ws connection closed with exception %s' %
						  ws.exception())
		except ConnectionResetError:
			pass
		del INFO[_id]
		del LATENCY[_id]
		del STATS[_id]
		del PENDING[_id]
		del IP_ADDR[_id]
		print('{0} connection closed'.format(request.remote))

		return ws

if __name__ == "__main__":
	loop = asyncio.get_event_loop()
	aio_app = web.Application()
	wsgi = WSGIHandler(app)
	aio_app.router.add_route('*', '/{path_info: *}', wsgi.handle_request)
	aio_app.router.add_routes([web.static('/assets', ASSET_PATH)])
	aio_app.router.add_route('GET', '/socket',ClientSocket)
	aio_app.router.add_route('GET', '/api', NodeSocket)
try:
	web.run_app(aio_app, port=3000)
except KeyboardInterrupt:
	log.debug(' Stop server begin')
