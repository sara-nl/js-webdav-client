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
  throw new nl.sara.webdav.Exception('Class name nl.sara.webdav.Property already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class a WebDAV property
 * 
 * @param   {Node}  xmlElement  Optionally; the xmlNode describing the propstat object (should be compliant with RFC 4918)
 * @param {Number} status
 * @param {String} responsedescription
 * @param {String[]} errors
 * @property {Element} xmlElement
 * @property value
 * @property {Number} status
 * @property {String} responsedescription
 * @property {String[]} errors
 */
nl.sara.webdav.Property = function() {
  if (0 == arguments.length) {
    throw new nl.sara.webdav.Exception(
      'This constructor requires at least one argument.',
      nl.sara.webdav.Exception.WRONG_TYPE
    );
  }
  this.xmlElement = arguments[0];
  this.status = (1 < arguments.length) ? arguments[1] : 200;
  this.responsedescription = (2 < arguments.length) ? arguments[2] : '';
  this.errors = (3 < arguments.length) ? arguments[3] : [];
}

Object.defineProperty(
  nl.sara.webdav.Property.prototype, 'value', {
    get: function() {
      var result;
      switch (this.namespace + this.tagname) {
      case 'DAV:getcontentlength':
        return parseInt(this.xmlElement.textContent, 10);
      case 'DAV:getlastmodified':
        result = this.xmlElement.textContent;
        // TODO: parse `result` into a UNIX timestamp (ie. an integer).
        return result;
      case 'DAV:owner':
      case 'DAV:group':
        result = [];
        // TODO: parse all HREF elements and return as an array of URLs.
        return result;
      // TODO: implement all other known property types.
      }
      // By default, do nothing, ie. return `undefined`.
    } // function
  } // config object
);

Object.defineProperty(
  nl.sara.webdav.Property.prototype, 'status', {
    get: nl.sara.webdav.defaultGetter('_status'),
    set: function(status) {
      status = parseInt(status, 10);
      if ((status < 200) || (status >= 600)) {
        throw new nl.sara.webdav.Exception('Status must be between 200 and 599 (inclusive)', nl.sara.webdav.Exception.WRONG_VALUE);
      }
      this._status = status;
    },
  } // config object
);

Object.defineProperty(
  nl.sara.webdav.Property.prototype, 'namespace', {
    get: function() { return this.xmlElement.namespaceURI; }
  }
);

Object.defineProperty(
  nl.sara.webdav.Property.prototype, 'tagname', {
    get: function() { return this.xmlElement.tagname; }
  }
);

// End of library
