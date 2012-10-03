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

/**
 * Adds a codec that converts DAV: getcontentlength to an integer
 */
(function() {
  var codec = new nl.sara.webdav.Codec();
  codec.namespace = 'DAV:';
  codec.tagname = 'getcontentlength';

  codec.fromXML = function(nodelist) {
    var node = nodelist.item(0);
    if ((node.nodeType == 3) || (node.nodeType == 4)) { // Make sure text and CDATA content is stored
      return parseInt(node.nodeValue);
    }else{ // If the node is not text or CDATA, then we don't parse a text value at all
      return null;
    }
  };

  codec.toXML = function(value, xmlDoc){
    var cdata = xmlDoc.createCDATASection(value.toString());
    xmlDoc.documentElement.appendChild(cdata);
    return xmlDoc.documentElement.childNodes;
  };

  nl.sara.webdav.Property.addCodec(codec);
})();

// End of file