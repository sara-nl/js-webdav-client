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

// If it isn't done yet: create a namespace for all the default codecs
if (nl.sara.webdav.codec === undefined) {
  nl.sara.webdav.codec = {};
}

// If nl.sara.webdav.codec.ResourcetypeCodec is already defined, we have a namespace clash!
if (nl.sara.webdav.codec.ResourcetypeCodec !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.codec.ResourcetypeCodec already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class Adds a codec that converts DAV: resourcetype to a Date object
 * @augments nl.sara.webdav.Codec
 */
nl.sara.webdav.codec.ResourcetypeCodec = new nl.sara.webdav.Codec();
nl.sara.webdav.codec.ResourcetypeCodec.namespace = 'DAV:';
nl.sara.webdav.codec.ResourcetypeCodec.tagname = 'resourcetype';

/**
 * Class constants are a way to specify what the resource type is
 */
nl.sara.webdav.codec.ResourcetypeCodec.COLLECTION = 1;
nl.sara.webdav.codec.ResourcetypeCodec.UNSPECIFIED = 2;
nl.sara.webdav.codec.ResourcetypeCodec.PRINCIPAL = 4;

nl.sara.webdav.codec.ResourcetypeCodec.fromXML = function(nodelist) {
  for (var i = 0; i < nodelist.length; i++) {
    var node = nodelist.item(i);
    if (node.namespaceURI == 'DAV:') {
      switch (nl.sara.webdav.Ie.getLocalName(node)) {
        case 'collection':
          return nl.sara.webdav.codec.ResourcetypeCodec.COLLECTION;
        case 'principal':
          return nl.sara.webdav.codec.ResourcetypeCodec.PRINCIPAL;
      }
    }
  }
  return nl.sara.webdav.codec.ResourcetypeCodec.NON_COLLECTION;
};

nl.sara.webdav.codec.ResourcetypeCodec.toXML = function(value, xmlDoc){
  switch(value) {
    case nl.sara.webdav.codec.ResourcetypeCodec.COLLECTION:
      var collection = xmlDoc.createElementNS('DAV:', 'collection');
      xmlDoc.documentElement.appendChild(collection);
    case nl.sara.webdav.codec.ResourcetypeCodec.PRINCIPAL:
      var collection = xmlDoc.createElementNS('DAV:', 'principal');
      xmlDoc.documentElement.appendChild(collection);
    break;
  }
  return xmlDoc;
};

nl.sara.webdav.Property.addCodec(nl.sara.webdav.codec.ResourcetypeCodec);

// End of file
