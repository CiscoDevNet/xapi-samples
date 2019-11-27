# Copyright (c) 2019 Cisco Systems
# Licensed under the MIT License

#
# Control the volume of a CE-powered device
#

import xows
import asyncio
import os

async def control_volume(device_url, user, passwd):

	async with xows.XoWSClient(url_or_host=device_url, username=user, password=passwd) as client:

		MAX_VOLUME = 60
		def callback(event, id):
			if id == callback_id:
				volume = event['Status']['Audio']['Volume']
				print(f'Volume currently set at level: {volume}')

				if volume > MAX_VOLUME:
					print(f'Volume above max authorized, turning down to: {MAX_VOLUME}')
					asyncio.create_task(client.xCommand(['Audio', 'Volume', 'Set'], Level=MAX_VOLUME))

		callback_id = await client.subscribe(['Status', 'Audio', 'Volume'], callback, True)

		await client.wait_until_closed()

try:
	device = os.environ.get('DEVICE_IP', default='192.168.1.32')
	user = os.environ.get('DEVICE_USER', default='localadmin')
	passwd = os.environ.get('DEVICE_PASSWD', default='ciscopsdt')
	asyncio.run(control_volume(device, user, passwd))
except AttributeError:
	print('invalid credentials')
except KeyboardInterrupt:
   print('exiting')
