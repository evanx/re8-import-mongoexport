
name='re8-import'
network="$name-network"
redisName="$name-redis"

removeContainers() {
    for name in $@
    do
      if docker ps -a -q -f "name=/$name" | grep '\w'
      then
        docker rm -f `docker ps -a -q -f "name=/$name"`
      fi
    done
}

removeNetwork() {
    if docker network ls -q -f name=^$network | grep '\w'
    then
      docker network rm $network
    fi
}

(
  removeContainers $redisName
  removeNetwork
  set -u -e -x
  sleep 1
  docker network create -d bridge re8-import-network
  redisContainer=`docker run --network=re8-import-network \
      --name $redisName -d redis`
  redisHost=`docker inspect $redisContainer |
      grep '"IPAddress":' | tail -1 | sed 's/.*"\([0-9\.]*\)",/\1/'`
  sleep 1
  redis-cli lpush resplit:q '{
    "placeId": "ChIJV3iUI-PPdkgRGA7v4bhZPlU",
    "formatted_address": "Blenheim Palace, Woodstock OX20 1PP, UK"
  }'
  docker build -t re8-import https://github.com/evanx/re8-import-mongoexport.git
  docker run --name re8-import-instance --rm -i \
    --network=re8-import-network \
    -e host=$redisHost \
    -e inq=resplit:q \
    -e busyq=busy:q \
    -e outq=re8:key:q \
    re8-import
  sleep 2
  redis-cli -h $redisHost keys '*'
  for key in `redis-cli -h $redisHost keys '*:q'`
  do
    echo $key
    redis-cli -h $redisHost lrange $key 0 -1
  done
  docker rm -f $redisName
  docker network rm $network
)
