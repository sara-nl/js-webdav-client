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
 * @param  {Node}  [xmlNode]  Optional; the xmlNode describing the privilege object
 * @property  {String}    namespace  The namespace
 * @property  {String}    tagname    The tag name
 * @property  {NodeList}  xmlvalue   A NodeList with the value of this privilege
 * @property  {String}    value      A textual representation of xmlvalue
 */
nl.sara.webdav.Privilege = function(xmlNode) {
  // First define private attributes
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
  // Second define public attributes
  Object.defineProperty(this, 'namespace', {
    'value': null,
    'enumerable': true,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, 'tagname', {
    'value': null,
    'enumerable': true,
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
(function() {
  // This creates a (private) static variable. It will contain all codecs
  var codecNamespaces = {};

  Object.defineProperty(nl.sara.webdav.Privilege.prototype, 'value', {
    'set': function(value) {
      this._value = value;

      // Call codec to automatically create correct 'xmlvalue'
      var xmlDoc = document.implementation.createDocument("DAV:", "privilege", null);
      if ((codecNamespaces[this.namespace] === undefined) ||
          (codecNamespaces[this.namespace][this.tagname] === undefined) ||
          (codecNamespaces[this.namespace][this.tagname]['toXML'] === undefined)) {
        // No 'toXML' function set, so create a NodeList with just one CDATA node
        if (value !== null) { // If the value is NULL, then we should add anything to the NodeList
          var cdata = xmlDoc.createCDATASection(value);
          xmlDoc.documentElement.appendChild(cdata);
        }
        this._xmlvalue = xmlDoc.documentElement.childNodes;
      }else{
        this._xmlvalue = codecNamespaces[this.namespace][this.tagname]['toXML'](value, xmlDoc);
      }
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

      this._xmlvalue = value;

      // Call codec to automatically create correct 'value'
      if (value.length > 0) {
        if ((codecNamespaces[this.namespace] === undefined) ||
            (codecNamespaces[this.namespace][this.tagname] === undefined) ||
            (codecNamespaces[this.namespace][this.tagname]['fromXML'] === undefined)) {
          // No 'fromXML' function set, so try to create a text value based on TextNodes and CDATA nodes. If other nodes are present, set 'value' to null
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
          this._value = codecNamespaces[this.namespace][this.tagname]['fromXML'](value);
        }
      }else{
        this._value = null;
      }
    },
    'get': function() {
      return this._xmlvalue;
    }
  });

//########################## DEFINE PUBLIC METHODS #############################
  /**
   * Adds functions to encode or decode properties
   *
   * This allows exact control in how Privilege.xmlvalue and Privilege.value are
   * converted into each other. You can specify two functions: 'fromXML' and
   * 'toXML'. These should be complementary. That is, toXML should be able to
   * create a NodeList based on the output of fromXML. For example:
   * A == toXML(fromXML(A)) &&
   * B == fromXML(toXML(B))
   *
   * @param    {nl.sara.webdav.Codec}  codec  The codec to add
   * @returns  {void}
   */
  nl.sara.webdav.Privilege.addCodec = function(codec) {
    if (typeof codec.namespace != 'string') {
      throw new nl.sara.webdav.Exception('addCodec: codec.namespace must be a String', nl.sara.webdav.Exception.WRONG_TYPE);
    }
    if (typeof codec.tagname != 'string') {
      throw new nl.sara.webdav.Exception('addCodec: codec.tagname must be a String', nl.sara.webdav.Exception.WRONG_TYPE);
    }
    if (codecNamespaces[codec.namespace] === undefined) {
      codecNamespaces[codec.namespace] = {};
    }
    codecNamespaces[codec.namespace][codec.tagname] = {
      'fromXML': (codec.fromXML ? codec.fromXML : undefined),
      'toXML': (codec.toXML ? codec.toXML : undefined)
    }
  };
})(); // Ends the static scope

/**
 * Overloads the default toString() method so it returns the value of this privilege
 *
 * @returns  {String}  A string representation of this privilege
 */
nl.sara.webdav.Privilege.prototype.toString = function() {
  return this.value;
}

// End of library
