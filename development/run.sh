
for key in `redis-cli keys 'test:reimport:*'`
do
  redis-cli del $key
done

redis-cli lpush 'test:reimport:resplit:q' '{
  "place_id": "ChIJV3iUI-PPdkgRGA7v4bhZPlU",
  "formatted_address": "Blenheim Palace, Woodstock OX20 1PP, UK"
}'

redisHost=localhost \
redisPort=6379 \
redisNamespace=reimport \
idName=place_id \
idNamespace=place \
inQ=test:reimport:resplit:q \
busyQ=test:reimport:busy:q \
keyQ=test:reimport:key:q \
idQ=test:reimport:id:q \
idS=test:reimport:id:s \
popTimeout=10 \
npm start

redis-cli keys 'test:reimport:*'

for key in `redis-cli keys 'test:reimport:*:q'`
do
  echo; echo $key
  redis-cli lrange $key 0 -1
done
