
for key in `redis-cli keys 'test:re8-import:*'`
do
  redis-cli del $key
done

redis-cli lpush 'test:re8-import:resplit:q' '{
  "placeId": "ChIJV3iUI-PPdkgRGA7v4bhZPlU",
  "formatted_address": "Blenheim Palace, Woodstock OX20 1PP, UK"
}'

redisHost=localhost \
redisPort=6379 \
idKey=placeId \
keyTemplate=place:{id}:json \
inq=test:re8-import:resplit:q \
busyq=test:re8-import:busy:q \
outq=test:re8-import:re8:key:q \
popTimeout=10 \
npm start

redis-cli keys 'test:re8-import:*'

for key in `redis-cli keys 'test:re8-import:*:q'`
do
  echo; echo $key
  redis-cli lrange $key 0 -1
done
