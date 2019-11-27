# Extract from xows article
# https://community.cisco.com/t5/collaboration-voice-and-video/xapi-over-websocket-xows-ce9-7-x/ba-p/3831553

import websockets
import ssl
import asyncio
import base64


async def connect():
	return await websockets.connect('wss://{}/ws/'.format('192.168.1.3'), ssl=ssl._create_unverified_context(), extra_headers={
		'Authorization': 'Basic {}'.format(base64.b64encode('{}:{}'.format('localadmin', 'ciscopsdt').encode()).decode('utf-8'))})


async def send(ws, message):
	await ws.send(message)
	print('Sending:', message)


async def receive(ws):
	result = await ws.recv()
	print('Receive:', result)


async def task():
	try:
		ws = await connect()
	except TimeoutError as timeout:
		print('could not connect to device, error: ', timeout)
	else:
		try: 
			await send(ws, '{"jsonrpc": "2.0","id": "0","method": "xGet","params": {"Path": ["Status", "SystemUnit", "State"]}}')
			await receive(ws)
		finally:
			await ws.close()

asyncio.run(task())
