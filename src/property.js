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
"use strict";

// If nl.sara.webdav.Property is already defined, we have a namespace clash!
if (nl.sara.webdav.Property !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace name nl.sara.webdav.Property already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class a WebDAV property
 *
 * @param  {Node}      [xmlNode]              Optional; The xmlNode describing the propstat object (should be compliant with RFC 4918)
 * @param  {Number}    [status]               Optional; The (HTTP) status code
 * @param  {String}    [responsedescription]  Optional; The response description
 * @param  {String[]}  [errors]               Optional; An array of errors
 * @property  {String}    namespace            The namespace
 * @property  {String}    tagname              The tag name
 * @property  {NodeList}  xmlvalue             A NodeList with the value of this property
 * @property  {String}    value                A textual representation of xmlvalue
 * @property  {Number}    status               The (HTTP) status code
 * @property  {String}    responsedescription  The response description
 */
nl.sara.webdav.Property = function(xmlNode, status, responsedescription, errors) {
  // First define private attributes
  Object.defineProperty(this, '_xmlvalue', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_errors', {
    'value': [],
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
  Object.defineProperty(this, 'status', {
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

  // Constructor logic
  if (xmlNode instanceof Node) {
    this.namespace = xmlNode.namespaceURI;
    this.tagname = nl.sara.webdav.Ie.getLocalName(xmlNode);
    this.xmlvalue = xmlNode.childNodes;
  }
  if (status !== undefined) {
    this.status = status;
  }
  if (responsedescription !== undefined) {
    this.responsedescription = responsedescription;
  }
  if (errors instanceof Array) {
    for (var i = 0; i < errors.length; i++) {
      this.addError(errors[i]);
    }
  }
};

//######################### DEFINE PUBLIC ATTRIBUTES ###########################
(function() {
  // This creates a (private) static variable. It will contain all codecs
  var codecNamespaces = {};

  Object.defineProperty(nl.sara.webdav.Property.prototype, 'xmlvalue', {
    'set': function(value) {
      if (value === null) {
        this._xmlvalue = null;
        return;
      }
      if (!(value instanceof NodeList)) {
        throw new nl.sara.webdav.Exception('xmlvalue must be an instance of NodeList', nl.sara.webdav.Exception.WRONG_TYPE);
      }
      this._xmlvalue = value;
    },
    'get': function() {
      return this._xmlvalue;
    }
  });

//########################## DEFINE PUBLIC METHODS #############################
  /**
   * Adds functions to encode or decode properties
   *
   * This allows exact control in how Property.xmlvalue is parsed when
   * getParsedValue() is called or how it is rebuild when
   * setValueAndRebuildXml() is called. You can specify two functions: 'fromXML'
   * and 'toXML'. These should be complementary. That is, toXML should be able
   * to create a NodeList based on the output of fromXML. For example:
   * A == toXML(fromXML(A)) &&
   * B == fromXML(toXML(B))
   *
   * @param    {nl.sara.webdav.Codec}  codec  The codec to add
   * @returns  {void}
   */
  nl.sara.webdav.Property.addCodec = function(codec) {
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

  /**
   * Sets a new value and rebuilds xmlvalue
   *
   * If a codec for this property is specified, it will use this codec to
   * rebuild xmlvallue. Else it will attempt to create one CDATA element with
   * the string value of whatever was fiven as parameter.
   *
   * @param   {mixed}  value  The object to base the xmlvalue on
   * @return  {void}
   */
  nl.sara.webdav.Property.prototype.setValueAndRebuildXml = function(value) {
    // Call codec to automatically create correct 'xmlvalue'
    var xmlDoc = document.implementation.createDocument(this.namespace, this.tagname, null);
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
      this._xmlvalue = codecNamespaces[this.namespace][this.tagname]['toXML'](value, xmlDoc).documentElement.childNodes;
    }
  };

  /**
   * Parses the xmlvalue
   *
   * If a codec for this property is specified, it will use this codec to parse
   * the XML nodes. Else it will attempt to parse it as text or CDATA elements.
   *
   * @return  {mixed}  If a codec is specified, the return type depends on that
   * codec. If no codec is specified and at least one node in xmlvalue is not a
   * text or CDATA node, it will return undefined. If xmlvalue is empty, it will
   * return null.
   */
  nl.sara.webdav.Property.prototype.getParsedValue = function() {
    // Call codec to automatically create correct 'value'
    if (this._xmlvalue.length > 0) {
      if ((codecNamespaces[this.namespace] === undefined) ||
          (codecNamespaces[this.namespace][this.tagname] === undefined) ||
          (codecNamespaces[this.namespace][this.tagname]['fromXML'] === undefined)) {
        // No 'fromXML' function set, so try to create a text value based on TextNodes and CDATA nodes. If other nodes are present, set 'value' to null
        var parsedValue = '';
        for (var i = 0; i < this._xmlvalue.length; i++) {
          var node = this._xmlvalue.item(i);
          if ((node.nodeType == 3) || (node.nodeType == 4)) { // Make sure text and CDATA content is stored
            parsedValue += node.nodeValue;
          }else{ // If even one of the nodes is not text or CDATA, then we don't parse a text value at all
            parsedValue = undefined;
            break;
          }
        }
        return parsedValue;
      }else{
        return codecNamespaces[this.namespace][this.tagname]['fromXML'](this._xmlvalue);
      }
    }
    return null;
  };
})(); // Ends the static scope

/**
* Adds an error to this property
*
* @returns {Node} The Node which represents the error
*/
nl.sara.webdav.Property.prototype.addError = function(error) {
  if (!(error instanceof Node)) {
    throw new nl.sara.webdav.Exception('Error must be an instance of Node', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  this._errors.push(error);
  return this;
};

/**
* Returns all errors
*
* @returns {array} An array of Node representing the error
*/
nl.sara.webdav.Property.prototype.getErrors = function() {
  return this._errors;
};

/**
 * Overloads the default toString() method so it returns the value of this property
 *
 * @returns  {String}  A string representation of this property
 */
nl.sara.webdav.Property.prototype.toString = function() {
  return this.getParsedValue();
}

// End of Property
