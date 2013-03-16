/*
 * base64.js: An extremely simple implementation of base64 encoding / decoding using node.js Buffers
 *
 * (C) 2010, Nodejitsu Inc.
 * (C) 2011, Cull TV, Inc.
 *
 */
 
var base64 = exports;
var crypto = require('crypto');
 
base64.encode = function(unencoded) {
  return new Buffer(unencoded || '').toString('base64');
};
 
base64.decode = function(encoded) {
  return new Buffer(encoded || '', 'base64').toString('utf8');
};
 
base64.urlEncode = function(unencoded) {
  var encoded = base64.encode(unencoded);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
 
base64.urlDecode = function(encoded) {
  encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (encoded.length % 4)
    encoded += '=';
  return base64.decode(encoded);
};

var encrypt = function (input, password) {
    var m = crypto.createHash('md5');
    m.update(password)
    var key = m.digest('hex');

    m = crypto.createHash('md5');
    m.update(password + key)
    var iv = m.digest('hex');

    var data = new Buffer(input, 'utf8').toString('binary');

    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv.slice(0,16));
    var encrypted = cipher.update(data, 'binary') + cipher.final('binary');

    return encrypted;
};

var decrypt = function (input, password) {

    // Create key from password
    var m = crypto.createHash('md5');
    m.update(password)
    var key = m.digest('hex');

    // Create iv from password and key
    m = crypto.createHash('md5');
    m.update(password + key)
    var iv = m.digest('hex');

    // Decipher encrypted data
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv.slice(0,16));
    var decrypted = decipher.update(input, 'binary') + decipher.final('binary');
    var plaintext = new Buffer(decrypted, 'binary').toString('utf8');

    return plaintext;
};

base64.encrypt = function (text, salt) {
  return base64.urlEncode(encrypt(text, salt));
};
 
base64.decrypt = function (text, salt){  
  return decrypt(base64.urlDecode(text), salt);
};
