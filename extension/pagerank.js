function PageRankAPI() {

}

PageRankAPI.HASH_SEED = "Mining PageRank is AGAINST GOOGLE'S TERMS OF SERVICE. Yes, I'm talking to you, scammer.";
PageRankAPI.PAGERANK_URL_PREFIX = "http://toolbarqueries.google.com/tbr?client=navclient-auto&ch=8"
PageRankAPI.PAGERANK_URL_SUFFIX = "&features=Rank&q=info:"

PageRankAPI.prototype.hash_query = function(url) { 
    for (var c = 16909125, d = 0; d < url.length; d++) {    
        c ^= PageRankAPI.HASH_SEED.charCodeAt(d % PageRankAPI.HASH_SEED.length) ^ url.charCodeAt(d);
        c = c >>> 23 | c << 9;
    }
    return this.hexEncodeU32(c)
}

PageRankAPI.prototype.toHex8 = function(byte) {
    return (byte < 16 ? "0" : "") + byte.toString(16)
}

PageRankAPI.prototype.hexEncodeU32 = function(byte) {
    var c = this.toHex8(byte >>> 24);
    c += this.toHex8(byte >>> 16 & 255);
    c += this.toHex8(byte >>> 8 & 255);
    return c + this.toHex8(byte & 255);
}

PageRankAPI.prototype.query = function(url, deferred) {    
    var hash = this.hash_query(url.split("#")[0].split("//")[1]);
    var query = PageRankAPI.PAGERANK_URL_PREFIX + hash + PageRankAPI.PAGERANK_URL_SUFFIX + url.split("//")[1];

    var xhr = new XMLHttpRequest();
    xhr.open("GET", query, false);
    xhr.send();
    var pageRank = 0;

    if (xhr.responseText.length < 15) {
        pageRank = xhr.responseText.split(":")[2].split("\n")[0];
    }

    deferred.resolve(pageRank);
    return deferred.promise();
}
