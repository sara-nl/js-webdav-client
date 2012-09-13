// If nl.sara.webdav.Client is already defined, we have a namespace clash!
if (nl.sara.webdav.Client !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Client already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * This class represents a connection to a webDAV server
 * @param  string   host         The hostname or IP address of the server
 * @param  boolean  useHTTPS     If set to true, HTTPS is used. If set to false or omitted, HTTP is used
 * @param  int      port         Set a custom port to connect to. If not set, the default port will be used (80 for HTTP and 443 for HTTPS)
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

/**
 * Class constants
 */
nl.sara.webdav.Client.PROPNAME = 1;
nl.sara.webdav.Client.ALLPROP = 2;
nl.sara.webdav.Client.INFINITY = 'infinity';

function() { //This creates a scope where I can put private functions (NOT private properties, as these will be static!)
  /**
   * Converts a path to the full url (i.e. appends the protocol and host part)
   * @public
   * @param   string  path  The path on the server
   * @return  string        The full url to the path
   */
  nl.sara.webdav.Client.prototype.getUrl = function(path) {
    if (path.substring(0,1) != '/') {
      path = '/' + path;
    }
    return this._baseUrl + path;
  }
  
  /**
   * Perform a WebDAV PROPFIND request
   * @public
   * @param   string                        path      The path get a propfind for
   * @param   function(status,Multistatus)  callback  Querying the server is done asynchronously, this callback function is called when the results are in
   * @param   string                        depth     Value for the 'depth' header, should be either '0', '1' or the class constant INFINITY. When omitted, '0' is used. See RFC 4916.
   * @param   mixed                         props     The properties to fetch. Should be either one of the class constants PROPNAME or ALLPROP or an array with Property objects. When omitted, ALLPROP is assumed. See RFC 4916.
   * @param   array<Property>               include   An array with Property objects used for the <include> element. This is only used for ALLPROP requests. When omitted, no <include> element is send. See RFC 4916.
   * @return  Client                                  The client itself for chaining methods
   */
  nl.sara.webdav.Client.prototype.propfind = function(path, callback, depth, props, include) {
    if ((path === undefined) || (callback === undefined)) {
      throw new nl.sara.webdav.Exception('Propfind requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
    }
    if (!(typeof path == "string")) {
      throw new nl.sara.webdav.Exception('Propfind parameter; path should be a string', nl.sara.webdav.Exception.WRONG_TYPE);
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
        depthHeader = depth
        break;
      case nl.sara.webdav.Client.INFINITY:
        depthHeader = 'infinity';
        break;
      default:
        throw new nl.sara.webdav.Exception("Depth header should be '0', '1' or nl.sara.webdav.Client.INFINITY", nl.sara.webdav.Exception.WRONG_VALUE);
      break;
    }
    
    // Create the request XML
    // TODO: This should be parsed by using browser objects. That should make sure no syntax errors are made and namespaces are defined more neatly.
    if (props === undefined) {
      props = nl.sara.webdav.Client.ALLPROP;
    }
    var propsBody = '';
    switch (props) { // Find out what the request is for
      case nl.sara.webdav.Client.PROPNAME: // User wants all property names
        propsBody = '<D:propname/>';
        break;
      case nl.sara.webdav.Client.ALLPROP: // User wants all properties
        propsBody = '<D:allprop/>';
        if (include !== undefined) { // There is content for the <DAV: include> tags, so parse it
          if (!(include instanceof Array)) {
            throw new nl.sara.webdav.Exception('Propfind parameter; include should be an array', nl.sara.webdav.Exception.WRONG_TYPE);
          }
          var includeBody = '';
          for (var i = 0; i < include.length; i++) {
            var item = include[i];
            if (!(item instanceof nl.sara.webdav.Property)) {
              continue;
            }
            includeBody = includeBody + '<' + ((item.get('namespace') == 'DAV:') ? 'D:' + item.get('tagname') : item.get('tagname') + ' xmlns="' + item.get('namespace')) + '"/>';
          }
          if (includeBody.length > 0) { // But only really add the <include> tag if there is valid content
            propsBody = '<D:include>' + includeBody + '</D:include>';
          }
        }
        break;
      default: // The default is to expect an array with Property objects; the user wants the values of these properties
        if (!(props instanceof Array)) {
          throw new nl.sara.webdav.Exception('Props parameter should be nl.sara.webdav.Client.PROPNAME, nl.sara.webdav.Client.ALLPROP or an array with Property objects', nl.sara.webdav.Exception.WRONG_VALUE);
        }
        var propertyBody = '';
        for (var i = 0; i < props.length; i++) { // Cycle through the array
          var prop = props[i];
          if (!(prop instanceof nl.sara.webdav.Property)) {
            continue;
          }
          propertyBody = propertyBody + '<' + ((prop.get('namespace') == 'DAV:') ? 'D:' + prop.get('tagname') : prop.get('tagname') + ' xmlns="' + prop.get('namespace')) + '"/>';
        }
        if (propertyBody.length == 0) { // But if no properties are found, then the array didn't have Property objects in it
          throw new nl.sara.webdav.Exception("Propfind parameter; if props is an array, it should be an array of Properties", nl.sara.webdav.Exception.WRONG_TYPE);
        }
        propsBody = '<D:prop>' + propertyBody + '</D:prop>';
      break;
    }
    var body = '<?xml version="1.0" encoding="utf-8" ?><D:propfind xmlns:D="DAV:">' + propsBody + '</D:propfind>';
    
    // And then send the request
    var ajax = getAjax("PROPFIND", url, callback);
    ajax.setRequestHeader('Depth', depthHeader);
    ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
    ajax.send(body);
  
    return this;
  }
  
  /**
   * Perform a WebDAV PROPPATCH request
   * @public
   * @param   string                        path      The path do a PROPPATCH on
   * @param   function(status,Multistatus)  callback  Querying the server is done asynchronously, this callback function is called when the results are in
   * @param   array<Property>               setProps  The properties to set. If not set, delProps should be set.
   * @param   array<Property>               delProps  The properties to delete. If not set, setProps should be set.
   * @return  Client                                  The client itself for chaining methods
   */
  nl.sara.webdav.Client.prototype.proppatch = function(path, callback, setProps, delProps) {
    if ((path === undefined) || (callback === undefined) || ((setProps === undefined) && (delProps === undefined))) {
      throw new nl.sara.webdav.Exception('Proppatch requires the parameters path, callback and at least one of setProps or delProps', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
    }
    if (!(typeof path == "string") || ((setProps !== undefined) && !(setProps instanceof Array)) || ((delProps !== undefined) && !(delProps instanceof Array))) {
      throw new nl.sara.webdav.Exception('Proppatch parameter; path should be a string, setProps and delProps should be arrays', nl.sara.webdav.Exception.WRONG_TYPE);
    }
    
    // Get the full URL, based on the specified path
    var url = this.getUrl(path);
    
    // Create the request XML
    // TODO: This should be parsed by using browser objects. That should make sure no syntax errors are made and namespaces are defined more neatly.
    var propsBody = '';
    if (setProps !== undefined) {
      var setPropsBody = '';
      for (var i = 0; i < setProps.length; i++) { // Cycle through the array
        var prop = setProps[i];
        if (!(prop instanceof nl.sara.webdav.Property)) {
          continue;
        }
        if (prop.get('xmlvalue') !== null) {
          var serializer = new XMLSerializer();
          setPropsBody = setPropsBody + serializer.serializeToString(prop.get('xmlvalue'));
        }else{
          var tagName = (prop.get('namespace') == 'DAV:') ? 'D:' + prop.get('tagname') : prop.get('tagname') + ' xmlns="' + prop.get('namespace');
          setPropsBody = setPropsBody + '<' + tagName + '">' + prop.get('value') + '</' + tagName + '>';
        }
      }
      if (setPropsBody.length == 0) { // But if no properties are found, then the array didn't have Property objects in it
        throw new nl.sara.webdav.Exception("Proppatch parameter; setProps should be an array of Properties", nl.sara.webdav.Exception.WRONG_TYPE);
      }
      propsBody = propsBody + '<D:set><D:prop>' + setPropsBody + '</D:prop></D:set>';
    }
    if (delProps !== undefined) {
      var delPropsBody = '';
      for (var i = 0; i < delProps.length; i++) { // Cycle through the array
        var prop = delProps[i];
        if (!(prop instanceof nl.sara.webdav.Property)) {
          continue;
        }
        delPropsBody = delPropsBody + '<' + ((prop.get('namespace') == 'DAV:') ? 'D:' + prop.get('tagname') : prop.get('tagname') + ' xmlns="' + prop.get('namespace')) + '"/>';
      }
      if (delPropsBody.length == 0) { // But if no properties are found, then the array didn't have Property objects in it
        throw new nl.sara.webdav.Exception("Proppatch parameter; delProps should be an array of Properties", nl.sara.webdav.Exception.WRONG_TYPE);
      }
      propsBody = propsBody + '<D:remove><D:prop>' + delPropsBody + '</D:prop></D:remove>';
    }
    var body = '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:">' + propsBody + '</D:propertyupdate>';
  
    // And then send the request
    var ajax = getAjax("PROPPATCH", url, callback);
    ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
    ajax.send(body);
  
    return this;
  }
  
  /**
   * Perform a WebDAV MKCOL request
   * @public
   * @param   string            path         The path to perform MKCOL on
   * @param   function(status)  callback     Querying the server is done asynchronously, this callback function is called when the results are in
   * @param   string            body         Optional; a body to include in the MKCOL request.
   * @param   string            contenttype  Optional; the content type of the body (i.e. value for the Content-Type header). If omitted, but body is specified, then 'application/xml; charset="utf-8"' is assumed
   * @return  Client                         The client itself for chaining methods
   */
  nl.sara.webdav.Client.prototype.mkcol = function(path, callback, body, contenttype) {
    if ((path === undefined) || (callback === undefined)) {
      throw new nl.sara.webdav.Exception('Mkcol requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
    }
    if ((typeof path != "string") || ((body !== undefined) && (typeof body != 'string')) || ((contenttype !== undefined) && (typeof contenttype != 'string'))) {
      throw new nl.sara.webdav.Exception('Mkcol parameter; path and body should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
    }
    
    // Get the full URL, based on the specified path
    var url = this.getUrl(path);
  
    // And then send the request
    var ajax = getAjax("MKCOL", url, callback);
    if (contenttype !== undefined) {
      ajax.setRequestHeader('Content-Type', contenttype);
    }else if (body !== undefined) {
      ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
    }
    if (body !== undefined) {
      ajax.send(body);
    }else{
      ajax.send();
    }
  
    return this;
  }
  
  /**
   * Perform a WebDAV DELETE request
   * @public
   * @param   string                        path         The path to perform DELETE on
   * @param   function(status,Multistatus)  callback     Querying the server is done asynchronously, this callback function is called when the results are in
   * @return  Client                                     The client itself for chaining methods
   */
  nl.sara.webdav.Client.prototype.delete = function(path, callback) {
    if ((path === undefined) || (callback === undefined)) {
      throw new nl.sara.webdav.Exception('Delete requires the parameters path and callback', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
    }
    if (typeof path != "string"){
      throw new nl.sara.webdav.Exception('Delete parameter; path should be strings', nl.sara.webdav.Exception.WRONG_TYPE);
    }
    
    // Get the full URL, based on the specified path
    var url = this.getUrl(path);
  
    // And then send the request
    var ajax = getAjax("DELETE", url, callback);
    ajax.send();
  
    return this;
  }

  /**
   * Prepares a XMLHttpRequest object to be used for an AJAX request
   * @private
   * @param    string                        method    The HTTP/webDAV method to use (e.g. GET, POST, PROPFIND)
   * @param    string                        url       The url to connect to
   * @param    function(status,Multistatus)  callback  Querying the server is done asynchronously, this callback function is called when the results are in
   * @return   XMLHttpRequest                          A prepared XMLHttpRequest
   */
  function getAjax(method, url, callback) {
    var ajax = new XMLHttpRequest();
    ajax.open(method, url, true);
    ajax.onreadystatechange=function(){ajaxHandler(ajax, callback);}
    return ajax;
  }

  /**
   * AJAX request handler. Parses Multistatus (if available) and call a user specified callback function
   * @private
   * @param    XMLHttpRequest                ajax      The XMLHttpRequest object which performed the request
   * @param    function(status,Multistatus)  callback  Querying the server is done asynchronously, this callback function is called when the results are in
   */
  function ajaxHandler(ajax, callback) {
    if (ajax.readyState==4){ //if request has completed
      var multistatus = null;
      if (ajax.status == 207) {
        // Parse the response to a Multistatus object
        multistatus = new nl.sara.webdav.Multistatus(ajax.responseXML.childNodes.item(0));
      }
      callback(ajax.status, multistatus);
    }
  }
}();

// End of library
