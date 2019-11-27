# Extract from xows article
# https://community.cisco.com/t5/collaboration-voice-and-video/xapi-over-websocket-xows-ce9-7-x/ba-p/3831553

import websockets
import ssl
import asyncio
import base64
import json

count = 0

async def connect():
    return await websockets.connect('wss://{}/ws/'.format('10.10.10.1'), ssl=ssl._create_unverified_context(), extra_headers={
        'Authorization': 'Basic {}'.format(base64.b64encode('{}:{}'.format('admin', '').encode()).decode('utf-8'))})

def construct(method):
    global count
    count += 1
    return {'jsonrpc': '2.0', 'id': str(count), 'method': method}

def query(params):
    payload = construct('xQuery')
    payload['params'] = {'Query': params.split()}
    return payload

def get(params):
    payload = construct('xGet')
    params = [i if not i.isnumeric() else int(i) for i in params.split()]
    payload['params'] = {'Path': params}
    return payload

def command(path, params=None):
    payload = construct('{}{}'.format('xCommand/', '/'.join(path.split(' '))))

    # Params are for multiline commands and other command parameters {'ConfigId':'example', 'body':'<Extensions><Version>1.0</Version>...</Extensions>'}
    if params != None:
        payload['params'] = params

    return payload

def config(path, value):
    payload = construct('xSet')
    payload['params'] = {
        "Path": ['Configuration'] + path.split(' '),
        "Value": value
    }
    return payload

def feedbackSubscribe(path=None, notify=False):
    payload = construct('xFeedback/Subscribe')
    payload['params'] = {
        "Query": path.split(' '),
        "NotifyCurrentValue": notify
    }
    return payload

async def send(ws, message):
    await ws.send(json.dumps(message))
    print('Sending:', message)

async def receive(ws):
    result = await ws.recv()
    print('Receive:', result)

async def task():
    ws = await connect()
    try:
        await send(ws, get('Status SystemUnit Uptime'))
        await receive(ws)
    finally:
        asyncio.run(ws.close())

asyncio.run(task())