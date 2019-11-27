# Copyright (c) 2019 Cisco Systems
# Licensed under the MIT License 

#
# Usage sample from README.md at https://github.com/cisco-ce/pyxows
#

import xows
import asyncio

async def start():
    async with xows.XoWSClient(url_or_host='192.168.1.32', username='localadmin', password='ciscopsdt') as client:
        def callback(data, id_):
            print(f'Feedback (Id {id_}): {data}')

        print('Status Query:',
            await client.xQuery(['Status', '**', 'DisplayName']))

        print('Get:',
            await client.xGet(['Status', 'Audio', 'Volume']))

        print('Command:',
              await client.xCommand(['Audio', 'Volume', 'Set'], Level=60))

        print('Configuration:',
            await client.xSet(['Configuration', 'Audio', 'DefaultVolume'], 50))

        print('Subscription 1:',
            await client.subscribe(['Status', 'Audio', 'Volume'], callback, True))

        await client.wait_until_closed()

asyncio.run(start())