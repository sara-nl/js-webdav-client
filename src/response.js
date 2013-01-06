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
"use strict"

// If nl.sara.webdav.Response is already defined, we have a namespace clash!
if (nl.sara.webdav.Response !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Response already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class a WebDAV response
 *
 * @param  {Node}  [xmlNode]  Optional; the xmlNode describing the response object (should be compliant with RFC 4918)
 * @property  {String}  href                 The path of the resource
 * @property  {String}  status               The (HTTP) status code
 * @property  {String}  error                The error text
 * @property  {String}  responsedescription  The response description
 * @property  {String}  location             In case of a 3XX response, the value that would normally be in the 'Location' header
 */
nl.sara.webdav.Response = function(xmlNode) {
  // First define private attributes
  Object.defineProperty(this, '_namespaces', {
    'value': {},
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  // Second define public attributes
  Object.defineProperty(this, 'href', {
    'value': null,
    'enumerable': true,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, 'status', {
    'value': null,
    'enumerable': true,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, 'error', {
    'value': null,
    'enumerable': true,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, 'responsedescription', {
    'value': null,
    'enumerable': true,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, 'location', {
    'value': null,
    'enumerable': true,
    'configurable': false,
    'writable': true
  });

  // Constructor logic
  if (typeof xmlNode != 'undefined') {
    if ((xmlNode.namespaceURI != 'DAV:') || (nl.sara.webdav.Ie.getLocalName(xmlNode) != 'response')) {
      throw new nl.sara.webdav.Exception('Node is not of type DAV:response', nl.sara.webdav.Exception.WRONG_XML);
    }
    var data = xmlNode.childNodes;
    for (var i = 0; i < data.length; i++) {
      var child = data.item(i);
      if ((child.namespaceURI == null) || (child.namespaceURI != 'DAV:')) { // Skip if not from the right namespace
        continue;
      }
      switch (nl.sara.webdav.Ie.getLocalName(child)) {
        case 'href':
        case 'status':
        case 'error':
        case 'responsedescription':
          // always CDATA, so just take the text
          this[nl.sara.webdav.Ie.getLocalName(child)] = child.childNodes.item(0).nodeValue;
          break;
        case 'location':
          this[nl.sara.webdav.Ie.getLocalName(child)] = child.childNodes.item(0).childNodes.item(0).nodeValue;
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
            if ((propstatChild.nodeType != 1) || (propstatChild.namespaceURI != 'DAV:')) {
              continue;
            }
            switch (nl.sara.webdav.Ie.getLocalName(propstatChild)) {
              case 'prop':
                for (var k = 0; k < propstatChild.childNodes.length; k++) {
                  props.push(propstatChild.childNodes.item(k));
                }
                break;
              case 'error':
                for (k = 0; k < propstatChild.childNodes.length; k++) {
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
          for (j = 0; j < props.length; j++) {
            if (props[j].nodeType == 1) {
              var property = new nl.sara.webdav.Property(props[j], status, responsedescription, errors);
              this.addProperty(property);
            }
          }
        break;
      }
    }
  }
}

//########################## DEFINE PUBLIC METHODS #############################
/**
 * Adds a WebDAV property
 *
 * @param    {nl.sara.webdav.Property}  property  The property
 * @returns  {nl.sara.webdav.Response}            The response itself for chaining methods
 */
nl.sara.webdav.Response.prototype.addProperty = function(property) {
  if (!nl.sara.webdav.Ie.isIE && !(property instanceof nl.sara.webdav.Property)) {
    throw new nl.sara.webdav.Exception('Response property should be instance of Property', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  var namespace = property.namespace;
  if (typeof namespace != 'string') {
    namespace = '';
  }
  if (this._namespaces[namespace] === undefined) {
    this._namespaces[namespace] = {};
  }

  this._namespaces[namespace][property.tagname] = property;
  return this;
}

/**
 * Gets a WebDAV property
 *
 * @param    {String}                   namespace  The namespace of the WebDAV property
 * @param    {String}                   prop       The WebDAV property to get
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
 * @param    {String}    namespace  The namespace of the WebDAV property
 * @returns  {String[]}             The names of the different properties of a namespace
 */
nl.sara.webdav.Response.prototype.getPropertyNames = function(namespace) {
  if (this._namespaces[namespace] === undefined) {
    return new Array();
  }
  return Object.keys(this._namespaces[namespace]);
}

// End of library
