"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsdlCacheSingleton = exports.parseMTOMResp = exports.xmlEscape = exports.splitQName = exports.findPrefix = exports.TNS_PREFIX = exports.passwordDigest = void 0;
const crypto = __importStar(require("crypto"));
function passwordDigest(nonce, created, password) {
    // digest = base64 ( sha1 ( nonce + created + password ) )
    const pwHash = crypto.createHash('sha1');
    const NonceBytes = Buffer.from(nonce || '', 'base64');
    const CreatedBytes = Buffer.from(created || '', 'utf8');
    const PasswordBytes = Buffer.from(password || '', 'utf8');
    const FullBytes = Buffer.concat([NonceBytes, CreatedBytes, PasswordBytes]);
    pwHash.update(FullBytes);
    return pwHash.digest('base64');
}
exports.passwordDigest = passwordDigest;
exports.TNS_PREFIX = '__tns__'; // Prefix for targetNamespace
/**
 * Find a key from an object based on the value
 * @param {Object} Namespace prefix/uri mapping
 * @param {*} nsURI value
 * @returns {String} The matching key
 */
function findPrefix(xmlnsMapping, nsURI) {
    for (const n in xmlnsMapping) {
        if (n === exports.TNS_PREFIX) {
            continue;
        }
        if (xmlnsMapping[n] === nsURI) {
            return n;
        }
    }
}
exports.findPrefix = findPrefix;
function splitQName(nsName) {
    if (typeof nsName !== 'string') {
        return {
            prefix: exports.TNS_PREFIX,
            name: nsName,
        };
    }
    const [topLevelName] = nsName.split('|', 1);
    const prefixOffset = topLevelName.indexOf(':');
    return {
        prefix: topLevelName.substring(0, prefixOffset) || exports.TNS_PREFIX,
        name: topLevelName.substring(prefixOffset + 1),
    };
}
exports.splitQName = splitQName;
function xmlEscape(obj) {
    if (typeof (obj) === 'string') {
        if (obj.substr(0, 9) === '<![CDATA[' && obj.substr(-3) === ']]>') {
            return obj;
        }
        return obj
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    return obj;
}
exports.xmlEscape = xmlEscape;
function parseMTOMResp(payload, boundary, callback) {
    return import('formidable')
        .then(({ MultipartParser }) => {
        const resp = {
            parts: [],
        };
        let headerName = '';
        let headerValue = '';
        let data;
        let partIndex = 0;
        const parser = new MultipartParser();
        parser.initWithBoundary(boundary);
        parser.on('data', ({ name, buffer, start, end }) => {
            switch (name) {
                case 'partBegin':
                    resp.parts[partIndex] = {
                        body: null,
                        headers: {},
                    };
                    data = Buffer.from('');
                    break;
                case 'headerField':
                    headerName = buffer.slice(start, end).toString();
                    break;
                case 'headerValue':
                    headerValue = buffer.slice(start, end).toString();
                    break;
                case 'headerEnd':
                    resp.parts[partIndex].headers[headerName.toLowerCase()] = headerValue;
                    break;
                case 'partData':
                    data = Buffer.concat([data, buffer.slice(start, end)]);
                    break;
                case 'partEnd':
                    resp.parts[partIndex].body = data;
                    partIndex++;
                    break;
            }
        });
        parser.write(payload);
        return callback(null, resp);
    })
        .catch(callback);
}
exports.parseMTOMResp = parseMTOMResp;
class DefaultWSDLCache {
    constructor() {
        this.cache = {};
    }
    has(key) {
        return !!this.cache[key];
    }
    get(key) {
        return this.cache[key];
    }
    set(key, wsdl) {
        this.cache[key] = wsdl;
    }
    clear() {
        this.cache = {};
    }
}
exports.wsdlCacheSingleton = new DefaultWSDLCache();
//# sourceMappingURL=utils.js.map