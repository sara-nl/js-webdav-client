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

// If nl.sara.webdav.Multistatus is already defined, we have a namespace clash!
if (nl.sara.webdav.Multistatus !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Multistatus already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class WebDAV Multistatus response body
 * 
 * @param   {Node}  xmlNode  Optionally; the xmlNode describing the multistatus object (should be compliant with RFC 4918)
 */
nl.sara.webdav.Multistatus = function(xmlNode) {
  this._defaultprops = {
    'responsedescription' : null
  }
  this._responses = {};
  
  // Constructor logic
  if (xmlNode instanceof Node) { 
    if ((xmlNode.namespaceURI.toLowerCase() != 'dav:') || (xmlNode.localName.toLowerCase() != 'multistatus')) {
      throw new nl.sara.webdav.Exception('Node is not of type DAV:multistatus', nl.sara.webdav.Exception.WRONG_XML);
    }
    var data = xmlNode.childNodes;
    for (var i = 0; i < data.length; i++) {
      var child = data.item(i);
      if ((child.namespaceURI == null) || (child.namespaceURI.toLowerCase() != 'dav:')) { // Skip if not from the right namespace
        continue;
      }
      switch (child.localName) {
        case 'responsedescription': // responsedescription is always CDATA, so just take the text
          this.set('responsedescription', child.childNodes.item(0).nodeValue);
          break;
        case 'response': // response node should be parsed further
          var response = new nl.sara.webdav.Response(child);
          var responseChilds = child.childNodes;
          var hrefs = [];
          for (var j = 0; j < responseChilds.length; j++) {
            var responseChild = responseChilds.item(j);
            if ((responseChild.localName == 'href') && (responseChild.namespaceURI != null) && (responseChild.namespaceURI.toLowerCase() == 'dav:')) { // For each HREF element we create a separate response object
              hrefs.push(responseChild.childNodes.item(0).nodeValue);
            }
          }
          if (hrefs.length > 1) { // Multiple HREFs = start copying the response (this makes sure it is not parsed over and over again). No deep copying needed; there can't be a propstat
            for (var k = 0; k < hrefs.length; k++) {
              var copyResponse = new nl.sara.webdav.Response();
              copyResponse.set('href', hrefs[k]);
              copyResponse.set('status', response.get('status'));
              copyResponse.set('error', response.get('error'));
              copyResponse.set('responsedescription', response.get('responsedescription'));
              copyResponse.set('location', response.get('location'));
              this.addResponse(copyResponse);
            }
          }else{
            this.addResponse(response);
          }
        break;
      }
    }
  }
}

/**
 * Adds a Response
 * 
 * @param   {nl.sara.webdav.Response}     response  The response
 * @returns  {nl.sara.webdav.Multistatus}            The multistatus itself for chaining methods
 */
nl.sara.webdav.Multistatus.prototype.addResponse = function(response) {
  if (!(response instanceof nl.sara.webdav.Response)) {
    throw new nl.sara.webdav.Exception('Response should be instance of Response', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  var name = response.get('href');
  while (name.substring(name.length-1) == '/') {
    name = name.substr(0, name.length-1);
  }
  name = name.substr(name.lastIndexOf('/')+1);
  this._responses[name] = response;
  return this;
}

/**
 * Gets a Response
 * 
 * @param   {String}    name  The name of the response to get
 * @returns  {nl.sara.webdav.Response}        The value of the WebDAV property or undefined if the WebDAV property doesn't exist
 */
nl.sara.webdav.Multistatus.prototype.getResponse = function(name) {
  return this._responses[name];
}

/**
 * Gets the response names
 * 
 * @returns  {String[]}  The names of the different responses
 */
nl.sara.webdav.Multistatus.prototype.getResponseNames = function() {
  return Object.keys(this._responses);
}

/**
 * Sets a property
 * 
 * @param   {String}       prop   The property to update
 * @param                  value  The value
 * @returns  {nl.sara.webdav.Multistatus}         The multistatus object itself for chaining methods
 */
nl.sara.webdav.Multistatus.prototype.set = function(prop, value) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  this._defaultprops[prop] = value;
  return this;
}

/**
 * Gets a property
 * 
 * @param   {String}  prop  The property to get
 * @returns                  The value of the property or undefined if the property doesn't exist
 */
nl.sara.webdav.Multistatus.prototype.get = function(prop) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  return this._defaultprops[prop];
}

// End of library
