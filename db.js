const FETCH_QUEUE_NAME = "fetchingQueue";
const UPDATE_QUEUE_NAME = "updateQueueName";
const redis = require("redis");


function DB(errorHandler) {
  this.client = getRedis(redis);
  this.client.on("error", errorHandler || console.log);
  this.publisher = getRedis(redis);
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=PROTOTYPE-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
DB.prototype = {
  setScore: function (key, score, cb) {
    var client = this.client;
    var publisher = this.publisher;
    client.exists(key, function (err, exists) {
      client.set(key, score);
      publisher.publish("score", key+"|"+score);
      markUpdatedOrFetched(client, key, score, exists);
      cb()
    });
  },
  getScore: function (key, callback) {
    var me = this;
    var client = this.client;
    function result(err, value) {
      if (value === null) {
        queueForFetching(client, key);
        callback(err, -1);
      } else {
        updateAccessCounter(client, key);
        callback(err, value);
      }
    }
    me.client.get(key, result);
  },
  keyToHash: function(key) {
    var temp = key.split("/");
    return {name:temp[0], repo:temp[1]}
  },
  hashToKey: function(hash) {
    return hash.name+"/"+hash.repo;
  },

  getNextProcessingChunk: function (amount, cb) {
//    this.client.flushall();
    amount = amount || 60;
    this.client.zrevrangebyscore(FETCH_QUEUE_NAME, "+inf", 0, "LIMIT", 0, amount, function (err, res) {
      cb(res);
    });
  }
};



//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=PRIVATE-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
function getRedis() {
  var client = null;
  if (process.env.REDISTOGO_URL) {
    var rtg = (require("url").parse(process.env.REDISTOGO_URL));
    client = redis.createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]);
  } else {
    client = redis.createClient();
  }
  return client;
}
function updateAccessCounter(client, key) {
  client.zincrby(UPDATE_QUEUE_NAME, 1, key);
}

function markUpdatedOrFetched(client, key, exists, cb) {
  if(exists) {
    client.zrem(FETCH_QUEUE_NAME, key, cb);
  } else {
    client.zrem(FETCH_QUEUE_NAME, key);
    client.zrem(UPDATE_QUEUE_NAME, key, cb);
  }
}

function queueForFetching(client, key) {
  client.zincrby(FETCH_QUEUE_NAME, 1, key);
}


//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=EXPORTS-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
exports.DB = DB;