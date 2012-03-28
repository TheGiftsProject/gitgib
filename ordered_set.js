function OrderedSet() {
  this.array = [];
  this.hash = {};
}

OrderedSet.prototype.extend({
  exists: function(key) {
    return this.hash[key]
  },
  push: function(key, value) {
    if(exists(key)) { throw "key "+key+" already exists in the list"; }
    this.array.push(key);
    this.hash[key] = value;
  },
  shift: function() {
    var key = this.array.shift;
    var value = this.hash[key]
    delete this.hash[key];
    return value;
  }
});


exports.OrderedSet = OrderedSet;

