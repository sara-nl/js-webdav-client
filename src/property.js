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
 * WebDAV property.
 */
nl.sara.webdav.Property = function(xmlNode, status, responsedescription, errors) {
  // Define the hidden attributes which are used by the public attributes set later on
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
  Object.defineProperty(this, '_status', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_error', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_responsedescription', {
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

  // Constructor logic
  if (xmlNode instanceof Node) {
    this.namespace = xmlNode.namespaceURI;
    this.tagname = xmlNode.localName;
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
}

Object.defineProperty(nl.sara.webdav.Property.prototype, 'namespace', {
  'set': function(value) {
    this._namespace = value;
  },
  'get': function() {
    return this._namespace;
  }
});

Object.defineProperty(nl.sara.webdav.Property.prototype, 'tagname', {
  'set': function(value) {
    this._tagname = value;
  },
  'get': function() {
    return this._tagname;
  }
});

Object.defineProperty(nl.sara.webdav.Property.prototype, 'value', {
  'set': function(value) {
    this._xmlvalue = null;
    this._value = value;
  },
  'get': function() {
    return this._value;
  }
});

Object.defineProperty(nl.sara.webdav.Property.prototype, 'xmlvalue', {
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

Object.defineProperty(nl.sara.webdav.Property.prototype, 'status', {
  'set': function(value) {
    var status = parseInt(value, 10);
    if ((status < 200) || (status >= 600)) {
      throw new nl.sara.webdav.Exception('Status must be between 200 and 599 (inclusive)', nl.sara.webdav.Exception.WRONG_VALUE);
    }
    this._status = status;
  },
  'get': function() {
    return this._status;
  }
});

Object.defineProperty(nl.sara.webdav.Property.prototype, 'error', {
  'set': function(value) {
    this._error = value;
  },
  'get': function() {
    return this._error;
  }
});

Object.defineProperty(nl.sara.webdav.Property.prototype, 'responsedescription', {
  'set': function(value) {
    this._responsedescription = value;
  },
  'get': function() {
    return this._responsedescription;
  }
});

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
}

/**
* Returns all errors
*
* @returns {array} An array of Node representing the error
*/
nl.sara.webdav.Property.prototype.getErrors = function() {
  return this._errors;
}

// End of library
