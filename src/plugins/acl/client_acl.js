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

/**
 * This plugin adds acl capabilities to the WebDAV client class
 */

/**
 * Perform a WebDAV ACL request
 *
 * @param    {String}                        path      The path to perform ACL on
 * @param    {Function(status,Multistatus)}  callback  Querying the server is done asynchronously, this callback function is called when the results are in
 * @param    {nl.sara.webdav.Acl}            acl       The ACL to submit
 * @returns  {nl.sara.webdav.Client}                   The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.acl = function(path, callback, acl) {
  if ((path === undefined) || (callback === undefined)) {
    throw new nl.sara.webdav.Exception('ACL requires the parameters path, callback and acl', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if (!(typeof path == "string") || (!nl.sara.webdav.Ie.isIE && !(acl instanceof nl.sara.webdav.Acl))) {
    throw new nl.sara.webdav.Exception('ACL parameter; path should be a string, acl should be an instance of Acl', nl.sara.webdav.Exception.WRONG_TYPE);
  }

  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  var aclBody = document.implementation.createDocument("DAV:", "acl", null);
  aclBody = nl.sara.webdav.codec.AclCodec.toXML(acl, aclBody);

  // Create the request body string
  var serializer = new XMLSerializer();
  var body = '<?xml version="1.0" encoding="utf-8" ?>' + serializer.serializeToString(aclBody);

  // And then send the request
  var ajax = null;
  if (nl.sara.webdav.Ie.isIE) {
    if (url.lastIndexOf('?') != -1) {
      url = url + '&_method=acl';
    }else{
      url = url + '?_method=acl';
    }
    ajax = nl.sara.webdav.Client.getAjax('POST', url, callback);
  }else{
    ajax = nl.sara.webdav.Client.getAjax("ACL", url, callback);
  }
  ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
  ajax.send(body);

  return this;
}

/**
 * Perform a WebDAV REPORT request
 *
 * @param    {String}                        path         The path to perform REPORT on
 * @param    {Function(status,Multistatus)}  callback     Querying the server is done asynchronously, this callback function is called when the results are in
 * @param    {Document}                      body         The (XML DOM) document to parse and send as the request body
 * @returns  {nl.sara.webdav.Client}                      The client itself for chaining methods
 */
nl.sara.webdav.Client.prototype.report = function(path, callback, body) {
  if ((path === undefined) || (callback === undefined) || (body === undefined)) {
    throw new nl.sara.webdav.Exception('REPORT requires the parameters path, callback and body', nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER);
  }
  if ((typeof path != "string") || (!nl.sara.webdav.Ie.isIE && !(body instanceof Document))) {
    throw new nl.sara.webdav.Exception('REPORT parameter; path should be a string, body should be an instance of Document', nl.sara.webdav.Exception.WRONG_TYPE);
  }

  // Get the full URL, based on the specified path
  var url = this.getUrl(path);

  // Parse the body
  var serializer = new XMLSerializer();
  var body = '<?xml version="1.0" encoding="utf-8" ?>' + serializer.serializeToString(body);

  // And then send the request
  var ajax = null;
  if (nl.sara.webdav.Ie.isIE) {
    if (url.lastIndexOf('?') != -1) {
      url = url + '&_method=report';
    }else{
      url = url + '?_method=report';
    }
    ajax = nl.sara.webdav.Client.getAjax('POST', url, callback);
  }else{
    ajax = nl.sara.webdav.Client.getAjax("REPORT", url, callback);
  }
  ajax.setRequestHeader('Content-Type', 'application/xml; charset="utf-8"');
  ajax.send(body);

  return this;
}

// End of library
