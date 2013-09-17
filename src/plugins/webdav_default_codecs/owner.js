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

// If nl.sara.webdav.codec.OwnerCodec is already defined, we have a namespace clash!
if (nl.sara.webdav.codec.OwnerCodec !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.codec.OwnerCodec already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class Adds a codec that converts DAV: owner to a Date object
 * @augments nl.sara.webdav.Codec
 */
nl.sara.webdav.codec.OwnerCodec = new nl.sara.webdav.Codec();
nl.sara.webdav.codec.OwnerCodec.namespace = 'DAV:';
nl.sara.webdav.codec.OwnerCodec.tagname = 'owner';

nl.sara.webdav.codec.OwnerCodec.fromXML = function(nodelist) {
  var returnValue = null;

  // Assertions whether the formed XML is correct
  var hrefNode = nodelist[0];

  if ((hrefNode.nodeType === 1) &&
      (hrefNode.namespaceURI === 'DAV:') &&
      (hrefNode.localName === 'href'))
  {
    var node = hrefNode.childNodes.item(0);

    if ( ( node.nodeType === 3 ) || ( node.nodeType === 4 ) ) { // Make sure text and CDATA content is stored
      returnValue = node.nodeValue;
    }
  } 
  return returnValue;
};

nl.sara.webdav.codec.OwnerCodec.toXML = function(value, xmlDoc){  
  var hrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  hrefNode.appendChild( xmlDoc.createCDATASection( value.toString() ) );
  xmlDoc.documentElement.appendChild( hrefNode );
  
  return xmlDoc
};

nl.sara.webdav.Property.addCodec(nl.sara.webdav.codec.OwnerCodec);

// End of file