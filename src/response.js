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

// If nl.sara.webdav.Response is already defined, we have a namespace clash!
if (nl.sara.webdav.Response !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Response already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class a WebDAV response
 * 
 * @param   {Node}  xmlNode  Optionally; the xmlNode describing the response object (should be compliant with RFC 4918)
 */
nl.sara.webdav.Response = function(xmlNode) {
  this._namespaces = {};
  this._defaultprops = {
    'href'                : null,
    'status'              : null,
    'error'               : null,
    'responsedescription' : null,
    'location'            : null
  }
  
  // Constructor logic
  if (xmlNode instanceof Node) { 
    if ((xmlNode.namespaceURI.toLowerCase() != 'dav:') || (xmlNode.localName.toLowerCase() != 'response')) {
      throw new nl.sara.webdav.Exception('Node is not of type DAV:response', nl.sara.webdav.Exception.WRONG_XML);
    }
    var data = xmlNode.childNodes;
    for (var i = 0; i < data.length; i++) {
      var child = data.item(i);
      if ((child.namespaceURI == null) || (child.namespaceURI.toLowerCase() != 'dav:')) { // Skip if not from the right namespace
        continue;
      }
      switch (child.localName) {
        case 'href':
        case 'status':
        case 'error':
        case 'responsedescription':
          // always CDATA, so just take the text
          this.set(child.localName, child.childNodes.item(0).nodeValue);
          break;
        case 'location':
          this.set(child.localName, child.childNodes.item(0).childNodes.item(0).nodeValue);
          break;
        case 'propstat': // propstat node should be parsed further
          var propstatChilds = child.childNodes;
          // First find status, error, responsedescription and props (as Node objects, not yet as Property objects)
          var status = null;
          var errors = [];
          var responsedescription = null;
          var props = [];
          for (var j = 0; j < propstatChilds.length; j++) { // Parse the child nodes of the propstat element
            var propstatChild = propstatChilds.item(j);
            if ((propstatChild.nodeValue != 1) || (propstatChild.namespaceURI != 'DAV:')) {
              continue;
            }
            switch (propstatChild.localName) {
              case 'prop':
                for (var k = 0; k < propstatChild.childNodes.length; k++) {
                  props.push(propstatChild.childNodes.item(k));
                }
                break;
              case 'error':
                for (var k = 0; k < propstatChild.childNodes.length; k++) {
                  errors.push(propstatChild.childNodes.item(k));
                }
                break;
                break;
              case 'status': // always CDATA, so just take the text
                status = child.childNodes.item(0).nodeValue;
                break;
              case 'responsedescription': // always CDATA, so just take the text
                responsedescription = child.childNodes.item(0).nodeValue;
              break;
            }
          }
          
          // Then create and add a new property for each element found in DAV:prop
          for (var j = 0; j < props.length; j++) {
            var property = new nl.sara.webdav.Property();
            property.set('xmlvalue', props[j]);
            property.set('status', status);
            property.set('responsedescription', responsedescription);
            for (var k = 0; k < errors.length; k++) {
              property.addError(errors[k]);
            }
            this.addProperty(property);
          }
        break;
      }
    }
  }
}

/**
 * Adds a WebDAV property
 * 
 * @param   {nl.sara.webdav.Property}  property  The property
 * @returns  {nl.sara.webdav.Response}            The response itself for chaining methods
 */
nl.sara.webdav.Response.prototype.addProperty = function(property) {
  if (!(property instanceof nl.sara.webdav.Property)) {
    throw new nl.sara.webdav.Exception('Response property should be instance of Property', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  var namespace = property.get('namespace');
  if (namespace) {
    if (this._namespaces[namespace] === undefined) {
      this._namespaces[namespace] = {};
    }
  }else{
    throw new nl.sara.webdav.Exception('Response property should have a namespace', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  this._namespaces[namespace][property.get('tagname')] = property;
  return this;
}

/**
 * Gets a WebDAV property
 * 
 * @param   {String}    namespace  The namespace of the WebDAV property
 * @param   {String}    prop       The WebDAV property to get
 * @returns  {nl.sara.webdav.Property}             The value of the WebDAV property or undefined if the WebDAV property doesn't exist
 */
nl.sara.webdav.Response.prototype.getProperty = function(namespace, prop) {
  if ((this._namespaces[namespace] === undefined) || (this._namespaces[namespace][prop] === undefined)) {
    return undefined;
  }
  return this._namespaces[namespace][prop];
}

/**
 * Gets the namespace names
 * 
 * @returns  {String[]}  The names of the different namespaces
 */
nl.sara.webdav.Response.prototype.getNamespaceNames = function() {
  return Object.keys(this._namespaces);
}

/**
 * Gets the property names of a namespace
 * 
 * @param   {String}    namespace  The namespace of the WebDAV property
 * @returns  {String[]}             The names of the different properties of a namespace
 */
nl.sara.webdav.Response.prototype.getPropertyNames = function(namespace) {
  if (this._namespaces[namespace] === undefined) {
    return new Array();
  }
  return Object.keys(this._namespaces[namespace]);
}

/**
 * Sets a property
 * 
 * @param   {String}    prop   The property to update
 * @param               value  The value
 * @returns  {nl.sara.webdav.Response}         The response itself for chaining methods
 */
nl.sara.webdav.Response.prototype.set = function(prop, value) {
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
 * @returns                  The value of the property
 */
nl.sara.webdav.Response.prototype.get = function(prop) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  return this._defaultprops[prop];
}

// End of library
