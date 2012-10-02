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

// If nl.sara.webdav.Privilege is already defined, we have a namespace clash!
if (nl.sara.webdav.Privilege !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Privilege already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class WebDAV ACL privilege
 *
 * @param  {Node}  xmlNode  Optionally; the xmlNode describing the privilege object
 * @property  {String}    namespace  The namespace
 * @property  {String}    tagname    The tag name
 * @property  {NodeList}  xmlvalue   A NodeList with the value of this privilege
 * @property  {String}    value      A textual representation of xmlvalue
 */
nl.sara.webdav.Privilege = function(xmlNode) {
  // First define private attributes
  Object.defineProperty(this, '_namespace', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_tagname', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_value', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_xmlvalue', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });

  // Constructor logic
  if (xmlNode instanceof Node) {
    this.namespace = xmlNode.namespaceURI;
    this.tagname = xmlNode.localName;
    this.xmlvalue = xmlNode.childNodes;
  }
}

//######################### DEFINE PUBLIC ATTRIBUTES ###########################
Object.defineProperty(nl.sara.webdav.Privilege.prototype, 'namespace', {
  'set': function(value) {
    this._namespace = value;
  },
  'get': function() {
    return this._namespace;
  }
});

Object.defineProperty(nl.sara.webdav.Privilege.prototype, 'tagname', {
  'set': function(value) {
    this._tagname = value;
  },
  'get': function() {
    return this._tagname;
  }
});

Object.defineProperty(nl.sara.webdav.Privilege.prototype, 'value', {
  'set': function(value) {
    this._xmlvalue = null;
    this._value = value;
  },
  'get': function() {
    return this._value;
  }
});

Object.defineProperty(nl.sara.webdav.Privilege.prototype, 'xmlvalue', {
  'set': function(value) {
    if (value === null) {
      this._value = null;
      this._xmlvalue = null;
      return;
    }
    if (!(value instanceof NodeList)) {
      throw new nl.sara.webdav.Exception('xmlvalue must be an instance of NodeList', nl.sara.webdav.Exception.WRONG_TYPE);
    }

    // TODO: handle convertion of value with codecs
    if (value.length > 0) {
      this._value = '';
      for (var i = 0; i < value.length; i++) {
        var node = value.item(i);
        if ((node.nodeType == 3) || (node.nodeType == 4)) { // Make sure text and CDATA content is stored
          this._value += node.nodeValue;
        }else{ // If even one of the nodes is not text or CDATA, then we don't parse a text value at all
          this._value = null;
          break;
        }
      }
    }else{
      this._value = null;
    }
    this._xmlvalue = value;
  },
  'get': function() {
    return this._xmlvalue;
  }
});

//########################## DEFINE PUBLIC METHODS #############################
/**
 * Overloads the default toString() method so it returns the value of this privilege
 *
 * @returns  {String}  A string representation of this privilege
 */
nl.sara.webdav.Privilege.prototype.toString = function() {
  return this.value;
}

// End of library
