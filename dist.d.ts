
type ajaxCallbackType = (status: number, body: string | nl.sara.webdav.Multistatus, headers: string | string[]) => void;


interface NlType {
    sara: {
        webdav: {
            Ace: nl.sara.webdav.Ace;
            Acl: nl.sara.webdav.Acl;
            Client: nl.sara.webdav.Client;
        },
    };
}

// export as namespace nl;
export = nl;
declare const nl: NlType;

// tslint:disable:no-namespace
// tslint:disable:no-internal-module
declare namespace nl {
    export namespace sara {
        export namespace webdav {
            interface Ace {
                test(a: string): boolean;
            }
            interface Acl { // http://sara-nl.github.io/js-webdav-client/symbols/nl.sara.webdav.Acl.html
                test(a: string): boolean;
            }

            interface Client { // http://sara-nl.github.io/js-webdav-client/symbols/nl.sara.webdav.Client.html

                new(config: any, useHTTPS?: boolean, port?: number, defaultHeaders?: any);

                // Perform a WebDAV ACL request
                acl(path: string, callback: ajaxCallbackType, acl: nl.sara.webdav.Acl, headers: string[])
                    : nl.sara.webdav.Client;

                // AJAX request handler.
                ajaxHandler(ajax: XMLHttpRequest, callback: ajaxCallbackType): void; // todo static!!!

                // Perform a WebDAV COPY request
                copy(
                    path: string,
                    callback: ajaxCallbackType,
                    destination: string,
                    overwriteMode?: number,
                    depth?: string,
                    headers?: string[],
                ): nl.sara.webdav.Client;

                // Perform a WebDAV GET request
                get(path: string, callback: ajaxCallbackType, headers?: string[])
                    : nl.sara.webdav.Client;

                // Prepares a XMLHttpRequest object to be used for an AJAX request
                getAjax(method: string, url: string, callback: ajaxCallbackType, headers: string[]): XMLHttpRequest;

                // Converts a path to the full url (i.e. appends the protocol and host part)
                getUrl(path: string): string;

                // Perform a WebDAV HEAD request
                head(path: string, callback: ajaxCallbackType, headers?: string[]): nl.sara.webdav.Client;

                // Perform a WebDAV LOCK request
                lock(path: string, callback: ajaxCallbackType, body?: Document, headers?: string[])
                    : nl.sara.webdav.Client;

                // Perform a WebDAV MKCOL request
                mkcol(path: string, callback: ajaxCallbackType, body?: string, contenttype?: string, headers?: string[])
                    : nl.sara.webdav.Client;

                // Perform a WebDAV MOVE request
                move(
                    path: string,
                    callback: ajaxCallbackType,
                    destination: string,
                    overwriteMode?: number,
                    headers?: string[],
                ): void;

                // Perform a WebDAV POST request
                post(path: string, callback: ajaxCallbackType, body?: string, contenttype?: string, headers?: string[])
                    : nl.sara.webdav.Client;

                // Perform a WebDAV PROPFIND request
                propfind(
                    path: string,
                    callback: ajaxCallbackType,
                    depth?: number,
                    props?: any,
                    include?: nl.sara.webdav.Property[],
                    headers?: string[],
                ): nl.sara.webdav.Client;

                // Perform a WebDAV PROPPATCH request
                proppatch(
                    path: string,
                    callback: ajaxCallbackType,
                    setProps?: nl.sara.webdav.Property[],
                    delProps?: nl.sara.webdav.Property[],
                    headers?: string[],
                ): nl.sara.webdav.Client;

                // Perform a WebDAV PUT request
                put(path: string, callback: ajaxCallbackType, body: string, contenttype?: string, headers?: string[])
                    : nl.sara.webdav.Client;

                // Perform a WebDAV DELETE request Because 'delete' is an operator in JavaScript, I had to name this
                // method 'remove'.
                remove(path: string, callback: ajaxCallbackType, headers?: string[]): nl.sara.webdav.Client;

                // Perform a WebDAV REPORT request
                report(path: string, callback: ajaxCallbackType, body: Document, headers?: string[])
                    : nl.sara.webdav.Client;

                // Perform a WebDAV UNLOCK request
                unlock(path: string, callback: ajaxCallbackType, lockToken: string, headers?: string[])
                    : nl.sara.webdav.Client;
            }

            interface Codec {
                // Functions which should return a representation of xmlvalue
                fromXML: (nodeList: NodeList) => any; // todo type

                // The namespace of the property to transcode
                namespace: string;

                // The tag name of the property to transcode
                tagname: string;

                // Function which should return a Document with the NodeList of the documentElement as the value of
                // this property
                toXML: (doc: any) => XMLDocument;
            }

            interface Multistatus {
                // The response description
                responsedescription: string;
                // constructor
                new(xmlNode?: XMLDocument);

                // Adds a Response
                addResponse(response: nl.sara.webdav.Response): nl.sara.webdav.Multistatus;

                // Gets a Response
                getResponse(name: string): nl.sara.webdav.Response;

                // Gets the response names
                getResponseNames(): string[];
            }

            interface Property {

                // The namespace
                namespace: string;

                // The response description
                responsedescription: string;

                // The (HTTP) status code
                status: number;

                // The tag name
                tagname: string;

                // A NodeList with the value of this property
                xmlvalue: NodeList;

                // constructor
                new(xmlNode?: Node, status?: number, responsedescription?: string, errors?: string[]);


                // Adds functions to encode or decode properties This allows exact control in how Property.xmlvalue is
                // parsed when getParsedValue() is called or how it is rebuild when setValueAndRebuildXml() is called.
                addCodec(codec: nl.sara.webdav.Codec): void; // static

                // Adds an error to this property
                addError(error: Node): nl.sara.webdav.Property;

                // Returns all errors
                getErrors(): Node[];

                // Parses the xmlvalue If a codec for this property is specified, it will use this codec to parse the
                // XML nodes.
                getParsedValue(): any;

                // Sets a new value and rebuilds xmlvalue If a codec for this property is specified, it will use this
                // codec to rebuild xmlvallue.
                setValueAndRebuildXml(value: any): void;

                // Overloads the default toString() method so it returns the value of this property
                toString(): string;
            }

            interface Response {
                // The error text
                error: string;

                // The path of the resource
                href: string;

                // In case of a 3XX response, the value that would normally be in the 'Location' header
                location: string;

                // The response description
                responsedescription: string;

                // The (HTTP) status code
                status: string;

                // constructor
                new(xmlNode?: XMLDocument);


                // Adds a WebDAV property
                addProperty(property: nl.sara.webdav.Property): nl.sara.webdav.Response;

                // Gets the namespace names
                getNamespaceNames(): string[];

                // Gets a WebDAV property
                getProperty(namespace: string, prop: string): nl.sara.webdav.Property;

                // Gets the property names of a namespace
                getPropertyNames(namespace: string): string[];
            }
        }
    }
}

/**
 * Working module package, but not compiling
 */
/*
declare module "nl" {
    let nL = nl;
    export = nL;
}
*/
