
redis-cli keys 'test:reimport:*' | xargs -n 1 redis-cli del

redis-cli lpush 'test:reimport:resplit:q' '{
  "formatted_address": "Blenheim Palace, Woodstock OX20 1PP, UK",
  "geometry": {
    "location": {
      "lat": 51.841365,
      "lng": -1.360972
    }
  },
  "place_id": "ChIJV3iUI-PPdkgRGA7v4bhZPlU"
}'

redisHost=localhost \
redisPort=6379 \
idKey=place_id \
keyTemplate=place:{id}:json \
inq=test:reimport:resplit:q \
busyq=test:reimport:busy:q \
outq=test:reimport:re8:key:q \
popTimeout=10 \
npm start

redis-cli keys 'test:reimport:*'

for key in `redis-cli keys 'test:reimport:*:q'`
do
  echo; echo $key
  redis-cli lrange $key 0 -1
done
