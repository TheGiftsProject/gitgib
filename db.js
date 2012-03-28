const FETCH_QUEUE_NAME = "fetchingQueue";
const UPDATE_QUEUE_NAME = "updateQueueName";

const redis = require("redis");

function DB(errorHandler) {
  this.client = getRedis(redis);
  this.client.on("error", errorHandler || console.log);
}

  // PROTOTYPE
DB.prototype.extend({
  setScore: function (key, score) {
    this.client.exists(key, function (err, exists) {
      this.client.set(key, score);
      if (exists) {
        markUpdated(this.client, key);
      } else {
        markFetched(this.client, key);
      }
    });
  },

  getScore: function (key, callback) {
    var me = this;

    function result(err, value) {
      if (value === null) {
        queueForFetching(this.client, key);
      } else {
        updateAccessCounter(client, key);
        callback(err, value);
      }
    }

    me.client.get(key, result);
  },

  getNextProcessingChunk: function (amount) {
    amount = amount || 60;
    this.client.zrevrangebyscore(FETCH_QUEUE_NAME, "+inf", 0, "LIMIT", 0, amount, function (err, res) {
      console.dir(res);
    });
  }
});

  //PRIVATE
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

function markFetched(client, key) {
  client.zrem(FETCH_QUEUE_NAME, key);
}

function queueForFetching(client, key) {
  client.zincrby(FETCH_QUEUE_NAME, 1, key);
}

function markUpdated(client, key) {
  client.zrem(UPDATE_QUEUE_NAME, key);
}

exports.DB = DB;






