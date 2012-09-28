"use strict"
/*
 * Copyright ©2012 SARA bv, The Netherlands
 *
 * This file is part of js-webdav-client.
 *
 * js-webdav-client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * js-webdav-client is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with js-webdav-client.  If not, see <http://www.gnu.org/licenses/>.
 */

// If nl.sara.webdav.Client is already defined, we have a namespace clash!
if (nl.sara.webdav.Client !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Client already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class Connection to a WebDAV server
 * 
 * @param  {String}   host         The hostname or IP address of the server
 * @param  {Boolean}  useHTTPS     If set to true, HTTPS is used. If set to false or omitted, HTTP is used
 * @param  {Number}      port         Set a custom port to connect to. If not set, the default port will be used (80 for HTTP and 443 for HTTPS)
 */
nl.sara.webdav.Client = function(host, useHTTPS, port) {
  this._baseUrl = null;
  
  // Constructor logic
  if (host === undefined) {
    throw new nl.sara.webdav.Exception('WebDAV server not specified!', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  var protocol = (useHTTPS === true) ? 'https' : 'http';
  port = (port != undefined) ? port : ((protocol == 'https') ? 443 : 80);
  this._baseUrl = protocol + '://' + host + ((((protocol == 'http') && (port == 80)) || ((protocol == 'https') && (port == 443))) ? '' : ':' + port);
}

/**#@+
 * Class constant
 */
nl.sara.webdav.Client.PROPNAME = 1;
nl.sara.webdav.Client.ALLPROP = 2;
nl.sara.webdav.Client.INFINITY = 'infinity';
nl.sara.webdav.Client.FAIL_ON_OVERWRITE = 3;
nl.sara.webdav.Client.TRUNCATE_ON_OVERWRITE = 4;
nl.sara.webdav.Client.SILENT_OVERWRITE = 5;
/**#@-*/

/**
 * Converts a path to the full url (i.e. appends the protocol and host part)
 * 
 * @param   {String}  path  The path on the server
 * @returns {String}        The full url to the path
 */
nl.sara.webdav.Client.prototype.getUrl = function(path) {
  if (path.substring(0,1) != '/') {
    path = '/' + path;
  }
  return this._baseUrl + path;
}

/**
 * Perform a WebDAV PROPFIND request
 * 
 * @param   {String}                        path      The path get a PROPFIND for
 * @param   {Function(status,Multistatus)}  callback  Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   {String}                        depth     Value for the 'depth' header, should be either '0', '1' or the class constant INFINITY. When omitted, '0' is used. See RFC 4916.
 * @param                                   props     The properties to fetch. Should be either one of the class constants PROPNAME or ALLPROP or an array with Property objects. When omitted, ALLPROP is assumed. See RFC 4916.
 * @param   {nl.sara.webdav.Property[]}               include   An array with Property objects used for the <include> element. This is only used for ALLPROP requests. When omitted, no <include> element is send. See RFC 4916.
 * @returns  {nl.sara.webdav.Client}                                  The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.propfind = function(path, callback, depth, props, include) {
  if ((path === undefined) || (callback === undefined)) {
    throw new nl.sara.webdav.Exception('PROPFIND requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if (!(typeof path == "string")) {
    throw new nl.sara.webdav.Exception('PROPFIND parameter; path should be a string', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);
  
  // Check the depth header
  if (depth === undefined) { // We default depth to 0, not to infinity as this is not supported by all servers
    depth = 0;
  }
  var depthHeader = null;
  switch (depth) {
    case 0:
    case 1:
      depthHeader = depth;
      break;
    case nl.sara.webdav.Client.INFINITY:
      depthHeader = 'infinity';
      break;
    default:
      throw new nl.sara.webdav.Exception("Depth header should be '0', '1' or nl.sara.webdav.Client.INFINITY", nl.sara.webdav.Exception.WRONG_VALUE);
    break;
  }
  
  // Create the request XML
  if (props === undefined) {
    props = nl.sara.webdav.Client.ALLPROP;
  }
  var propsBody = document.implementation.createDocument("DAV:", "propfind", null);
  switch (props) { // Find out what the request is for
    case nl.sara.webdav.Client.PROPNAME: // User wants all property names
      propsBody.documentElement.appendChild(propsBody.createElementNS('DAV:', 'propname'));
      break;
    case nl.sara.webdav.Client.ALLPROP: // User wants all properties
      propsBody.documentElement.appendChild(propsBody.createElementNS('DAV:', 'allprop'));
      if (include !== undefined) { // There is content for the <DAV: include> tags, so parse it
        if (!(include instanceof Array)) {
          throw new nl.sara.webdav.Exception('Propfind parameter; include should be an array', nl.sara.webdav.Exception.WRONG_TYPE);
        }
        var includeBody = propsBody.createElementNS('DAV:', 'include');
        for (var i = 0; i < include.length; i++) {
          var item = include[i];
          if (!(item instanceof nl.sara.webdav.Property)) {
            continue;
          }
          includeBody.appendChild(propsBody.createElementNS(item.get('namespace'), item.get('tagname')));
        }
        if (includeBody.hasChildNodes()) { // But only really add the <include> tag if there is valid content
          propsBody.documentElement.appendChild(includeBody);
        }
      }
      break;
    default: // The default is to expect an array with Property objects; the user wants the values of these properties
      if (!(props instanceof Array)) {
        throw new nl.sara.webdav.Exception('Props parameter should be nl.sara.webdav.Client.PROPNAME, nl.sara.webdav.Client.ALLPROP or an array with Property objects', nl.sara.webdav.Exception.WRONG_VALUE);
      }
      var propertyBody = propsBody.createElementNS('DAV:', 'prop');
      for (var i = 0; i < props.length; i++) { // Cycle through the array
        var prop = props[i];
        if (!(prop instanceof nl.sara.webdav.Property)) {
          continue;
        }
        propertyBody.appendChild(prop.get('namespace'), prop.get('tagname'));
      }
      if (!propertyBody.hasChildNodes()) { // But if no properties are found, then the array didn't have Property objects in it
        throw new nl.sara.webdav.Exception("Propfind parameter; if props is an array, it should be an array of Properties", nl.sara.webdav.Exception.WRONG_TYPE);
      }
      propsBody.documentElement.appendChild(propertyBody);
    break;
  }
  var serializer = new XMLSerializer();
  var body = '<?xml version="1.0" encoding="utf-8" ?>' + serializer.serializeToString(propsBody);
  
  // And then send the request
  var ajax = nl.sara.webdav.Client.getAjax("PROPFIND", url, callback);
  ajax.setRequestHeader('Depth', depthHeader);
  ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
  ajax.send(body);

  return this;
}

/**
 * Perform a WebDAV PROPPATCH request
 * 
 * @param   {String}                        path      The path do a PROPPATCH on
 * @param   {Function(status,Multistatus)}  callback  Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   {nl.sara.webdav.Property[]}               setProps  The properties to set. If not set, delProps should be set.
 * @param   {nl.sara.webdav.Property[]}               delProps  The properties to delete. If not set, setProps should be set.
 * @returns  {nl.sara.webdav.Client}                                  The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.proppatch = function(path, callback, setProps, delProps) {
  if ((path === undefined) || (callback === undefined) || ((setProps === undefined) && (delProps === undefined))) {
    throw new nl.sara.webdav.Exception('PROPPATCH requires the parameters path, callback and at least one of setProps or delProps', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if (!(typeof path == "string") || ((setProps !== undefined) && !(setProps instanceof Array)) || ((delProps !== undefined) && !(delProps instanceof Array))) {
    throw new nl.sara.webdav.Exception('PROPPATCH parameter; path should be a string, setProps and delProps should be arrays', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);
  
  // Create the request XML
  var propsBody = document.implementation.createDocument("DAV:", "propertyupdate", null);
  propsBody.documentElement.setAttribute("xmlns:D", "DAV:");
  if (setProps !== undefined) {
    var props = propsBody.createElementNS('DAV:', 'prop');
    for (var i = 0; i < setProps.length; i++) { // Cycle through the array
      var prop = setProps[i];
      if (!(prop instanceof nl.sara.webdav.Property)) {
        continue;
      }
      if (prop.get('xmlvalue') !== null) {
        props.appendChild(prop.get('xmlvalue'));
      }else{
        var element = propsBody.createElementNS(prop.get('namespace'), prop.get('tagname'));
        element.appendChild(propsBody.createCDATASection(prop.get('value')));
        props.appendChild(element);
      }
    }
    if (!props.hasChildNodes()) { // But if no properties are found, then the array didn't have Property objects in it
      throw new nl.sara.webdav.Exception("Proppatch parameter; setProps should be an array of Properties", nl.sara.webdav.Exception.WRONG_TYPE);
    }
    var set = propsBody.createElementNS('DAV:', 'set');
    set.appendChild(props);
    propsBody.documentElement.appendChild(set);
  }
  if (delProps !== undefined) {
    var props = propsBody.createElementNS('DAV:', 'prop');
    for (var i = 0; i < delProps.length; i++) { // Cycle through the array
      var prop = delProps[i];
      if (!(prop instanceof nl.sara.webdav.Property)) {
        continue;
      }
      var element = propsBody.createElementNS(prop.get('namespace'), prop.get('tagname'));
      props.appendChild(element);
    }
    if (!props.hasChildNodes()) { // But if no properties are found, then the array didn't have Property objects in it
      throw new nl.sara.webdav.Exception("Proppatch parameter; delProps should be an array of Properties", nl.sara.webdav.Exception.WRONG_TYPE);
    }
    var remove = propsBody.createElementNS('DAV:', 'remove');
    remove.appendChild(props);
    propsBody.documentElement.appendChild(remove);
  }
  var serializer = new XMLSerializer();
  var body = '<?xml version="1.0" encoding="utf-8" ?>' + serializer.serializeToString(propsBody);

  // And then send the request
  var ajax = nl.sara.webdav.Client.getAjax("PROPPATCH", url, callback);
  ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
  ajax.send(body);

  return this;
}

/**
 * Perform a WebDAV MKCOL request
 * 
 * @param   {String}                        path         The path to perform MKCOL on
 * @param   {Function(status,Multistatus)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   {String}                        body         Optional; a body to include in the MKCOL request.
 * @param   {String}                        contenttype  Optional; the content type of the body (i.e. value for the Content-Type header). If omitted, but body is specified, then 'application/xml; charset="utf-8"' is assumed
 * @returns  {nl.sara.webdav.Client}                                     The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.mkcol = function(path, callback, body, contenttype) {
  if ((path === undefined) || (callback === undefined)) {
    throw new nl.sara.webdav.Exception('MKCOL requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if ((typeof path != "string") || ((body !== undefined) && (typeof body != 'string')) || ((contenttype !== undefined) && (typeof contenttype != 'string'))) {
    throw new nl.sara.webdav.Exception('MKCOL parameter; path and body should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // And then send the request
  var ajax = nl.sara.webdav.Client.getAjax("MKCOL", url, callback);
  if (body !== undefined) {
    if (contenttype !== undefined) {
      ajax.setRequestHeader('Content-Type', contenttype);
    }else{
      ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
    }
    ajax.send(body);
  }else{
    ajax.send();
  }

  return this;
}

/**
 * Perform a WebDAV DELETE request
 *
 * Because 'delete' is an operator in JavaScript, I had to name this method
 * 'remove'. However, performs a regular DELETE request as described in
 * RFC 4918
 * 
 * @param   {String}                        path         The path to perform DELETE on
 * @param   {Function(status,Multistatus)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @returns  {nl.sara.webdav.Client}                                     The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.remove = function(path, callback) {
  if ((path === undefined) || (callback === undefined)) {
    throw new nl.sara.webdav.Exception('DELETE requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if (typeof path != "string"){
    throw new nl.sara.webdav.Exception('DELETE parameter; path should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // And then send the request
  var ajax = nl.sara.webdav.Client.getAjax("DELETE", url, callback);
  ajax.send();

  return this;
}

/**
 * Perform a WebDAV GET request
 * 
 * @param   {String}                    path         The path to GET
 * @param   {Function(status,content)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @returns  {nl.sara.webdav.Client}                                 The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.get = function(path, callback) {
  if ((path === undefined) || (callback === undefined)) {
    throw new nl.sara.webdav.Exception('GET requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if (typeof path != "string"){
    throw new nl.sara.webdav.Exception('GET parameter; path should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // And then send the request
  var ajax = null;
  ajax = nl.sara.webdav.Client.getAjax("GET", url, function(status) {
    callback(status, ajax.responseText);
  });
  ajax.send();

  return this;
}

/**
 * Perform a WebDAV HEAD request
 *
 * @param   {String}                    path         The path to perform HEAD on
 * @param   {Function(status,headers)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @returns  {nl.sara.webdav.Client}                                 The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.head = function(path, callback) {
  if ((path === undefined) || (callback === undefined)) {
    throw new nl.sara.webdav.Exception('HEAD requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if (typeof path != "string"){
    throw new nl.sara.webdav.Exception('HEAD parameter; path should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // And then send the request
  var ajax = null;
  ajax = nl.sara.webdav.Client.getAjax("HEAD", url, function(status) {
    callback(status, ajax.getAllResponseHeaders());
  });
  ajax.send();

  return this;
}

/**
 * Perform a WebDAV PUT request
 * 
 * @param   {String}                        path         The path to perform PUT on
 * @param   {Function(status,Multistatus)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   {String}                        body         The content to include in the PUT request.
 * @param   {String}                        contenttype  Optional; the content type of the body (i.e. value for the Content-Type header).
 * @returns  {nl.sara.webdav.Client}                                     The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.put = function(path, callback, body, contenttype) {
  if ((path === undefined) || (callback === undefined) || (body === undefined)) {
    throw new nl.sara.webdav.Exception('PUT requires the parameters path, callback and body', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if ((typeof path != "string") || (typeof body != 'string') || ((contenttype !== undefined) && (typeof contenttype != 'string'))) {
    throw new nl.sara.webdav.Exception('PUT parameter; path, body and contenttype should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // And then send the request
  var ajax = null;
  ajax = nl.sara.webdav.Client.getAjax("PUT", url, callback);
  if (contenttype !== undefined) {
    ajax.setRequestHeader('Content-Type', contenttype);
  }
  ajax.send(body);

  return this;
}

/**
 * Perform a WebDAV POST request
 * 
 * @param   {String}                        path         The path to perform POST on
 * @param   {Function(status,Multistatus)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   {String}                        body         Optional; a body to include in the POST request.
 * @param   {String}                        contenttype  Optional; the content type of the body (i.e. value for the Content-Type header). If omitted, but body is specified, then 'application/x-www-form-urlencoded' is assumed
 * @returns  {nl.sara.webdav.Client}                                     The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.post = function(path, callback, body, contenttype) {
  if ((path === undefined) || (callback === undefined)) {
    throw new nl.sara.webdav.Exception('POST requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if ((typeof path != "string") || ((body !== undefined) && (typeof body != 'string')) || ((contenttype !== undefined) && (typeof contenttype != 'string'))) {
    throw new nl.sara.webdav.Exception('POST parameter; path, body and contenttype should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // And then send the request
  var ajax = null;
  ajax = nl.sara.webdav.Client.getAjax("POST", url, callback);
  if (body !== undefined){
    if (contenttype !== undefined) {
      ajax.setRequestHeader('Content-Type', contenttype);
    }else{
      ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    ajax.send(body);
  }else{
    ajax.send();
  }

  return this;
}

/**
 * Perform a WebDAV COPY request
 * 
 * @param   {String}                        path           The path to perform COPY on
 * @param   {Function(status,Multistatus)}  callback       Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   {String}                        destination    The destination to copy to. Should be either a full URL or a path from the root on this server (i.e. it should start with a /)
 * @param   {Boolean}                       overwriteMode  Specify what to do when destination resource already exists. Should be either FAIL_ON_OVERWRITE or SILENT_OVERWRITE. The default is SILENT_OVERWRITE.
 * @param   {String}                        depth          Should be '0' or 'infinity'. This is used in case of a collection; 0 means only copy the collection itself, infinity means copy also everything contained in the collection
 * @returns  {nl.sara.webdav.Client}                                       The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.copy = function(path, callback, destination, overwriteMode, depth) {
  if ((path === undefined) || (callback === undefined) || (destination === undefined)) {
    throw new nl.sara.webdav.Exception('COPY requires the parameters path, callback and destination', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if ((typeof path != "string") || (typeof destination != "string")){
    throw new nl.sara.webdav.Exception('COPY parameter; path and destination should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // If the destination starts with a / it is a absolute url on the same host, so prepare a complete URL
  if (destination.substr(0,1) == '/') {
    destination = this.getUrl(destination);
  } // Else I assume it is a complete URL already

  // And then send the request
  var ajax = nl.sara.webdav.Client.getAjax("COPY", url, callback);
  ajax.setRequestHeader('Destination', destination);
  if (depth !== undefined) {
    if ((depth != 0) && (depth != 'infinity')) {
      throw new nl.sara.webdav.Exception("COPY parameter; depth should be '0' or 'infinity'", nl.sara.webdav.Exception.WRONG_VALUE);
    }
    ajax.setRequestHeader('Depth', depth);
  }
  if (overwriteMode == nl.sara.webdav.Client.FAIL_ON_OVERWRITE) {
    ajax.setRequestHeader('Overwrite', 'F');
  }
  ajax.send();

  return this;
}

/**
 * Perform a WebDAV MOVE request
 * 
 * @param   {String}                        path           The path to perform MOVE on
 * @param   {Function(status,Multistatus)}  callback       Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   {String}                        destination    The destination to move to. Should be either a full URL or a path from the root on this server (i.e. it should start with a /)
 * @param   {Number}                           overwriteMode  Specify what to do when destination resource already exists. Should be either FAIL_ON_OVERWRITE, TRUNCATE_ON_OVERWRITE or SILENT_OVERWRITE. The default is SILENT_OVERWRITE.
 * @returns  {nl.sara.webdav.Client}                                       The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.move = function(path, callback, destination, overwriteMode) {
  if ((path === undefined) || (callback === undefined) || (destination === undefined)) {
    throw new nl.sara.webdav.Exception('MOVE requires the parameters path, callback and destination', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if ((typeof path != "string") || (typeof destination != "string")){
    throw new nl.sara.webdav.Exception('MOVE parameter; path and destination should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // If the destination starts with a / it is a absolute url on the same host, so prepare a complete URL
  if (destination.substr(0,1) == '/') {
    destination = this.getUrl(destination);
  } // Else I assume it is a complete URL already

  // And then send the request
  var ajax = nl.sara.webdav.Client.getAjax("MOVE", url, callback);
  ajax.setRequestHeader('Destination', destination);
  if (overwriteMode == nl.sara.webdav.Client.FAIL_ON_OVERWRITE) {
    ajax.setRequestHeader('Overwrite', 'F');
  }else if (overwriteMode == nl.sara.webdav.Client.TRUNCATE_ON_OVERWRITE) {
    ajax.setRequestHeader('Overwrite', 'T');
  }
  ajax.send();

  return this;
}

/**
 * Perform a WebDAV LOCK request
 * 
 * @param   {String}                        path         The path to perform LOCK on
 * @param   {Function(status,Multistatus)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @returns  {nl.sara.webdav.Client}                                     The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.lock = function(path, callback) {
  throw new nl.sara.webdav.Exception('LOCK is not implemented yet', nl.sara.webdav.Exception.NOT_IMPLEMENTED);
  return this;
}

/**
 * Perform a WebDAV UNLOCK request
 * 
 * @param   {String}                        path         The path to perform UNLOCK on
 * @param   {Function(status,Multistatus)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @returns  {nl.sara.webdav.Client}                                     The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.unlock = function(path, callback) {
  throw new nl.sara.webdav.Exception('UNLOCK is not implemented yet', nl.sara.webdav.Exception.NOT_IMPLEMENTED);
  return this;
}

/**
 * Prepares a XMLHttpRequest object to be used for an AJAX request
 * 
 * @static
 * @param    {String}                        method    The HTTP/webDAV method to use (e.g. GET, POST, PROPFIND)
 * @param    {String}                        url       The url to connect to
 * @param    {Function(status,Multistatus)}  callback  Querying the server is done asynchronously, this callback function is called when the results are in
 * @returns   {XMLHttpRequest}                          A prepared XMLHttpRequest
 */
nl.sara.webdav.Client.getAjax = function(method, url, callback) {
  var /** @type XMLHttpRequest */ ajax = new XMLHttpRequest();
  ajax.open(method, url, true);
  ajax.onreadystatechange=function(){nl.sara.webdav.Client.ajaxHandler(ajax, callback);}
  return ajax;
}

/**
 * AJAX request handler. Parses Multistatus (if available) and call a user specified callback function
 * 
 * @static
 * @param    {XMLHttpRequest}                ajax      The XMLHttpRequest object which performed the request
 * @param    {Function(status,Multistatus)}  callback  Querying the server is done asynchronously, this callback function is called when the results are in
 */
nl.sara.webdav.Client.ajaxHandler = function(ajax, callback) {
  if (ajax.readyState==4){ //if request has completed
    var multistatus = null;
    if (ajax.status == 207) {
      // Parse the response to a Multistatus object
      multistatus = new nl.sara.webdav.Multistatus(ajax.responseXML.childNodes.item(0));
    }
    callback(ajax.status, multistatus);
  }
}

// End of library
