# Copyright (c) 2019 Cisco Systems
# Licensed under the MIT License

#
# Script to keep the audio volume level set to a maximum value
#

import xows
import aiohttp
import asyncio


async def task():
    try:
        async with xows.XoWSClient('192.168.1.3', username='localadmin', password='ciscopsdt') as client:
            def callback(data, id):
                print(f'New event received with id: ({id}): {data}')

            print('Created subscription with number: ',
                  await client.subscribe(['Status', 'Audio', 'Volume'], callback, True))

            await client.wait_until_closed()
				
    except xows.XoWSError as error:
        print('Timeout, could not connect to device. Exiting...')
        print('error', error)
    except TimeoutError:
        print('TimeoutError')
    except aiohttp.client_exceptions.ClientConnectorError:
        print('ClientConnectorError')


try:
    asyncio.run(task())
except KeyboardInterrupt:
    print('Interrupted, exiting...')
