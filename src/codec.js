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

// If nl.sara.webdav.Codec is already defined, we have a namespace clash!
if (nl.sara.webdav.Codec !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace name nl.sara.webdav.Codec already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class A codec transcodes the xml to a custom Javascript object
 *
 * @param  {String}                    [namespace]  Optional; The namespace of the property to transcode
 * @param  {String}                    [tagname]    Optional; The tag name of the property to transcode
 * @param  {function(mixed[,xmlDoc])}  [toXML]      Optional; Function which should return a Document with the NodeList of the documentElement as the value of this property
 * @param  {function(NodeList)}        [fromXML]    Optional; Functions which should return a representation of xmlvalue
 * @property  {String}                    namespace  The namespace of the property to transcode
 * @property  {String}                    tagname    The tag name of the property to transcode
 * @property  {function(mixed[,xmlDoc])}  toXML      Function which should return a Document with the NodeList of the documentElement as the value of this property
 * @property  {function(NodeList)}        fromXML    Functions which should return a representation of xmlvalue
 */
nl.sara.webdav.Codec = function(namespace, tagname, toXML, fromXML) {
  // First define public attributes
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
  Object.defineProperty(this, 'toXML', {
    'value': undefined,
    'enumerable': true,
    'configurable': false,
    'writable': true
  });
  // Second define public attributes
  Object.defineProperty(this, 'fromXML', {
    'value': undefined,
    'enumerable': true,
    'configurable': false,
    'writable': true
  });

  // Constructor logic
  if (namespace !== undefined) {
    this.namespace = namespace;
  }
  if (tagname !== undefined) {
    this.tagname = tagname;
  }
  if (toXML !== undefined) {
    this.toXML = toXML;
  }
  if (fromXML !== undefined) {
    this.fromXML = fromXML;
  }
};

// End of file
