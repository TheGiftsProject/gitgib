const QUEUE_NAME = "WorkQueue";
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
      markUpdatedOrFetched(client, key, score);
      cb()
    });
  },
  getScore: function (key, callback) {
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
    client.get(key, result);
  },
  keyToHash: function(key) {
    var temp = key.split("/");
    return {name:temp[0], repo:temp[1]}
  },
  hashToKey: function(hash) {
    return hash.name+"/"+hash.repo;
  },

  getNextProcessingChunk: function (amount, cb) {
    amount = amount || 60;
    var client = this.client;
    client.zrangebyscore(QUEUE_NAME, 0, "+inf", "LIMIT", 0, amount, function (err, res) {
      if(res.length < amount) {
        client.zrevrangebyscore(QUEUE_NAME, 0, "-inf", "LIMIT", 0, (amount-res.length), function(err, more_res) {
          var totalWork = more_res.concat(res);
          cb(totalWork);
        });
      } else {
        cb(res);
      }
    });
  }
};



function updateAccessCounter(client, key) {
  client.zincrby(QUEUE_NAME, -1, key); //We are storing the fetch "queue" in reverse order..
}
function queueForFetching(client, key) {
  client.zincrby(QUEUE_NAME, 1, key);
}

function markUpdatedOrFetched(client, key, cb) {
  client.zrem(QUEUE_NAME, key, cb);
}

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


//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=EXPORTS-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
exports.DB = DB;