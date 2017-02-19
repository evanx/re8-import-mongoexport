
name='reimport'
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
  docker network create -d bridge reimport-network
  redisContainer=`docker run --network=reimport-network \
      --name $redisName -d redis`
  redisHost=`docker inspect $redisContainer |
      grep '"IPAddress":' | tail -1 | sed 's/.*"\([0-9\.]*\)",/\1/'`
  sleep 1
  redis-cli lpush resplit:q '{
    "place_id": "ChIJV3iUI-PPdkgRGA7v4bhZPlU",
    "formatted_address": "Blenheim Palace, Woodstock OX20 1PP, UK"
  }'
  docker build -t reimport https://github.com/evanx/reimport.git
  docker run --name reimport-instance --rm -i \
    --network=reimport-network \
    -e redisHost=$redisHost \
    -e idKey=place_id \
    -e keyTemplate=place:{id}:json \
    -e inq=resplit:q \
    -e busyq=busy:q \
    -e outq=re8:key:q \
    -e popTimeout=1 \
    reimport
  sleep 2
  redis-cli -h $redisHost keys '*'
  redis-cli -h $redisHost llen resplit:q | grep ^0$
  redis-cli -h $redisHost llen busy:q | grep ^0$
  redis-cli -h $redisHost llen re8:key:q | grep ^1$
  redis-cli -h $redisHost lindex re8:key:q 0
  docker rm -f $redisName
  docker network rm $network
  echo 'OK'
)
