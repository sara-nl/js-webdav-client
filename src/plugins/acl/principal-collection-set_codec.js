/*
 * Copyright ©2014 SARA bv, The Netherlands
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

// If nl.sara.webdav.codec.Principal_collection_setCodec is already defined, we have a namespace clash!
if (nl.sara.webdav.codec.Principal_collection_setCodec !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.codec.Principal_collection_setCodec already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class Adds a codec that converts DAV: principal-collection-setCodec to an array with the uri's object
 * @augments nl.sara.webdav.Codec
 */
nl.sara.webdav.codec.Principal_collection_setCodec = new nl.sara.webdav.Codec();
nl.sara.webdav.codec.Principal_collection_setCodec.namespace = 'DAV:';
nl.sara.webdav.codec.Principal_collection_setCodec.tagname = 'principal-collection-setCodec';

nl.sara.webdav.codec.Principal_collection_setCodec.fromXML = function(nodelist) {
  var collections = [];
  for ( var key = 0; key < nodelist.length; key++ ) {
    var node = nodelist.item( key );
    if ( ( node.nodeType === 1 ) && ( node.nodeName === 'href' ) && ( node.namespaceURI === 'DAV:' ) ) { // Only extract data from DAV: href nodes
      var href = '';
      for ( var subkey = 0; subkey < node.childNodes.length; subkey++ ) {
        var childNode = node.childNodes.item( subkey );
        if ( ( childNode.nodeType === 3 ) || ( childNode.nodeType === 4 ) ) { // Make sure text and CDATA content is stored
          href += childNode.nodeValue;
        }
      }
      collections.push( href );
    }
  }
  return collections;
};

nl.sara.webdav.codec.Principal_collection_setCodec.toXML = function(value, xmlDoc){
  for ( var key in value ) {
    var href = xmlDoc.createElementNS( 'DAV:', 'href' );
    href.appendChild( xmlDoc.createCDATASection( value[ key ] ) );
    xmlDoc.documentElement.appendChild( href );
  }
  return xmlDoc;
};

nl.sara.webdav.Property.addCodec(nl.sara.webdav.codec.Principal_collection_setCodec);

// End of file