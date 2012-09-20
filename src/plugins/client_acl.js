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

/**
 * This plugin adds acl capabilities to the WebDAV client class
 */
/**
 * Perform a WebDAV ACL request
 * 
 * @param   string                        path         The path to perform ACL on
 * @param   function(status,Multistatus)  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   Acl                           acl          The ACL to submit
 * @return  Client                                     The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.acl = function(path, callback, acl) {
  if ((path === undefined) || (callback === undefined)) {
    throw new nl.sara.webdav.Exception('ACL requires the parameters path, callback and acl', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if (!(typeof path == "string") || !(acl instanceof nl.sara.webdav.Acl)) {
    throw new nl.sara.webdav.Exception('ACL parameter; path should be a string, acl should be an instance of Acl', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);
  
  var aclBody = document.implementation.createDocument("DAV:", "acl", null);
  var aclLength = acl.getLength();
  for (var i = 0; i < aclLength; i++) { // Loop over the ACE's in this ACL
    var ace = acl.getAce(i);
    var aceBody = aclBody.createElementNS('DAV:', 'ace');
    
    // First create a principal node
    var principal = aclBody.createElementNS('DAV:', 'principal');
    var princVal = ace.get('principal');
    switch (princVal) {
      case nl.sara.webdav.Ace.ALL:
        principal.appendChild(aclBody.createElementNS('DAV:', 'all'));
        break;
      case nl.sara.webdav.Ace.AUTHENTICATED:
        principal.appendChild(aclBody.createElementNS('DAV:', 'authenticated'));
        break;
      case nl.sara.webdav.Ace.UNAUTHENTICATED:
        principal.appendChild(aclBody.createElementNS('DAV:', 'unauthenticated'));
        break;
      case nl.sara.webdav.Ace.SELF:
        principal.appendChild(aclBody.createElementNS('DAV:', 'self'));
        break;
      default: // If it isn't one of the constants, it should be either a Property object or a string/URL
        if (!(princVal instanceof nl.sara.webdav.Property)) { // It is a string; the URL of the principal
          var href = aclBody.createElementNS('DAV:', 'href');
          href.appendChild(aclBody.createCDATASection(princVal));
          principal.appendChild(href);
        }else{ // And else it is a property
          var property = aclBody.createElementNS('DAV:', 'property');
          if (princVal.get('xmlvalue') != null) {
            property.appendChild(princVal.get('xmlvalue'));
          }else{
            property.appendChild(aclBody.createElementNS(princVal.get('namespace'), princVal.get('tagname')));
          }
          principal.appendChild(property);
        }
      break;
    }
    
    // If the principal should be inverted, put it in an 'invert' element
    if (ace.get('invertprincipal')) {
      var invert = aclBody.createElementNS('DAV:', 'invert');
      invert.appendChild(principal);
      aceBody.appendChild(invert);
    }else{
      aceBody.appendChild(principal);
    }
    
    // Then prepare the privileges
    // grant or deny?
    var privilegeParent = null;
    if (ace.get('grantdeny') == nl.sara.webdav.Ace.DENY) {
      privilegeParent = aceBody.createElementNS('DAV:', 'deny');
    }else if (ace.get('grantdeny') == nl.sara.webdav.Ace.GRANT) {
      privilegeParent = aceBody.createElementNS('DAV:', 'grant');
    }else{
      throw new nl.sara.webdav.Exception('\'grantdeny\' property not set on one of the ACE\'s in this ACL', nl.sara.webdav.Exception.WRONG_VALUE);
    }
    var namespaces = ace.getNamespaceNames();
    for (var j = 0; j < namespaces.length; j++) { // loop through namespaces
      var namespace = namespaces[j];
      var privileges = ace.getPrivilegeNames(namespace);
      for (var k = 0; k < privileges.length; k++) { // loop through each privilege in this namespace
        var privilege = privileges[k];
        var privilegeElement = aclBody.createElementNS('DAV:', 'privilege');
        if (privilege.get('xmlvalue') != null) {
          privilegeElement.appendChild(privilege.get('xmlvalue'));
        }else{
          privilegeElement.appendChild(aclBody.createElementNS(privilege.get('namespace'), privilege.get('tagname')));
        }
        privilegeParent.appendChild(privilegeElement);
      }
    }
    aceBody.appendChild(privilegeParent);
    
    aclBody.documentElement.appendChild(aceBody);
  }  
    
  // Create the request body string
  var serializer = new XMLSerializer();
  var body = '<?xml version="1.0" encoding="utf-8" ?>' + serializer.serializeToString(aclBody);
  
  // And then send the request
  var ajax = nl.sara.webdav.Client.getAjax("ACL", url, callback);
  ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
  ajax.send(body);

  return this;
}

/**
 * Perform a WebDAV REPORT request
 * 
 * @param   string                        path         The path to perform REPORT on
 * @param   function(status,Multistatus)  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @param   Document                      body         The (XML DOM) document to parse and send as the request body
 * @return  Client                                     The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.report = function(path, callback, body) {
  if ((path === undefined) || (callback === undefined) || (body === undefined)) {
    throw new nl.sara.webdav.Exception('POST requires the parameters path, callback and body', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if ((typeof path != "string") || (typeof body != 'string') || !(body instanceof Document)) {
    throw new nl.sara.webdav.Exception('POST parameter; path should be a string, body should be an instance of Document', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  // Get the full URL, based on the specified path
  var url = this.getUrl(path);
  
  // Parse the body
  var serializer = new XMLSerializer();
  var body = '<?xml version="1.0" encoding="utf-8" ?>' + serializer.serializeToString(body);

  // And then send the request
  var ajax = null;
  ajax = nl.sara.webdav.Client.getAjax("REPORT", url, callback);
  ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
  ajax.send(body);

  return this;
}

// End of library
