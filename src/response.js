// If nl.sara.webdav.Response is already defined, we have a namespace clash!
if (nl.sara.webdav.Response !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Response already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * This class describes a WebDAV response
 * 
 * @param   Node  xmlNode  Optionally; the xmlNode describing the response object (should be compliant with RFC 4918)
 */
nl.sara.webdav.Response = function(xmlNode) {
  this._namespaces = {};
  this._defaultprops = {
    'href'                : null,
    'status'              : null,
    'error'               : null,
    'responsedescription' : null,
    'location'            : null
  }
  
  // Constructor logic
  if (xmlNode instanceof Node) { 
    if ((xmlNode.namespaceURI.toLowerCase() != 'dav:') || (xmlNode.localName.toLowerCase() != 'response')) {
      throw new nl.sara.webdav.Exception('Node is not of type DAV:response', nl.sara.webdav.Exception.WRONG_XML);
    }
    var data = xmlNode.childNodes;
    for (var i = 0; i < data.length; i++) {
      var child = data.item(i);
      if ((child.namespaceURI == null) || (child.namespaceURI.toLowerCase() != 'dav:')) { // Skip if not from the right namespace
        continue;
      }
      switch (child.localName) {
        case 'href':
        case 'status':
        case 'error':
        case 'responsedescription':
          // always CDATA, so just take the text
          this.set(child.localName, child.childNodes.item(0).nodeValue);
          break;
        case 'location':
          this.set(child.localName, child.childNodes.item(0).childNodes.item(0).nodeValue);
          break;
        case 'propstat': // propstat node should be parsed further
          var property = new nl.sara.webdav.Property(child);
          var propertyChilds = child.childNodes;
          var props = [];
          for (var j = 0; j < propertyChilds.length; j++) {
            var propertyChild = propertyChilds.item(j);
            if ((propertyChild.localName == 'prop') &&
                (propertyChild.namespaceURI != null) &&
                (propertyChild.namespaceURI.toLowerCase() == 'dav:')) {
              for (var k = 0; k < propertyChild.childNodes.length; k++) {
                props.push(propertyChild.childNodes.item(k));
              }
              break;
            }
          }
          if (props.length > 1) {
            for (var l = 0; l < props.length; l++) {
              var prop = props[l];
              var copyProperty = new nl.sara.webdav.Property();
              copyProperty.set('status', property.get('status'));
              copyProperty.set('responsedescription', property.get('responsedescription'));
              var errors = property.getErrors();
              for (var m = 0; m < errors.length; m++) {
                copyProperty.addError(errors[m]);
              }
              copyProperty.set('xmlvalue', prop);
              if (copyProperty.get('namespace')) {
                this.addProperty(copyProperty);
              }
            }
          }else{
            this.addProperty(property);
          }
        break;
      }
    }
  }
}

/**
 * Adds a WebDAV property
 * 
 * @param   Property  property  The property
 * @return  Response            The response itself for chaining methods
 */
nl.sara.webdav.Response.prototype.addProperty = function(property) {
  if (!(property instanceof nl.sara.webdav.Property)) {
    throw new nl.sara.webdav.Exception('Response property should be instance of Property', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  var namespace = property.get('namespace');
  if (namespace) {
    if (this._namespaces[namespace] === undefined) {
      this._namespaces[namespace] = {};
    }
  }else{
    throw new nl.sara.webdav.Exception('Response property should have a namespace', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  this._namespaces[namespace][property.get('tagname')] = property;
  return this;
}

/**
 * Gets a WebDAV property
 * 
 * @param   string    namespace  The namespace of the WebDAV property
 * @param   string    prop       The WebDAV property to get
 * @return  Property             The value of the WebDAV property or undefined if the WebDAV property doesn't exist
 */
nl.sara.webdav.Response.prototype.getProperty = function(namespace, prop) {
  if ((this._namespaces[namespace] === undefined) || (this._namespaces[namespace][prop] === undefined)) {
    return undefined;
  }
  return this._namespaces[namespace][prop];
}

/**
 * Gets the namespace names
 * 
 * @return  String[]  The names of the different namespaces
 */
nl.sara.webdav.Response.prototype.getNamespaceNames = function() {
  return Object.keys(this._namespaces);
}

/**
 * Gets the property names of a namespace
 * 
 * @param   string    namespace  The namespace of the WebDAV property
 * @return  String[]             The names of the different properties of a namespace
 */
nl.sara.webdav.Response.prototype.getPropertyNames = function(namespace) {
  if (this._namespaces[namespace] === undefined) {
    return new Array();
  }
  return Object.keys(this._namespaces[namespace]);
}

/**
 * Sets a property
 * 
 * @param   string    prop   The property to update
 * @param   mixed     value  The value
 * @return  Response         The response itself for chaining methods
 */
nl.sara.webdav.Response.prototype.set = function(prop, value) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  this._defaultprops[prop] = value;
  return this;
}

/**
 * Gets a property
 * 
 * @param   string  prop  The property to get
 * @return  mixed         The value of the property
 */
nl.sara.webdav.Response.prototype.get = function(prop) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  return this._defaultprops[prop];
}

// End of library
