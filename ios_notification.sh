#!/bin/sh
curl -X POST -H "Content-Type: application/json" -d '{"value1": "'"$TR_TORRENT_NAME"'" }' https://maker.ifttt.com/trigger/download_finished/with/key/dUTta4UGe59ywWT3x25xwE
