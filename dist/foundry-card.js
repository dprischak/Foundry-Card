// src/cards/utils.js
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
function fireEvent(node, type2, detail = {}, options = {}) {
  detail = detail === null || detail === void 0 ? {} : detail;
  const event = new CustomEvent(type2, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? false,
    composed: options.composed ?? true,
    detail
  });
  node.dispatchEvent(event);
  return event;
}
function getActionConfig(config, key, fallback) {
  if (config && config[key]) return config[key];
  return fallback;
}
function handleAction(node, hass, config, actionConfig) {
  if (!actionConfig || !hass) return;
  const action = actionConfig.action;
  if (!action || action === "none") return;
  if (action === "more-info") {
    const entityId = config.entity || actionConfig.entity;
    if (entityId) {
      fireEvent(node, "hass-more-info", { entityId });
    }
    return;
  }
  if (action === "navigate") {
    const path = actionConfig.navigation_path;
    if (!path) return;
    navigate(node, path);
    return;
  }
  if (action === "toggle") {
    const entityId = config.entity || actionConfig.entity;
    if (!entityId) return;
    hass.callService("homeassistant", "toggle", { entity_id: entityId });
    return;
  }
  if (action === "call-service" || action === "perform-action") {
    const service = actionConfig.service || actionConfig.perform_action;
    if (!service) return;
    const [domain, srv] = service.split(".");
    const data = { ...actionConfig.service_data, ...actionConfig.data };
    if (actionConfig.target && actionConfig.target.entity_id) {
      data.entity_id = actionConfig.target.entity_id;
    }
    hass.callService(domain, srv, data);
    return;
  }
  if (action === "assist") {
    if (hass.auth && hass.auth.external && hass.auth.external.fireMessage) {
      hass.auth.external.fireMessage({ type: "assist/show" });
    } else {
      fireEvent(node, "hass-toggle-assistant");
    }
    return;
  }
  if (action === "url") {
    if (actionConfig.url_path) {
      window.open(actionConfig.url_path);
    }
  }
}
function navigate(node, path, replace = false) {
  if (history.pushState) {
    history.pushState(null, "", path);
    fireEvent(window, "location-changed", {
      replace
    });
  } else {
    location.href = path;
  }
}

// node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  })();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = (function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  })();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 65536) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var Type = type;
var Schema = schema;
var FAILSAFE_SCHEMA = failsafe;
var JSON_SCHEMA = json;
var CORE_SCHEMA = core;
var DEFAULT_SCHEMA = _default;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception;
var types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
};
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");
var jsYaml = {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
};

// src/cards/themes.js
var cachedThemesPromise = null;
async function loadThemes() {
  const loadAll2 = async () => {
    const themes = {};
    const basePath = new URL(".", import.meta.url).href;
    const load2 = async (filename) => {
      try {
        const url = new URL(filename, basePath).href + "?v=" + (/* @__PURE__ */ new Date()).getTime();
        const response = await fetch(url);
        if (response.ok) {
          const text = await response.text();
          const data = jsYaml.load(text);
          for (const [themeName, themeData] of Object.entries(data)) {
            let finalName = themeName;
            let counter = 2;
            while (themes[finalName]) {
              finalName = `${themeName}_${counter}`;
              counter++;
            }
            themes[finalName] = themeData;
          }
        } else {
          console.warn(
            `[Foundry Cards] Failed to fetch theme file: ${filename} (Status: ${response.status})`
          );
        }
      } catch (e) {
        console.warn(`Failed to load theme file: ${filename}`, e);
      }
    };
    await load2("themes.yaml");
    await load2("userthemes.yaml");
    return themes;
  };
  cachedThemesPromise = loadAll2();
  return cachedThemesPromise;
}
function applyTheme(config, theme) {
  if (!theme) return config;
  const newConfig = { ...config };
  const themeProperties = [
    "plate_color",
    "rivet_color",
    "ring_style",
    "title_color",
    "font_color",
    "font_bg_color",
    "number_color",
    "primary_tick_color",
    "secondary_tick_color",
    "background_style",
    "face_color",
    "liquid_color",
    "needle_color",
    "plate_transparent",
    "glass_effect_enabled",
    "wear_level",
    "aged_texture",
    "aged_texture_intensity",
    "slider_color",
    "knob_color",
    "tick_color"
  ];
  for (const key of themeProperties) {
    if (theme[key] !== void 0) {
      newConfig[key] = theme[key];
    }
  }
  return newConfig;
}

// src/cards/foundry-gauge-card.js
var FoundryGaugeCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._resizeObserver = null;
    this._highNeedleValue = null;
    this._highNeedleTimeout = null;
    this._isShaking = false;
    this._shakeTargetAngle = null;
    this._previousNeedleAngle = null;
    this._previousHighNeedleAngle = null;
    this._previousValue = null;
    this._previousHighValue = null;
    this._entityError = null;
    this._boundHandleClick = () => this._handleAction("tap");
    this._boundHandleDblClick = () => this._handleAction("double_tap");
    this._boundHandleContextMenu = (e) => {
      e.preventDefault();
      this._handleAction("hold");
    };
    this._boundHandleKeyDown = (e) => this._handleKeyDown(e);
    this._debouncedReflow = debounce(() => this._reflowFlipDisplay(), 100);
  }
  connectedCallback() {
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(this._debouncedReflow);
    }
    const container = this.shadowRoot?.querySelector(".gauge-container");
    if (container) this._resizeObserver.observe(container);
  }
  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }
  _reflowFlipDisplay() {
    const flipDisplay = this.shadowRoot?.getElementById("flipDisplay");
    if (!flipDisplay || !this.config) return;
    const raw = flipDisplay.dataset.numericValue;
    if (raw === void 0 || raw === null || raw === "") return;
    const value = parseFloat(raw);
    if (Number.isNaN(value)) return;
    const digitsRow = flipDisplay.querySelector(".digits-row");
    if (!digitsRow) return;
    const digitElements = Array.from(digitsRow.children).filter(
      (el) => el.classList.contains("flip-digit") && !el.classList.contains("decimal") && !el.classList.contains("minus-sign") && !el.classList.contains("unit")
    );
    digitElements.forEach((digitEl) => {
      const inner = digitEl.querySelector(".flip-digit-inner");
      const position = digitEl.dataset.position;
      if (inner && position !== void 0) {
        const targetDigit = parseInt(position);
        const offset = -targetDigit * 100;
        inner.style.transition = "none";
        inner.style.transform = `translateY(${offset}%)`;
        requestAnimationFrame(() => {
          inner.style.transition = "";
        });
      }
    });
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = { ...config };
    this._validateConfig();
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this.render();
          this.updateGauge();
        }
      });
    }
    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }
    if (this.config.ring_style === void 0) {
      this.config.ring_style = "brass";
    }
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    this.render();
    if (this._hass) {
      requestAnimationFrame(() => this.updateGauge());
    }
  }
  _validateConfig() {
    const config = this.config;
    const min = config.min !== void 0 ? config.min : 0;
    const max = config.max !== void 0 ? config.max : 100;
    if (min >= max) {
      console.warn(
        "Foundry Gauge Card: min value must be less than max value. Using defaults."
      );
      this.config.min = 0;
      this.config.max = 100;
    }
    if (config.decimals !== void 0) {
      const decimals = parseInt(config.decimals);
      if (isNaN(decimals) || decimals < 0) {
        console.warn(
          "Foundry Gauge Card: decimals must be a non-negative integer. Using 0."
        );
        this.config.decimals = 0;
      } else {
        this.config.decimals = Math.min(decimals, 10);
      }
    }
    if (config.start_angle !== void 0) {
      const angle = parseFloat(config.start_angle);
      if (isNaN(angle)) {
        this.config.start_angle = 200;
      } else {
        this.config.start_angle = (angle % 360 + 360) % 360;
      }
    }
    if (config.end_angle !== void 0) {
      const angle = parseFloat(config.end_angle);
      if (isNaN(angle)) {
        this.config.end_angle = 160;
      } else {
        this.config.end_angle = (angle % 360 + 360) % 360;
      }
    }
    if (config.animation_duration !== void 0) {
      const duration = parseFloat(config.animation_duration);
      if (isNaN(duration) || duration <= 0) {
        console.warn(
          "Foundry Gauge Card: animation_duration must be positive. Using 1.2s."
        );
        this.config.animation_duration = 1.2;
      } else {
        this.config.animation_duration = Math.min(duration, 10);
      }
    }
    if (config.wear_level !== void 0) {
      const wear = parseFloat(config.wear_level);
      if (isNaN(wear)) {
        this.config.wear_level = 50;
      } else {
        this.config.wear_level = Math.max(0, Math.min(100, wear));
      }
    }
    if (config.aged_texture_intensity !== void 0) {
      const intensity = parseFloat(config.aged_texture_intensity);
      if (isNaN(intensity)) {
        this.config.aged_texture_intensity = 50;
      } else {
        this.config.aged_texture_intensity = Math.max(
          0,
          Math.min(100, intensity)
        );
      }
    }
    if (config.high_needle_duration !== void 0) {
      const duration = parseFloat(config.high_needle_duration);
      if (isNaN(duration) || duration <= 0) {
        this.config.high_needle_duration = 60;
      } else {
        this.config.high_needle_duration = Math.max(1, duration);
      }
    }
    if (config.high_needle_length !== void 0) {
      const length = parseFloat(config.high_needle_length);
      if (isNaN(length)) {
        this.config.high_needle_length = 100;
      } else {
        this.config.high_needle_length = Math.max(25, Math.min(150, length));
      }
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    if (!this.shadowRoot) return;
    this.updateGauge();
  }
  render() {
    const config = this.config;
    const title = config.title || "";
    const min = config.min !== void 0 ? config.min : 0;
    const max = config.max !== void 0 ? config.max : 100;
    const uid = this._uniqueId;
    const animationDuration = config.animation_duration !== void 0 ? config.animation_duration : 1.2;
    const titleFontSize = config.title_font_size !== void 0 ? config.title_font_size : 12;
    const odometerFontSize = config.odometer_font_size !== void 0 ? config.odometer_font_size : 60;
    const odoFont = `${odometerFontSize * 0.16}px`;
    const odoDigitW = `${odometerFontSize * 0.15}px`;
    const odoDigitH = `${odometerFontSize * 0.22}px`;
    const odoGap = `${odometerFontSize * 0.03}px`;
    const odometerVerticalPosition = config.odometer_vertical_position !== void 0 ? config.odometer_vertical_position : 120;
    const ringStyle = config.ring_style !== void 0 ? config.ring_style : "brass";
    const rimData = this.getRimStyleData(ringStyle, uid);
    const rivetColor = config.rivet_color !== void 0 ? config.rivet_color : "#6d5d4b";
    const highNeedleEnabled = config.high_needle_enabled !== void 0 ? config.high_needle_enabled : false;
    const highNeedleColor = config.high_needle_color !== void 0 ? config.high_needle_color : "#FF9800";
    const highNeedleLength = config.high_needle_length !== void 0 ? config.high_needle_length : 100;
    const plateColor = config.plate_color !== void 0 ? config.plate_color : "transparent";
    const plateTransparent = config.plate_transparent !== void 0 ? config.plate_transparent : false;
    const wearLevel = config.wear_level !== void 0 ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== void 0 ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== void 0 ? config.aged_texture : "glass_only";
    const agedTextureIntensity = config.aged_texture_intensity !== void 0 ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = plateTransparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    const agedTextureEnabled = effectiveAgedTexture === "glass_only";
    const startAngleDeg = config.start_angle !== void 0 ? config.start_angle : 200;
    const endAngleDeg = config.end_angle !== void 0 ? config.end_angle : 160;
    this._startAngle = startAngleDeg - 90;
    this._endAngle = endAngleDeg - 90;
    this._animationDuration = animationDuration;
    const segments = config.segments || [
      { from: 0, to: 33, color: "#4CAF50" },
      { from: 33, to: 66, color: "#FFC107" },
      { from: 66, to: 100, color: "#F44336" }
    ];
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 0px;
        }
		ha-card {
		  container-type: inline-size;
		}
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
		  cursor: pointer;		  
        }
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #3e2723;
          margin-bottom: 10px;
          font-family: 'Georgia', serif;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
        }
        .gauge-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          container-type: inline-size;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translateX(3px) rotate(0.5deg); }
        }
        .gauge-container.shaking {
          animation: shake 0.25s ease-in-out;
        }
        .gauge-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .value-display {
          display: flex;
          flex-direction: column;
          gap: ${odoGap};
          justify-content: flex-start;
          align-items: center;
          pointer-events: none;
          width: 200px;
          height: 200px;
          padding-top: ${odometerVerticalPosition}px;
        }
        .digits-row {
          display: flex;
          gap: ${odoGap};
          justify-content: center;
          align-items: center;
        }
        .flip-digit {
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
          color: #f0f0f0;
          font-family: 'Courier New', monospace;
          font-size: ${odoFont};
          font-weight: bold;
          width: ${odoDigitW};
          height: ${odoDigitH};
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: ${odoGap};
          box-shadow: 
            inset 0 1px 2px rgba(255,255,255,0.2),
            inset 0 -1px 2px rgba(0,0,0,0.5),
            0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
          position: relative;
          overflow: hidden;
        }
        .flip-digit::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.6), transparent);
          box-shadow: 0 0 2px rgba(0,0,0,0.8);
        }
       .flip-digit.decimal {
          width: ${odoDigitW};
          background: white;
          color: black;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
        }
        .flip-digit.fractional {
          background: white;
          color: black;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
        }
        .flip-digit.fractional::before {
          display: none;
        }
        .flip-digit.fractional .digit-item {
          color: black;
        }
        .flip-digit.minus-sign {
          width: ${odoDigitW};
          /* Keep same background and styling as regular digits */
        }
        .flip-digit.minus-sign::before {
          /* Keep the center line like regular digits */
        }
        .flip-digit.unit {
          background: transparent;
          color: #2c1810;
          font-family: 'Georgia', serif;
          font-size: ${odoFont};
          width: auto;
          height: auto;
          box-shadow: none;
          border: none;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
        }
        .flip-digit.unit::before {
          display: none;
        }
        .flip-digit-inner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform ${animationDuration}s ease-out;
          will-change: transform;
        }
        .digit-item {
          height: ${odoDigitH};
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
          flex-shrink: 0;
          line-height: 1;
          padding-top: 0.1em;
        }
        .rivet {
          fill: ${rivetColor};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${title ? title.replace(/\\\\n/g, " ") : "Foundry gauge"} showing ${config.entity}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="gauge-container" role="presentation">
            <svg class="gauge-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for gauge face -->
                <radialGradient id="gaugeFace-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%" style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
                </radialGradient>
                
                <!-- Gradient for brass rim -->
                <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
                </linearGradient>
                
                <!-- Gradient for silver rim -->
                <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
                </linearGradient>
				
				<!-- White rim -->
				<linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#ffffff;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#dcdcdc;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#f0f0f0;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
				</linearGradient>

				<!-- Blue rim -->
				<linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
				</linearGradient>

				<!-- Green rim -->
				<linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
				</linearGradient>

				<!-- Red rim -->
				<linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
				</linearGradient>

				<!-- Typical gauge options -->

				<!-- Black / gunmetal -->
				<linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#555555;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f1f1f;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#444444;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
				</linearGradient>

				<!-- Copper -->
				<linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
				</linearGradient>
								
                
                <!-- Shadow filter -->
                <filter id="innerShadow-${uid}">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="1" dy="1" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <!-- Aged texture -->
                <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply"/>
                </filter>
                
                <!-- Clip path for gauge face to contain aged texture -->
                <clipPath id="gaugeFaceClip-${uid}">
                  <circle cx="100" cy="100" r="85"/>
                </clipPath>
              </defs>
              <rect x="0" y="0" width="200" height="200" fill="${plateTransparent ? "rgba(240, 235, 225, 0.15)" : plateColor}" ${effectiveAgedTexture === "everywhere" ? `filter="url(#aged-${uid})"` : ""} />
              ${this.renderRim(ringStyle, uid)}
              
              <!-- Gauge face -->
              <circle cx="100" cy="100" r="85" fill="${config.background_style === "solid" ? config.face_color || "#f8f8f0" : `url(#gaugeFace-${uid})`}" ${agedTexture !== "none" && (agedTextureEnabled || effectiveAgedTexture === "everywhere") ? `filter="url(#aged-${uid})" clip-path="url(#gaugeFaceClip-${uid})"` : ""}/>
                            

              <!-- Glass effect overlay -->
              ${glassEffectEnabled ? '<ellipse cx="100" cy="80" rx="60" ry="50" fill="white" opacity="0.15"/>' : ""}
              
              <!-- Segment arcs -->
              <g id="segments"></g>
              
              <!-- Tick marks -->
              <g id="ticks"></g>
              
              <!-- Numbers -->
              <g id="numbers"></g>
              
              <!-- Title text -->
              ${title ? this.renderTitleText(title, titleFontSize, config.number_color) : ""}
              
              <!-- Center hub background -->
			  <circle cx="100" cy="100" r="12"
				fill="${rimData ? `url(#${rimData.grad})` : "#c9a961"}"
				stroke="#6d5d4b" stroke-width="1"/>
              <circle cx="100" cy="100" r="8" fill="#4a4034" opacity="0.6"/>
              
              <!-- Odometer embedded in SVG (rendered before needle) -->
              <foreignObject x="0" y="0" width="200" height="200">
                <div xmlns="http://www.w3.org/1999/xhtml" class="value-display" id="flipDisplay"></div>
              </foreignObject>
              
              <!-- Hidden ARIA live region for accessibility -->
              <foreignObject x="0" y="0" width="1" height="1" style="overflow: hidden;">
                <div xmlns="http://www.w3.org/1999/xhtml" id="ariaLive" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
              </foreignObject>
              
              <!-- High needle (rendered before main needle if enabled) -->
              ${highNeedleEnabled ? this.renderHighNeedle(highNeedleColor, highNeedleLength, animationDuration) : ""}
              
              <!-- Needle (rendered after odometer so it's on top) -->
              <g id="needle" style="transform-origin: 100px 100px; transition: transform ${animationDuration}s ease-out;">
                <!-- Needle shadow -->
                <path d="M 100 100 L 95 95 L 97 30 L 100 25 L 103 30 L 105 95 Z" 
                      fill="rgba(0,0,0,0.3)" 
                      transform="translate(2,2)"/>
                <!-- Needle body -->
                <path d="M 100 100 L 95 95 L 97 30 L 100 25 L 103 30 L 105 95 Z" 
                      fill="${config.needle_color || "#C41E3A"}" 
                      stroke="${this.darkenColor(config.needle_color || "#C41E3A", 0.2)}" 
                      stroke-width="0.5"/>
                <!-- Needle highlight -->
                <path d="M 100 100 L 98 95 L 99 30 L 100 25 L 99.5 30 Z" 
                      fill="rgba(255,255,255,0.3)"/>
              </g>
              
              <!-- Needle stoppers -->
              <g id="stoppers"></g>
              
              <!-- Center rivet (on top of needle) -->
              <circle cx="100" cy="100" r="5" class="rivet"/>
              <circle cx="100" cy="100" r="3.5" class="screw-detail"/>
              <line x1="97" y1="100" x2="103" y2="100" class="screw-detail"/>
              
              <!-- Corner rivets -->
              <!-- Top left -->
              <circle cx="20" cy="20" r="4" class="rivet"/>
              <circle cx="20" cy="20" r="2.5" class="screw-detail"/>
              <line x1="17" y1="20" x2="23" y2="20" class="screw-detail"/>
              
              <!-- Top right -->
              <circle cx="180" cy="20" r="4" class="rivet"/>
              <circle cx="180" cy="20" r="2.5" class="screw-detail"/>
              <line x1="177" y1="20" x2="183" y2="20" class="screw-detail"/>
              
              <!-- Bottom left -->
              <circle cx="20" cy="180" r="4" class="rivet"/>
              <circle cx="20" cy="180" r="2.5" class="screw-detail"/>
              <line x1="17" y1="180" x2="23" y2="180" class="screw-detail"/>
              
              <!-- Bottom right -->
              <circle cx="180" cy="180" r="4" class="rivet"/>
              <circle cx="180" cy="180" r="2.5" class="screw-detail"/>
              <line x1="177" y1="180" x2="183" y2="180" class="screw-detail"/>
              
              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(wearLevel)}
            </svg>
          </div>
        </div>
      </ha-card>
    `;
    this._attachActionListeners();
    this.drawSegments(segments, min, max);
    this.drawTicks(min, max, config);
    this.drawStoppers();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      const container = this.shadowRoot?.querySelector(".gauge-container");
      if (container) this._resizeObserver.observe(container);
    }
    requestAnimationFrame(() => this._reflowFlipDisplay());
  }
  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById("actionRoot");
    if (!root) return;
    root.removeEventListener("click", this._boundHandleClick);
    root.removeEventListener("dblclick", this._boundHandleDblClick);
    root.removeEventListener("contextmenu", this._boundHandleContextMenu);
    root.removeEventListener("keydown", this._boundHandleKeyDown);
    root.addEventListener("click", this._boundHandleClick, { passive: true });
    root.addEventListener("dblclick", this._boundHandleDblClick, {
      passive: true
    });
    root.addEventListener("contextmenu", this._boundHandleContextMenu);
    root.addEventListener("keydown", this._boundHandleKeyDown);
  }
  _handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleAction("tap");
    }
  }
  _findDirectionalPath(currentAngle, targetAngle, valueIncreasing) {
    if (currentAngle === null) return targetAngle;
    let diff = targetAngle - currentAngle;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    if (valueIncreasing !== null) {
      if (valueIncreasing && diff < 0) {
        diff += 360;
      } else if (!valueIncreasing && diff > 0) {
        diff -= 360;
      }
    }
    return currentAngle + diff;
  }
  _handleAction(kind) {
    if (!this._hass || !this.config) return;
    const entityId = this.config.entity;
    const tap = getActionConfig(this.config, "tap_action", {
      action: "more-info"
    });
    const hold = getActionConfig(this.config, "hold_action", {
      action: "more-info"
    });
    const dbl = getActionConfig(this.config, "double_tap_action", {
      action: "more-info"
    });
    const actionConfig = kind === "hold" ? hold : kind === "double_tap" ? dbl : tap;
    if (actionConfig?.action === "shake") {
      this._shakeGauge();
      return;
    }
    this._runAction(actionConfig, entityId);
  }
  _shakeGauge() {
    if (this._isShaking) return;
    if (!this._hass || !this.config) return;
    const entity = this._hass.states[this.config.entity];
    if (!entity) return;
    const value = parseFloat(entity.state);
    if (isNaN(value)) return;
    const min = this.config.min !== void 0 ? this.config.min : 0;
    const max = this.config.max !== void 0 ? this.config.max : 100;
    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));
    const deviationPercent = 0.1 + Math.random() * 0.4;
    const deviation = range * deviationPercent * (Math.random() > 0.5 ? 1 : -1);
    const targetValue = Math.max(min, Math.min(max, clampedValue + deviation));
    const valuePosition = Math.max(0, Math.min(1, (targetValue - min) / range));
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : 360 - startAngle + endAngle;
    let targetGaugeAngle = startAngle + totalAngle * valuePosition;
    while (targetGaugeAngle > 180) targetGaugeAngle -= 360;
    while (targetGaugeAngle < -180) targetGaugeAngle += 360;
    this._isShaking = true;
    this._shakeTargetAngle = targetGaugeAngle + 90;
    const needle = this.shadowRoot.getElementById("needle");
    if (!needle) return;
    const gaugeContainer = this.shadowRoot.querySelector(".gauge-container");
    if (gaugeContainer) {
      gaugeContainer.classList.add("shaking");
      setTimeout(() => {
        gaugeContainer.classList.remove("shaking");
      }, 250);
    }
    needle.style.transition = "transform 0.3s ease-out";
    needle.style.transform = `rotate(${this._shakeTargetAngle}deg)`;
    setTimeout(() => {
      if (needle) {
        needle.style.transition = "transform 3s cubic-bezier(0.4, 0.0, 0.2, 1)";
        this._isShaking = false;
        this._shakeTargetAngle = null;
        this.updateGauge();
      }
    }, 300);
  }
  _runAction(actionConfig, entityId) {
    const action = actionConfig?.action;
    if (!action || action === "none") return;
    if (action === "more-info") {
      fireEvent(this, "hass-more-info", { entityId });
      return;
    }
    if (action === "navigate") {
      const path = actionConfig.navigation_path;
      if (!path) return;
      history.pushState(null, "", path);
      fireEvent(window, "location-changed", { replace: false });
      return;
    }
    if (action === "toggle") {
      if (!entityId) return;
      this._hass.callService("homeassistant", "toggle", {
        entity_id: entityId
      });
      return;
    }
    if (action === "call-service") {
      const service = actionConfig.service;
      if (!service) return;
      const [domain, srv] = service.split(".");
      if (!domain || !srv) return;
      const data = { ...actionConfig.service_data || {} };
      if (actionConfig.target?.entity_id)
        data.entity_id = actionConfig.target.entity_id;
      this._hass.callService(domain, srv, data);
      return;
    }
  }
  renderTitleText(title, fontSize, color = "#3e2723", fontFamily = "Georgia, serif") {
    const lines = title.replace(/\\n/g, "\n").split("\n").slice(0, 3);
    const lineHeight = fontSize * 1.2;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = 75 - totalHeight / 2;
    return lines.map((line, index) => {
      const y = startY + index * lineHeight;
      return `<text x="100" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="${color}" font-family="${fontFamily}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${line}</text>`;
    }).join("\n");
  }
  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "white":
        return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "blue":
        return { grad: `blueRim-${uid}`, stroke: "#1e4f8f" };
      case "green":
        return { grad: `greenRim-${uid}`, stroke: "#1f6b3a" };
      case "red":
        return { grad: `redRim-${uid}`, stroke: "#8f1e1e" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper":
        return { grad: `copperRim-${uid}`, stroke: "#c77c43" };
      default:
        return null;
    }
  }
  renderRim(ringStyle, uid) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";
    return `
		<circle cx="100" cy="100" r="95" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="2"/>
		<circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
	  `;
  }
  renderHighNeedle(color, lengthPercent, animationDuration) {
    const baseLength = 75;
    const actualLength = baseLength * (lengthPercent / 100);
    const tipY = 100 - actualLength;
    const nearTipY = tipY + 5;
    return `
              <g id="highNeedle" style="transform-origin: 100px 100px; transition: transform ${animationDuration}s ease-out;">
                <!-- High needle shadow -->
                <path d="M 100 100 L 95 95 L 97 ${nearTipY} L 100 ${tipY} L 103 ${nearTipY} L 105 95 Z" 
                      fill="rgba(0,0,0,0.3)" 
                      transform="translate(2,2)"/>
                <!-- High needle body -->
                <path d="M 100 100 L 95 95 L 97 ${nearTipY} L 100 ${tipY} L 103 ${nearTipY} L 105 95 Z" 
                      fill="${color}" 
                      stroke="${this.darkenColor(color, 0.3)}" 
                      stroke-width="0.5"
                      opacity="1.0"/>
                <!-- High needle highlight -->
                <path d="M 100 100 L 98 95 L 99 ${nearTipY} L 100 ${tipY} L 99.5 ${nearTipY} Z" 
                      fill="rgba(255,255,255,0.3)"/>
              </g>
    `;
  }
  renderWearMarks(wearLevel) {
    if (wearLevel === 0) return "";
    const allMarks = [
      {
        type: "circle",
        cx: 45,
        cy: 60,
        r: 2,
        fill: "#8B7355",
        baseOpacity: 0.2
      },
      {
        type: "circle",
        cx: 155,
        cy: 75,
        r: 1.5,
        fill: "#8B7355",
        baseOpacity: 0.15
      },
      {
        type: "circle",
        cx: 70,
        cy: 120,
        r: 1,
        fill: "#6d5d4b",
        baseOpacity: 0.2
      },
      {
        type: "ellipse",
        cx: 130,
        cy: 50,
        rx: 3,
        ry: 1.5,
        fill: "#8B7355",
        baseOpacity: 0.1
      },
      {
        type: "circle",
        cx: 35,
        cy: 140,
        r: 1.2,
        fill: "#8B7355",
        baseOpacity: 0.12
      },
      {
        type: "circle",
        cx: 165,
        cy: 130,
        r: 1.8,
        fill: "#6d5d4b",
        baseOpacity: 0.18
      },
      {
        type: "ellipse",
        cx: 50,
        cy: 90,
        rx: 2,
        ry: 1,
        fill: "#8B7355",
        baseOpacity: 0.08
      },
      {
        type: "circle",
        cx: 120,
        cy: 145,
        r: 0.8,
        fill: "#6d5d4b",
        baseOpacity: 0.15
      },
      {
        type: "circle",
        cx: 180,
        cy: 65,
        r: 1.3,
        fill: "#8B7355",
        baseOpacity: 0.1
      },
      {
        type: "ellipse",
        cx: 25,
        cy: 100,
        rx: 2.5,
        ry: 1.2,
        fill: "#6d5d4b",
        baseOpacity: 0.09
      }
    ];
    const markCount = Math.ceil(wearLevel / 100 * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);
    return marksToShow.map((mark) => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      if (mark.type === "circle") {
        return `<circle cx="${mark.cx}" cy="${mark.cy}" r="${mark.r}" fill="${mark.fill}" opacity="${opacity}"/>`;
      } else if (mark.type === "ellipse") {
        return `<ellipse cx="${mark.cx}" cy="${mark.cy}" rx="${mark.rx}" ry="${mark.ry}" fill="${mark.fill}" opacity="${opacity}"/>`;
      }
      return "";
    }).join("\n              ");
  }
  drawSegments(segments, min, max) {
    const segmentsGroup = this.shadowRoot.getElementById("segments");
    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : 360 - startAngle + endAngle;
    segments.forEach((segment) => {
      const fromPercent = (segment.from - min) / (max - min) * 100;
      const toPercent = (segment.to - min) / (max - min) * 100;
      const segmentStartAngle = startAngle + totalAngle * fromPercent / 100;
      const segmentEndAngle = startAngle + totalAngle * toPercent / 100;
      const path = this.describeArc(
        centerX,
        centerY,
        radius,
        segmentStartAngle,
        segmentEndAngle
      );
      const pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathElement.setAttribute("d", path);
      pathElement.setAttribute("fill", "none");
      pathElement.setAttribute("stroke", segment.color);
      pathElement.setAttribute("stroke-width", "8");
      pathElement.setAttribute("opacity", "0.7");
      segmentsGroup.appendChild(pathElement);
    });
  }
  drawTicks(min, max, config) {
    const ticksGroup = this.shadowRoot.getElementById("ticks");
    const numbersGroup = this.shadowRoot.getElementById("numbers");
    const centerX = 100;
    const centerY = 100;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : 360 - startAngle + endAngle;
    const numTicks = 10;
    ticksGroup.innerHTML = "";
    numbersGroup.innerHTML = "";
    for (let i = 0; i <= numTicks; i++) {
      let angle = startAngle + totalAngle * i / numTicks;
      while (angle > 180) angle -= 360;
      while (angle < -180) angle += 360;
      const angleRad = angle * Math.PI / 180;
      const innerRadius = 77;
      const outerRadius = 85;
      const x1 = centerX + innerRadius * Math.cos(angleRad);
      const y1 = centerY + innerRadius * Math.sin(angleRad);
      const x2 = centerX + outerRadius * Math.cos(angleRad);
      const y2 = centerY + outerRadius * Math.sin(angleRad);
      const tick = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      tick.setAttribute("x1", x1);
      tick.setAttribute("y1", y1);
      tick.setAttribute("x2", x2);
      tick.setAttribute("y2", y2);
      tick.setAttribute("stroke", config.primary_tick_color || "#3e2723");
      tick.setAttribute("stroke-width", "2");
      ticksGroup.appendChild(tick);
      const value = min + (max - min) * i / numTicks;
      const textRadius = 65;
      const textX = centerX + textRadius * Math.cos(angleRad);
      const textY = centerY + textRadius * Math.sin(angleRad);
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", textX);
      text.setAttribute("y", textY);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "9");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("fill", config.number_color || "#3e2723");
      text.setAttribute("font-family", "Georgia, serif");
      const displayValue = max - min <= 10 ? value.toFixed(1) : Math.round(value);
      text.textContent = displayValue;
      numbersGroup.appendChild(text);
      if (i < numTicks) {
        for (let j = 1; j < 5; j++) {
          const minorAngle = angle + totalAngle / numTicks * (j / 5);
          const minorAngleRad = minorAngle * Math.PI / 180;
          const mx1 = centerX + 80 * Math.cos(minorAngleRad);
          const my1 = centerY + 80 * Math.sin(minorAngleRad);
          const mx2 = centerX + 85 * Math.cos(minorAngleRad);
          const my2 = centerY + 85 * Math.sin(minorAngleRad);
          const minorTick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          minorTick.setAttribute("x1", mx1);
          minorTick.setAttribute("y1", my1);
          minorTick.setAttribute("x2", mx2);
          minorTick.setAttribute("y2", my2);
          minorTick.setAttribute(
            "stroke",
            config.secondary_tick_color || "#5d4e37"
          );
          minorTick.setAttribute("stroke-width", "1");
          ticksGroup.appendChild(minorTick);
        }
      }
    }
  }
  drawStoppers() {
    const stoppersGroup = this.shadowRoot.getElementById("stoppers");
    if (!stoppersGroup) return;
    const centerX = 100;
    const centerY = 100;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const startAngleRad = startAngle * Math.PI / 180;
    const startX = centerX + 75 * Math.cos(startAngleRad);
    const startY = centerY + 75 * Math.sin(startAngleRad);
    const startStopper = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    startStopper.setAttribute("cx", startX);
    startStopper.setAttribute("cy", startY);
    startStopper.setAttribute("r", "3");
    startStopper.setAttribute("fill", "#8B0000");
    startStopper.setAttribute("stroke", "#4a4034");
    startStopper.setAttribute("stroke-width", "0.5");
    stoppersGroup.appendChild(startStopper);
    const endAngleRad = endAngle * Math.PI / 180;
    const endX = centerX + 75 * Math.cos(endAngleRad);
    const endY = centerY + 75 * Math.sin(endAngleRad);
    const endStopper = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    endStopper.setAttribute("cx", endX);
    endStopper.setAttribute("cy", endY);
    endStopper.setAttribute("r", "3");
    endStopper.setAttribute("fill", "#8B0000");
    endStopper.setAttribute("stroke", "#4a4034");
    endStopper.setAttribute("stroke-width", "0.5");
    stoppersGroup.appendChild(endStopper);
  }
  describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y
    ].join(" ");
  }
  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = angleInDegrees * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }
  darkenColor(color, amount) {
    if (Array.isArray(color) && color.length === 3) {
      const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
      color = `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
    }
    if (typeof color !== "string" || color.trim() === "") {
      color = "#000000";
    }
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }
  updateGauge() {
    if (!this._hass || !this.config) return;
    const entity = this._hass.states[this.config.entity];
    if (!entity) {
      this._handleEntityError("Entity not found");
      return;
    }
    if (entity.state === "unavailable" || entity.state === "unknown") {
      this._handleEntityError(`Entity is ${entity.state}`);
      return;
    }
    let value;
    try {
      value = parseFloat(entity.state);
      if (isNaN(value)) {
        this._handleEntityError(`Non-numeric state: "${entity.state}"`);
        return;
      }
      this._clearEntityError();
    } catch (error) {
      this._handleEntityError(`Error parsing state: ${error.message}`);
      return;
    }
    const min = this.config.min !== void 0 ? this.config.min : 0;
    const max = this.config.max !== void 0 ? this.config.max : 100;
    const highNeedleEnabled = this.config.high_needle_enabled !== void 0 ? this.config.high_needle_enabled : false;
    const highNeedleDuration = this.config.high_needle_duration !== void 0 ? this.config.high_needle_duration : 60;
    this.updateFlipDisplay(value);
    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));
    const valuePosition = Math.max(
      0,
      Math.min(1, (clampedValue - min) / range)
    );
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : 360 - startAngle + endAngle;
    let gaugeAngle = startAngle + totalAngle * valuePosition;
    while (gaugeAngle > 180) gaugeAngle -= 360;
    while (gaugeAngle < -180) gaugeAngle += 360;
    if (endAngle >= startAngle) {
      gaugeAngle = Math.max(startAngle, Math.min(endAngle, gaugeAngle));
    } else {
      let normStart = startAngle;
      let normEnd = endAngle;
      while (normStart > 180) normStart -= 360;
      while (normStart < -180) normStart += 360;
      while (normEnd > 180) normEnd -= 360;
      while (normEnd < -180) normEnd += 360;
      const inDeadZone = normEnd < normStart ? gaugeAngle > normEnd && gaugeAngle < normStart : gaugeAngle > normEnd || gaugeAngle < normStart;
      if (inDeadZone) {
        const distToStart = Math.min(
          Math.abs(gaugeAngle - normStart),
          Math.abs(gaugeAngle - normStart + 360),
          Math.abs(gaugeAngle - normStart - 360)
        );
        const distToEnd = Math.min(
          Math.abs(gaugeAngle - normEnd),
          Math.abs(gaugeAngle - normEnd + 360),
          Math.abs(gaugeAngle - normEnd - 360)
        );
        gaugeAngle = distToStart < distToEnd ? normStart : normEnd;
      }
    }
    let needleAngle = gaugeAngle + 90;
    const needle = this.shadowRoot.getElementById("needle");
    if (needle && !this._isShaking) {
      let valueIncreasing = null;
      if (this._previousValue !== null) {
        valueIncreasing = clampedValue > this._previousValue;
      }
      needleAngle = this._findDirectionalPath(
        this._previousNeedleAngle,
        needleAngle,
        valueIncreasing
      );
      needle.style.transform = `rotate(${needleAngle}deg)`;
      this._previousNeedleAngle = needleAngle;
      this._previousValue = clampedValue;
      this._updateAriaLive(value);
    }
    if (highNeedleEnabled) {
      const highNeedle = this.shadowRoot.getElementById("highNeedle");
      if (highNeedle) {
        if (this._highNeedleValue === null) {
          this._highNeedleValue = clampedValue;
        }
        if (clampedValue >= this._highNeedleValue) {
          this._highNeedleValue = clampedValue;
          if (this._highNeedleTimeout) {
            clearTimeout(this._highNeedleTimeout);
            this._highNeedleTimeout = null;
          }
        } else {
          if (!this._highNeedleTimeout) {
            this._highNeedleTimeout = setTimeout(() => {
              this._highNeedleValue = clampedValue;
              this._highNeedleTimeout = null;
              this.updateGauge();
            }, highNeedleDuration * 1e3);
          }
        }
        const highValuePosition = Math.max(
          0,
          Math.min(1, (this._highNeedleValue - min) / range)
        );
        let highGaugeAngle = startAngle + totalAngle * highValuePosition;
        while (highGaugeAngle > 180) highGaugeAngle -= 360;
        while (highGaugeAngle < -180) highGaugeAngle += 360;
        if (endAngle >= startAngle) {
          highGaugeAngle = Math.max(
            startAngle,
            Math.min(endAngle, highGaugeAngle)
          );
        } else {
          let normStart = startAngle;
          let normEnd = endAngle;
          while (normStart > 180) normStart -= 360;
          while (normStart < -180) normStart += 360;
          while (normEnd > 180) normEnd -= 360;
          while (normEnd < -180) normEnd += 360;
          const inDeadZone = normEnd < normStart ? highGaugeAngle > normEnd && highGaugeAngle < normStart : highGaugeAngle > normEnd || highGaugeAngle < normStart;
          if (inDeadZone) {
            const distToStart = Math.min(
              Math.abs(highGaugeAngle - normStart),
              Math.abs(highGaugeAngle - normStart + 360),
              Math.abs(highGaugeAngle - normStart - 360)
            );
            const distToEnd = Math.min(
              Math.abs(highGaugeAngle - normEnd),
              Math.abs(highGaugeAngle - normEnd + 360),
              Math.abs(highGaugeAngle - normEnd - 360)
            );
            highGaugeAngle = distToStart < distToEnd ? normStart : normEnd;
          }
        }
        let highNeedleAngle = highGaugeAngle + 90;
        let highValueIncreasing = null;
        if (this._previousHighNeedleAngle !== null) {
          highValueIncreasing = this._highNeedleValue >= (this._previousHighValue || this._highNeedleValue);
        }
        highNeedleAngle = this._findDirectionalPath(
          this._previousHighNeedleAngle,
          highNeedleAngle,
          highValueIncreasing
        );
        highNeedle.style.transform = `rotate(${highNeedleAngle}deg)`;
        this._previousHighNeedleAngle = highNeedleAngle;
        this._previousHighValue = this._highNeedleValue;
      }
    }
  }
  _handleEntityError(message) {
    if (this._entityError !== message) {
      console.warn(`Foundry Gauge Card [${this.config.entity}]: ${message}`);
      this._entityError = message;
      const flipDisplay = this.shadowRoot?.getElementById("flipDisplay");
      if (flipDisplay) {
        this._showErrorDisplay();
      }
    }
  }
  _clearEntityError() {
    this._entityError = null;
  }
  _showErrorDisplay() {
    const flipDisplay = this.shadowRoot?.getElementById("flipDisplay");
    if (!flipDisplay) return;
    const digitsRow = flipDisplay.querySelector(".digits-row");
    if (digitsRow) {
      digitsRow.innerHTML = '<div class="flip-digit"><div class="digit-item">-</div></div><div class="flip-digit"><div class="digit-item">-</div></div><div class="flip-digit"><div class="digit-item">-</div></div>';
    }
  }
  _updateAriaLive(value) {
    const ariaLive = this.shadowRoot?.getElementById("ariaLive");
    if (ariaLive) {
      const decimals = this.config.decimals !== void 0 ? this.config.decimals : 0;
      const unit = this.config.unit || "";
      const title = this.config.title || "Gauge";
      ariaLive.textContent = `${title}: ${value.toFixed(decimals)} ${unit}`;
    }
  }
  _formatValueWithPadding(value, decimals) {
    const min = this.config.min !== void 0 ? this.config.min : 0;
    const max = this.config.max !== void 0 ? this.config.max : 100;
    const maxAbsValue = Math.max(
      Math.abs(Math.floor(min)),
      Math.abs(Math.floor(max))
    );
    const maxIntegerDigits = maxAbsValue.toString().length;
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const integerPart = Math.floor(absoluteValue);
    const decimalPart = (absoluteValue - integerPart).toFixed(decimals).substring(2);
    const paddedInteger = integerPart.toString().padStart(maxIntegerDigits, "0");
    let result = isNegative ? "-" : "";
    result += paddedInteger;
    if (decimals > 0) {
      result += "." + decimalPart;
    }
    return result;
  }
  updateFlipDisplay(value) {
    const flipDisplay = this.shadowRoot.getElementById("flipDisplay");
    if (!flipDisplay) return;
    const decimals = this.config.decimals !== void 0 ? this.config.decimals : 0;
    const unit = this.config.unit || "";
    let displayText = isNaN(value) ? "--" : this._formatValueWithPadding(value, decimals);
    const oldText = flipDisplay.dataset.value || "";
    if (displayText === oldText) return;
    const isFirstUpdate = !flipDisplay.dataset.numericValue;
    const prevValue = flipDisplay.dataset.numericValue ? parseFloat(flipDisplay.dataset.numericValue) : value;
    flipDisplay.dataset.numericValue = value;
    flipDisplay.dataset.value = displayText;
    if (isFirstUpdate) {
      this.renderRotaryDisplay(
        flipDisplay,
        this._formatValueWithPadding(value, decimals),
        unit,
        null
      );
    } else {
      this.animateOdometer(flipDisplay, prevValue, value, decimals, unit);
    }
  }
  animateOdometer(flipDisplay, fromValue, toValue, decimals, unit) {
    if (this._odometerAnimation) {
      clearInterval(this._odometerAnimation);
    }
    const diff = Math.abs(toValue - fromValue);
    const steps = Math.min(Math.ceil(diff), 20);
    if (steps <= 1 || diff === 0) {
      this.renderRotaryDisplay(
        flipDisplay,
        this._formatValueWithPadding(toValue, decimals),
        unit,
        null
      );
      return;
    }
    const increment = (toValue - fromValue) / steps;
    const duration = this._animationDuration || 1.2;
    const stepDuration = duration * 1e3 / steps;
    let currentStep = 0;
    let currentValue = fromValue;
    this._odometerAnimation = setInterval(() => {
      currentStep++;
      currentValue += increment;
      if (currentStep >= steps) {
        clearInterval(this._odometerAnimation);
        this._odometerAnimation = null;
        currentValue = toValue;
      }
      this.renderRotaryDisplay(
        flipDisplay,
        this._formatValueWithPadding(currentValue, decimals),
        unit,
        stepDuration
        // Use calculated step duration for smooth animation
      );
    }, stepDuration);
  }
  renderRotaryDisplay(flipDisplay, displayText, unit, transitionDuration = null) {
    const isNegative = displayText.startsWith("-");
    const absDisplayText = isNegative ? displayText.substring(1) : displayText;
    const chars = absDisplayText.split("");
    const allowNegative = this.config && this.config.min < 0;
    let digitsRow = flipDisplay.querySelector(".digits-row");
    if (!digitsRow) {
      flipDisplay.innerHTML = "";
      digitsRow = document.createElement("div");
      digitsRow.className = "digits-row";
      flipDisplay.appendChild(digitsRow);
    }
    const digitCount = chars.filter((c) => c !== ".").length;
    const expectedLength = (allowNegative ? 1 : 0) + digitCount;
    let existingDigits = Array.from(digitsRow.children);
    if (existingDigits.length !== expectedLength) {
      digitsRow.innerHTML = "";
      existingDigits = [];
    }
    let digitIndex = 0;
    let afterDecimal = false;
    if (allowNegative) {
      let signEl = existingDigits[digitIndex];
      if (!signEl || !signEl.classList.contains("minus-sign")) {
        signEl = document.createElement("div");
        signEl.className = "flip-digit minus-sign";
        const inner2 = document.createElement("div");
        inner2.className = "flip-digit-inner";
        const signs = ["-", "+"];
        signs.forEach((s) => {
          const item = document.createElement("div");
          item.className = "digit-item";
          item.textContent = s;
          inner2.appendChild(item);
        });
        signEl.appendChild(inner2);
        digitsRow.appendChild(signEl);
      }
      const inner = signEl.querySelector(".flip-digit-inner");
      if (inner) {
        const targetPosition = isNegative ? 0 : 1;
        const isInitialSetup = !signEl.dataset.position;
        if (isInitialSetup) {
          signEl.dataset.position = targetPosition.toString();
          inner.style.transition = "none";
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              inner.offsetHeight;
              const offset = -targetPosition * 100;
              inner.style.transform = `translateY(${offset}%)`;
              requestAnimationFrame(() => {
                inner.style.transition = "";
              });
            });
          });
        } else {
          signEl.dataset.position = targetPosition.toString();
          const offset = -targetPosition * 100;
          inner.style.transform = `translateY(${offset}%)`;
        }
      }
      digitIndex++;
    }
    chars.forEach((char, _charIndex) => {
      if (char === ".") {
        afterDecimal = true;
      } else {
        let digitEl = existingDigits[digitIndex];
        if (!digitEl || digitEl.classList.contains("decimal") || digitEl.classList.contains("minus-sign")) {
          const newDigitEl = document.createElement("div");
          newDigitEl.className = afterDecimal ? "flip-digit fractional" : "flip-digit";
          const inner2 = document.createElement("div");
          inner2.className = "flip-digit-inner";
          const baseDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
          baseDigits.forEach((d) => {
            const item = document.createElement("div");
            item.className = "digit-item";
            item.textContent = d;
            inner2.appendChild(item);
          });
          newDigitEl.appendChild(inner2);
          if (digitEl) {
            digitsRow.replaceChild(newDigitEl, digitEl);
          } else {
            digitsRow.appendChild(newDigitEl);
          }
          digitEl = newDigitEl;
        } else if (afterDecimal && !digitEl.classList.contains("fractional") || !afterDecimal && digitEl.classList.contains("fractional")) {
          digitEl.className = afterDecimal ? "flip-digit fractional" : "flip-digit";
        }
        const inner = digitEl.querySelector(".flip-digit-inner");
        if (inner) {
          const targetDigit = parseInt(char);
          const isInitialSetup = !digitEl.dataset.position;
          if (isInitialSetup) {
            digitEl.dataset.position = targetDigit.toString();
            inner.style.transition = "none";
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                inner.offsetHeight;
                const offset = -targetDigit * 100;
                inner.style.transform = `translateY(${offset}%)`;
                requestAnimationFrame(() => {
                  inner.style.transition = "";
                });
              });
            });
          } else {
            digitEl.dataset.position = targetDigit.toString();
            const offset = -targetDigit * 100;
            if (transitionDuration && transitionDuration > 0) {
              inner.style.transition = `transform ${transitionDuration}ms linear`;
              inner.style.transform = `translateY(${offset}%)`;
            } else {
              inner.style.transition = "none";
              inner.style.transform = `translateY(${offset}%)`;
            }
            if (inner._transitionHandler) {
              inner.removeEventListener(
                "transitionend",
                inner._transitionHandler
              );
              inner._transitionHandler = null;
            }
          }
        }
        digitIndex++;
      }
    });
    const existingUnit = flipDisplay.querySelector(".flip-digit.unit");
    if (unit) {
      if (!existingUnit) {
        const unitSpan = document.createElement("div");
        unitSpan.className = "flip-digit unit";
        unitSpan.textContent = unit;
        flipDisplay.appendChild(unitSpan);
      } else {
        existingUnit.textContent = unit;
      }
    } else if (existingUnit) {
      existingUnit.remove();
    }
  }
  getCardSize() {
    return 4;
  }
  static get supportsCardResize() {
    return true;
  }
  static getConfigElement() {
    return document.createElement("foundry-gauge-card-editor");
  }
  static getStubConfig() {
    return {
      entity: "sensor.temperature",
      title: "Gauge",
      title_font_size: 12,
      odometer_font_size: 60,
      odometer_vertical_position: 120,
      ring_style: "brass",
      rivet_color: "#6a5816",
      plate_color: "#8c7626",
      plate_transparent: false,
      min: 0,
      max: 100,
      unit: "",
      decimals: 0,
      start_angle: 200,
      end_angle: 160,
      animation_duration: 1.2,
      high_needle_enabled: false,
      high_needle_color: "#FF9800",
      high_needle_duration: 60,
      high_needle_length: 75,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "everywhere",
      aged_texture_intensity: 50,
      segments: [
        { from: 0, to: 33, color: "#4CAF50" },
        { from: 33, to: 66, color: "#FFC107" },
        { from: 66, to: 100, color: "#F44336" }
      ],
      background_style: "gradient",
      face_color: "#f8f8f0",
      title_font_color: "#3e2723",
      number_color: "#3e2723",
      primary_tick_color: "#3e2723",
      secondary_tick_color: "#5d4e37",
      needle_color: "#C41E3A"
    };
  }
};
if (!customElements.get("foundry-gauge-card")) {
  customElements.define("foundry-gauge-card", FoundryGaugeCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-gauge-card",
  name: "Foundry Gauge Card",
  preview: true,
  description: "A vintage industrial style gauge card",
  documentationURL: "https://github.com/dprischak/Foundry-Card"
});

// src/cards/foundry-gauge-editor.js
var FoundryGaugeCardEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = {
      ...config,
      segments: Array.isArray(config.segments) ? config.segments : []
    };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._form1 = null;
      this._form2 = null;
      if (!this._advancedMode) {
        this.render();
      }
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      const style = document.createElement("style");
      style.textContent = `
        /* Layout adjustments */
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        /* Segment Section Styling */
        .segments-section {
          margin-top: 8px;
          margin-bottom: 8px;
          padding: 16px;
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
        }
        .section-header {
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--primary-text-color);
          font-size: 16px;
        }
        .segment-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          margin-bottom: 12px;
          background: var(--secondary-background-color, #f9f9f9);
          padding: 10px;
          border-radius: 4px;
        }
        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .input-group label {
          font-size: 11px;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          font-weight: 600;
        }
        .input-group input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
        }
        .input-group input[type="color"] {
          height: 36px;
          padding: 2px;
          cursor: pointer;
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--error-color, #db4437);
          cursor: pointer;
          padding: 8px;
          height: 36px;
          display: flex;
          align-items: center;
        }
        .remove-btn:hover {
          background: rgba(219, 68, 55, 0.1);
          border-radius: 50%;
        }
        .add-btn {
          background-color: var(--primary-color, #03a9f4);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 4px;
        }
        .add-btn:hover {
          background-color: var(--primary-color-dark, #0288d1);
        }
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
        .validation-warning {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .validation-error {
          background: var(--error-color, #db4437);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
      this._form1 = document.createElement("ha-form");
      this._form1.addEventListener(
        "value-changed",
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form1);
      this._segmentsContainer = document.createElement("div");
      this._segmentsContainer.className = "segments-section";
      this._root.appendChild(this._segmentsContainer);
      this._form2 = document.createElement("ha-form");
      this._form2.addEventListener(
        "value-changed",
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form2);
      this._validationContainer = document.createElement("div");
      this._root.appendChild(this._validationContainer);
      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-btn";
      resetBtn.textContent = "\u26A0\uFE0F Reset to Default Configuration";
      resetBtn.title = "Reset all settings to defaults (keeps entity)";
      resetBtn.addEventListener("click", () => this._resetToDefaults());
      this._root.appendChild(resetBtn);
    }
    if (this._form1) this._form1.hass = this._hass;
    if (this._form2) this._form2.hass = this._hass;
    const formData = this._configToForm(this._config);
    this._form1.schema = this._getSchemaTop(formData);
    this._form1.data = formData;
    this._form1.computeLabel = this._computeLabel;
    this._form2.schema = this._getSchemaBottom(formData);
    this._form2.data = formData;
    this._form2.computeLabel = this._computeLabel;
    this._renderSegments();
    this._displayValidationMessages();
  }
  _displayValidationMessages() {
    if (!this._validationContainer) return;
    const messages = [];
    const config = this._config;
    const min = config.min !== void 0 ? config.min : 0;
    const max = config.max !== void 0 ? config.max : 100;
    if (min >= max) {
      messages.push({
        type: "error",
        text: "\u26A0\uFE0F Minimum value must be less than maximum value"
      });
    }
    const segments = config.segments || [];
    if (segments.length > 0) {
      segments.forEach((seg, idx) => {
        if (seg.from >= seg.to) {
          messages.push({
            type: "warning",
            text: `\u26A0\uFE0F Segment ${idx + 1}: "From" should be less than "To"`
          });
        }
        if (seg.from < min || seg.to > max) {
          messages.push({
            type: "warning",
            text: `\u26A0\uFE0F Segment ${idx + 1}: Range should be within min/max values`
          });
        }
      });
    }
    if (config.decimals !== void 0 && (config.decimals < 0 || config.decimals > 10)) {
      messages.push({
        type: "warning",
        text: "\u26A0\uFE0F Decimals should be between 0 and 10"
      });
    }
    if (messages.length > 0) {
      this._validationContainer.innerHTML = messages.map((msg) => `<div class="validation-${msg.type}">${msg.text}</div>`).join("");
    } else {
      this._validationContainer.innerHTML = "";
    }
  }
  _resetToDefaults() {
    if (!confirm(
      "Reset all settings to defaults? This will keep your entity but reset all other configuration."
    )) {
      return;
    }
    const entity = this._config.entity;
    this._updateConfig({
      entity,
      title: "",
      min: 0,
      max: 100,
      unit: "",
      decimals: 0,
      segments: [
        { from: 0, to: 33, color: "#4CAF50" },
        { from: 33, to: 66, color: "#FFC107" },
        { from: 66, to: 100, color: "#F44336" }
      ],
      start_angle: 200,
      end_angle: 160,
      animation_duration: 1.2,
      title_font_size: 12,
      odometer_font_size: 60,
      odometer_vertical_position: 120,
      ring_style: "brass",
      rivet_color: "#6d5d4b",
      plate_color: "#8c7626",
      plate_transparent: false,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "glass_only",
      aged_texture_intensity: 50,
      high_needle_enabled: false,
      high_needle_color: "#FF9800",
      high_needle_duration: 60,
      high_needle_length: 100,
      tap_action: { action: "more-info" },
      hold_action: { action: "more-info" },
      double_tap_action: { action: "more-info" }
    });
  }
  // --- Segments Renderer (innerHTML) ---
  _renderSegments() {
    if (!this._segmentsContainer) return;
    const segments = this._config.segments || [];
    let html = `<div class="section-header">Color Ranges</div>`;
    if (segments.length === 0) {
      html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>`;
    }
    segments.forEach((seg, index) => {
      const fromVal = seg.from !== void 0 ? seg.from : 0;
      const toVal = seg.to !== void 0 ? seg.to : 0;
      const colVal = seg.color || "#000000";
      html += `
        <div class="segment-row">
          <div class="input-group">
            <label>From</label>
            <input type="number" class="seg-input" data-idx="${index}" data-key="from" value="${fromVal}">
          </div>
          <div class="input-group">
            <label>To</label>
            <input type="number" class="seg-input" data-idx="${index}" data-key="to" value="${toVal}">
          </div>
          <div class="input-group">
            <label>Color</label>
            <input type="color" class="seg-input" data-idx="${index}" data-key="color" value="${colVal}">
          </div>
          <button class="remove-btn" data-idx="${index}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `;
    });
    html += `<button id="add-btn" class="add-btn">+ Add Color Range</button>`;
    this._segmentsContainer.innerHTML = html;
    this._segmentsContainer.querySelectorAll(".seg-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const key = e.target.dataset.key;
        let val = e.target.value;
        if (key !== "color") val = Number(val);
        this._updateSegment(idx, key, val);
      });
    });
    this._segmentsContainer.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target.closest(".remove-btn");
        if (target) {
          this._removeSegment(parseInt(target.dataset.idx));
        }
      });
    });
    const addBtn = this._segmentsContainer.querySelector("#add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this._addSegment());
    }
  }
  // --- Data Logic for Segments ---
  _updateSegment(index, key, value) {
    const segments = [...this._config.segments || []];
    if (segments[index]) {
      segments[index] = { ...segments[index], [key]: value };
      this._updateConfig({ segments });
    }
  }
  _addSegment() {
    const segments = [...this._config.segments || []];
    const last = segments[segments.length - 1];
    const from = last ? last.to : 0;
    const to = from + 10;
    segments.push({ from, to, color: "#4CAF50" });
    this._updateConfig({ segments });
  }
  _removeSegment(index) {
    const segments = [...this._config.segments || []];
    segments.splice(index, 1);
    this._updateConfig({ segments });
  }
  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }
  // --- HA Form Logic ---
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "ring_style",
        "title_color",
        "font_color",
        "font_bg_color",
        "number_color",
        "primary_tick_color",
        "secondary_tick_color",
        "background_style",
        "face_color",
        "liquid_color",
        "needle_color",
        "plate_transparent",
        "glass_effect_enabled",
        "wear_level",
        "aged_texture",
        "aged_texture_intensity",
        "slider_color",
        "knob_color",
        "tick_color"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }
  _configToForm(config) {
    const data = { ...config };
    data.appearance = {
      theme: config.theme ?? "none",
      ring_style: config.ring_style,
      rivet_color: this._hexToRgb(config.rivet_color ?? "#6a5816") ?? [
        106,
        88,
        22
      ],
      plate_color: this._hexToRgb(config.plate_color ?? "#8c7626") ?? [
        140,
        118,
        38
      ],
      plate_transparent: config.plate_transparent,
      wear_level: config.wear_level,
      glass_effect_enabled: config.glass_effect_enabled,
      aged_texture: config.aged_texture,
      aged_texture_intensity: config.aged_texture_intensity,
      background_style: config.background_style,
      face_color: this._hexToRgb(config.face_color ?? "#f8f8f0") ?? [
        248,
        248,
        240
      ],
      needle_color: this._hexToRgb(config.needle_color ?? "#C41E3A") ?? [
        196,
        30,
        58
      ]
    };
    data.style_fonts_ticks = {
      title_color: this._hexToRgb(
        config.title_color || config.title_font_color || "#3e2723"
      ) ?? [62, 39, 35],
      number_color: this._hexToRgb(config.number_color ?? "#3e2723") ?? [
        62,
        39,
        35
      ],
      primary_tick_color: this._hexToRgb(
        config.primary_tick_color ?? "#3e2723"
      ) ?? [62, 39, 35],
      secondary_tick_color: this._hexToRgb(
        config.secondary_tick_color ?? "#5d4e37"
      ) ?? [93, 78, 55]
    };
    data.layout = {
      title_font_size: config.title_font_size,
      odometer_font_size: config.odometer_font_size,
      odometer_vertical_position: config.odometer_vertical_position,
      start_angle: config.start_angle,
      end_angle: config.end_angle,
      animation_duration: config.animation_duration
    };
    data.high_needle = {
      high_needle_enabled: config.high_needle_enabled,
      high_needle_color: this._hexToRgb(
        config.high_needle_color ?? "#FF9800"
      ) ?? [255, 152, 0],
      high_needle_duration: config.high_needle_duration,
      high_needle_length: config.high_needle_length
    };
    data.actions = {};
    ["tap", "hold", "double_tap"].forEach((type2) => {
      const conf = config[`${type2}_action`] || {};
      data.actions[`${type2}_action_action`] = conf.action || "more-info";
      data.actions[`${type2}_action_navigation_path`] = conf.navigation_path || "";
      data.actions[`${type2}_action_service`] = conf.service || "";
      data.actions[`${type2}_action_target_entity`] = conf.target?.entity_id || "";
    });
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config };
    const defaults = {
      rivet_color: this._config?.rivet_color ?? "#6d5d4b",
      plate_color: this._config?.plate_color ?? "#8c7626",
      high_needle_color: this._config?.high_needle_color ?? "#FF9800",
      face_color: this._config?.face_color ?? "#f8f8f0",
      title_color: this._config?.title_color ?? this._config?.title_font_color ?? "#3e2723",
      number_color: this._config?.number_color ?? "#3e2723",
      primary_tick_color: this._config?.primary_tick_color ?? "#3e2723",
      secondary_tick_color: this._config?.secondary_tick_color ?? "#5d4e37",
      needle_color: this._config?.needle_color ?? "#C41E3A",
      background_style: this._config?.background_style ?? "gradient"
    };
    Object.keys(formData).forEach((key) => {
      if ([
        "appearance",
        "layout",
        "high_needle",
        "style_fonts_ticks",
        "actions"
      ].includes(key))
        return;
      config[key] = formData[key];
    });
    if (formData.appearance) Object.assign(config, formData.appearance);
    if (formData.layout) Object.assign(config, formData.layout);
    if (formData.high_needle) Object.assign(config, formData.high_needle);
    if (formData.style_fonts_ticks)
      Object.assign(config, formData.style_fonts_ticks);
    const rc = this._rgbToHex(config.rivet_color);
    if (rc) config.rivet_color = rc;
    else config.rivet_color = defaults.rivet_color;
    const pc = this._rgbToHex(config.plate_color);
    if (pc) config.plate_color = pc;
    else config.plate_color = defaults.plate_color;
    const hn = this._rgbToHex(config.high_needle_color);
    if (hn) config.high_needle_color = hn;
    else config.high_needle_color = defaults.high_needle_color;
    const fc = this._rgbToHex(config.face_color);
    if (fc) config.face_color = fc;
    else config.face_color = defaults.face_color;
    const tfc = this._rgbToHex(config.title_color);
    if (tfc) config.title_color = tfc;
    else config.title_color = defaults.title_color;
    const nc = this._rgbToHex(config.number_color);
    if (nc) config.number_color = nc;
    else config.number_color = defaults.number_color;
    const ptc = this._rgbToHex(config.primary_tick_color);
    if (ptc) config.primary_tick_color = ptc;
    else config.primary_tick_color = defaults.primary_tick_color;
    const stc = this._rgbToHex(config.secondary_tick_color);
    if (stc) config.secondary_tick_color = stc;
    else config.secondary_tick_color = defaults.secondary_tick_color;
    const ndlz = this._rgbToHex(config.needle_color);
    if (ndlz) config.needle_color = ndlz;
    else config.needle_color = defaults.needle_color;
    if (formData.actions) {
      ["tap", "hold", "double_tap"].forEach((type2) => {
        const group = formData.actions;
        const actionType = group[`${type2}_action_action`];
        const newAction = { action: actionType };
        if (actionType === "navigate") {
          newAction.navigation_path = group[`${type2}_action_navigation_path`];
        } else if (actionType === "call-service") {
          newAction.service = group[`${type2}_action_service`];
          const targetEnt = group[`${type2}_action_target_entity`];
          if (targetEnt) newAction.target = { entity_id: targetEnt };
        }
        config[`${type2}_action`] = newAction;
      });
    }
    return config;
  }
  _computeLabel(schema2) {
    if (schema2.label) return schema2.label;
    if (schema2.name === "entity") return "Entity";
    return schema2.name.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  // --- Schemas ---
  // Schema 1: Top section (Entity, Title, Min/Max)
  _getSchemaTop(_formData) {
    return [
      {
        name: "entity",
        selector: { entity: { domain: "sensor" } }
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "title", selector: { text: {} } },
          { name: "unit", selector: { text: {} } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          {
            name: "decimals",
            selector: { number: { min: 0, max: 5, mode: "box" } }
          }
        ]
      }
    ];
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map(
      (n) => Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  // Schema 2: Bottom section (Appearance, Layout, Actions)
  _getSchemaBottom(formData) {
    const actionData = formData.actions || {};
    return [
      // Appearance
      {
        name: "appearance",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          },
          {
            name: "wear_level",
            label: "Wear Level",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "glass_effect_enabled",
            label: "Glass Effect",
            selector: { boolean: {} }
          },
          {
            name: "aged_texture",
            label: "Aged Texture",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          {
            name: "aged_texture_intensity",
            label: "Texture Intensity",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "background_style",
            label: "Background Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "gradient", label: "Default Gradient" },
                  { value: "solid", label: "Solid Color" }
                ]
              }
            }
          },
          {
            name: "face_color",
            label: "Face Color (Solid Mode)",
            selector: { color_rgb: {} }
          },
          {
            name: "needle_color",
            label: "Needle Color",
            selector: { color_rgb: {} }
          }
        ]
      },
      {
        name: "style_fonts_ticks",
        type: "expandable",
        title: "Fonts & Ticks",
        schema: [
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "title_color",
                label: "Title Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "number_color",
                label: "Number Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "primary_tick_color",
                label: "Primary Tick Color",
                selector: { color_rgb: {} }
              },
              {
                name: "secondary_tick_color",
                label: "Secondary Tick Color",
                selector: { color_rgb: {} }
              }
            ]
          }
        ]
      },
      // Layout
      {
        name: "layout",
        type: "expandable",
        title: "Layout & Text",
        schema: [
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "title_font_size",
                label: "Title Font Size",
                selector: { number: { mode: "box" } }
              },
              {
                name: "odometer_font_size",
                label: "Odometer Size",
                selector: { number: { mode: "box" } }
              }
            ]
          },
          {
            name: "odometer_vertical_position",
            label: "Odometer Position Y",
            selector: { number: { mode: "box" } }
          },
          {
            name: "start_angle",
            label: "Start Angle",
            selector: { number: { min: 0, max: 360, mode: "slider" } }
          },
          {
            name: "end_angle",
            label: "End Angle",
            selector: { number: { min: 0, max: 360, mode: "slider" } }
          },
          {
            name: "animation_duration",
            label: "Animation Duration (s)",
            selector: { number: { mode: "box", step: 0.1, min: 0.1 } }
          }
        ]
      },
      // High Needle
      {
        name: "high_needle",
        type: "expandable",
        title: "High Value Needle",
        schema: [
          {
            name: "high_needle_enabled",
            label: "Enable High Needle",
            selector: { boolean: {} }
          },
          {
            name: "high_needle_color",
            label: "Needle Color",
            selector: { color_rgb: {} }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "high_needle_duration",
                label: "Hold Duration (s)",
                selector: { number: { mode: "box" } }
              },
              {
                name: "high_needle_length",
                label: "Length (%)",
                selector: { number: { mode: "box" } }
              }
            ]
          }
        ]
      },
      // Actions
      {
        name: "actions",
        type: "expandable",
        title: "Actions",
        schema: [
          ...this._getActionSchema("tap", "Tap", actionData),
          ...this._getActionSchema("hold", "Hold", actionData),
          ...this._getActionSchema("double_tap", "Double Tap", actionData)
        ]
      }
    ];
  }
  _getActionSchema(type2, label, actionData) {
    const actionKey = `${type2}_action_action`;
    const currentAction = actionData ? actionData[actionKey] : "more-info";
    const schema2 = [
      {
        name: actionKey,
        label: `${label} Action`,
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "more-info", label: "More Info" },
              { value: "toggle", label: "Toggle" },
              { value: "navigate", label: "Navigate" },
              { value: "call-service", label: "Call Service" },
              { value: "shake", label: "Shake (Custom)" },
              { value: "none", label: "None" }
            ]
          }
        }
      }
    ];
    if (currentAction === "navigate") {
      schema2.push({
        name: `${type2}_action_navigation_path`,
        label: "Navigation Path",
        selector: { text: {} }
      });
    }
    if (currentAction === "call-service") {
      schema2.push({
        name: `${type2}_action_service`,
        label: "Service",
        selector: { text: {} }
      });
      schema2.push({
        name: `${type2}_action_target_entity`,
        label: "Target Entity",
        selector: { entity: {} }
      });
    }
    return schema2;
  }
};
if (!customElements.get("foundry-gauge-card-editor")) {
  customElements.define("foundry-gauge-card-editor", FoundryGaugeCardEditor);
}

// src/cards/fonts.js
var FOUNDRY_DIGITAL_FONT_DOT_LED = "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";
var FOUNDRY_DIGITAL_FONT_LED = "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";
function ensureLedFont() {
  const FONT_STYLE_ID = "foundry-digital-led-font";
  if (document.getElementById(FONT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = FONT_STYLE_ID;
  style.textContent = `
    @font-face {
      font-family: 'ds-digitalnormal';
      src: url("data:font/woff2;base64,${FOUNDRY_DIGITAL_FONT_LED}") format("woff2");
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'ds-digitaldot';
      src: url("data:font/woff2;base64,${FOUNDRY_DIGITAL_FONT_DOT_LED}") format("woff2");
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

// src/cards/foundry-thermostat-card.js
var FoundryThermostatCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._resizeObserver = null;
    this._entityError = null;
    this._boundHandleClick = () => this._handleAction("tap");
    this._boundHandleDblClick = () => this._handleAction("double_tap");
    this._boundHandleContextMenu = (e) => {
      e.preventDefault();
      this._handleAction("hold");
    };
  }
  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    this.updateCard();
  }
  getRimStyleData(ringStyle, uid) {
    const styles = {
      brass: { grad: `brassRim-${uid}`, stroke: "#8B7355" },
      silver: { grad: `silverRim-${uid}`, stroke: "#999999" },
      chrome: { grad: `silverRim-${uid}`, stroke: "#999999" },
      copper: { grad: `copperRim-${uid}`, stroke: "#8B4513" },
      black: { grad: `blackRim-${uid}`, stroke: "#2b2b2b" },
      white: { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" },
      blue: { grad: `blueRim-${uid}`, stroke: "#104E8B" },
      green: { grad: `greenRim-${uid}`, stroke: "#006400" },
      red: { grad: `redRim-${uid}`, stroke: "#8B0000" },
      none: { grad: null, stroke: "transparent" }
    };
    return styles[ringStyle] || styles.brass;
  }
  renderGradients(uid) {
    return `
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `;
  }
  render() {
    const config = this.config;
    const uid = this._uniqueId;
    const fontColor = config.font_color || config.title_font_color || "#3e2723";
    const title = config.title || "Temperature";
    const ringStyle = config.ring_style;
    const rimData = this.getRimStyleData(ringStyle, uid);
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;
    const rivetColor = config.rivet_color;
    const fontBgColor = config.font_bg_color || "#ffffff";
    const wearLevel = config.wear_level !== void 0 ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== void 0 ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== void 0 ? config.aged_texture : "everywhere";
    const agedTextureIntensity = config.aged_texture_intensity !== void 0 ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = plateTransparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    let liquidColor = "#cc0000";
    if (config.liquid_color) {
      if (Array.isArray(config.liquid_color)) {
        liquidColor = `rgb(${config.liquid_color.join(",")})`;
      } else {
        liquidColor = config.liquid_color;
      }
    }
    this.darkenColor = (color, percent) => {
      if (color.startsWith("#")) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 255) - amt;
        const B = (num & 255) - amt;
        return "#" + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
      }
      if (color.startsWith("rgb")) {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        const factor = 1 - percent / 100;
        return `rgb(${Math.max(0, Math.round(r * factor))}, ${Math.max(0, Math.round(g * factor))}, ${Math.max(0, Math.round(b * factor))})`;
      }
      return color;
    };
    const plateWidth = 145;
    const plateHeight = 340;
    const plateX = 5;
    const plateY = 5;
    const rimWidth = 115;
    const rimHeight = 310;
    const rimX = 20;
    const rimY = 20;
    const width = 155;
    const height = 350;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { 
          background: transparent; 
          box-shadow: none; 
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .card { 
          position: relative; 
          width: ${width}px; 
          height: ${height}px; 
          cursor: pointer;
        }
        .thermostat-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .title {
            font-family: 'Georgia', serif;
            font-size: 14px;
            font-weight: bold;
            opacity: 0.9;
            text-anchor: middle;
            pointer-events: none;
            letter-spacing: 1px;
            fill: ${fontColor};
        }
        .rivet {
          fill: ${rivetColor};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card tabindex="0">
        <div class="card" id="actionRoot">
          <svg class="thermostat-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              ${this.renderGradients(uid)}

              <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
                  <feComposite in="blended" in2="SourceGraphic" operator="in"/>
               </filter>

              <linearGradient id="glassTube-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.2)" />
                <stop offset="30%" style="stop-color:rgba(255,255,255,0.1)" />
                <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                <stop offset="70%" style="stop-color:rgba(255,255,255,0.1)" />
                <stop offset="100%" style="stop-color:rgba(255,255,255,0.3)" />
              </linearGradient>

              <linearGradient id="liquidRad-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" style="stop-color:${this.darkenColor(liquidColor, 20)}" />
                 <stop offset="40%" style="stop-color:${liquidColor}" />
                 <stop offset="60%" style="stop-color:${liquidColor}" />
                 <stop offset="100%" style="stop-color:${this.darkenColor(liquidColor, 40)}" />
              </linearGradient>
            </defs>

              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="15" ry="15" 
                    fill="${plateTransparent ? "none" : plateColor}" 
                    stroke="${plateTransparent ? "none" : "#888"}" stroke-width="0.5"
                    filter="${effectiveAgedTexture === "everywhere" && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

            ${this.renderRivets(plateWidth, plateHeight, plateX, plateY)}

            ${this.renderSquareRim(ringStyle, uid, fontBgColor, glassEffectEnabled, rimX, rimY, rimWidth, rimHeight)}

            <g transform="translate(${rimX}, ${rimY})">
                
                <text x="57.5" y="28" class="title" style="fill: ${fontColor}">${title}</text>
                
                ${config.unit ? `<text x="57.5" y="42" class="title" style="font-size: 11px; fill:${fontColor}; opacity: 0.8;" text-anchor="middle">${config.unit}</text>` : ""}
                
                <g id="scale-group" transform="translate(10, 0)"></g>

                <g id="segments-group"></g>

                <rect x="47.5" y="50" width="20" height="245" rx="10" ry="10" fill="rgba(200,200,200,0.1)" stroke="rgba(0,0,0,0.2)" stroke-width="1" />

                ${(() => {
      const tubeWidth = 20;
      const tubeX = 47.5;
      const pct = config.mercury_width !== void 0 ? config.mercury_width : 50;
      const widthPx = tubeWidth * pct / 100;
      const xPx = tubeX + (tubeWidth - widthPx) / 2;
      return `
                        <rect x="${xPx}" y="52" width="${widthPx}" height="241" rx="${widthPx / 2}" ry="${widthPx / 2}" fill="rgba(255,255,255,0.3)" stroke="rgba(0,0,0,0.1)" stroke-width="0.5" />
                        <rect id="liquid-col" x="${xPx}" y="100" width="${widthPx}" height="150" rx="${widthPx / 2}" ry="${widthPx / 2}" fill="url(#liquidRad-${uid})" />
                        `;
    })()}
                
                <g transform="translate(57.5, 295)">
                    <rect x="-12.5" y="0" width="25" height="15" fill="${this.darkenColor(rimData.stroke || "#444", 10)}" stroke="#444" stroke-width="0.5" />
                    <rect x="-15" y="5" width="30" height="5" fill="${this.darkenColor(rimData.stroke || "#444", 30)}" stroke="none" />
                </g>
            </g>

            ${this.renderWearMarks(wearLevel, height)}

          </svg>
        </div>
      </ha-card>
    `;
    this._attachActionListeners();
    this.drawScale(fontColor);
    this.drawSegments();
  }
  renderRivets(w, h, x, y) {
    const offset = 15;
    const rivets = [
      { cx: x + offset, cy: y + offset },
      { cx: x + w - offset, cy: y + offset },
      { cx: x + offset, cy: y + h - offset },
      { cx: x + w - offset, cy: y + h - offset }
    ];
    return rivets.map(
      (r) => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" class="screw-detail" transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `
    ).join("");
  }
  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";
    const bevelX = x + 8;
    const bevelY = y + 8;
    const bevelW = w - 16;
    const bevelH = h - 16;
    const screenX = bevelX + 4;
    const screenY = bevelY + 4;
    const screenW = bevelW - 8;
    const screenH = bevelH - 8;
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="${bgColor}" stroke="none" />

      ${glassEffectEnabled ? `<path d="M ${screenX} ${screenY} L ${screenX + screenW} ${screenY} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ""}

      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }
  renderWearMarks(wearLevel, viewBoxHeight) {
    if (wearLevel === 0) return "";
    return `
        <circle cx="30" cy="40" r="2" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="120" cy="${viewBoxHeight - 40}" r="1.5" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
    `;
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = { ...config };
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this.render();
          this.updateCard();
        }
      });
    }
    if (!this.config.tap_action)
      this.config.tap_action = { action: "more-info" };
    if (this.config.ring_style === void 0) this.config.ring_style = "brass";
    if (this.config.min === void 0) this.config.min = -40;
    if (this.config.max === void 0) this.config.max = 120;
    if (this.config.mercury_width === void 0) this.config.mercury_width = 50;
    if (this.config.segments_under_mercury === void 0)
      this.config.segments_under_mercury = true;
    this.config.plate_color = this.config.plate_color || "#8c7626";
    this.config.rivet_color = this.config.rivet_color || "#6a5816";
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    this.config.title_color = this.config.title_color || this.config.title_font_color || "#3e2723";
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
    this.render();
  }
  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById("actionRoot");
    if (!root) return;
    root.removeEventListener("click", this._boundHandleClick);
    root.addEventListener("click", this._boundHandleClick, { passive: true });
  }
  _handleAction(kind) {
    if (!this._hass || !this.config) return;
    fireEvent(this, "hass-action", { config: this.config, action: kind });
  }
  _calculateTickInterval(min, max) {
    const range = max - min;
    if (range <= 10) return 1;
    if (range <= 20) return 2;
    if (range <= 50) return 5;
    if (range <= 100) return 10;
    if (range <= 200) return 20;
    return 50;
  }
  _valueToY(val) {
    const yTop = 55;
    const yBottom = 295;
    const min = this.config.min !== void 0 ? this.config.min : -40;
    const max = this.config.max !== void 0 ? this.config.max : 120;
    const pct = (val - min) / (max - min);
    const clampedPct = Math.max(0, Math.min(1, pct));
    return yBottom - clampedPct * (yBottom - yTop);
  }
  drawScale(color) {
    const group = this.shadowRoot.getElementById("scale-group");
    if (!group) return;
    const tickColor = color || "#333";
    const min = this.config.min !== void 0 ? this.config.min : -40;
    const max = this.config.max !== void 0 ? this.config.max : 120;
    const range = max - min;
    let step = 20;
    if (range <= 20) step = 2;
    else if (range <= 50) step = 5;
    else if (range <= 100) step = 10;
    const subStep = step / 2;
    let svgContent = "";
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
      const y = this._valueToY(v);
      svgContent += `<line x1="32" y1="${y}" x2="58" y2="${y}" stroke="${tickColor}" stroke-width="1.5" />`;
      svgContent += `<text x="29" y="${y + 3.5}" text-anchor="end" font-family="Arial" font-size="10" fill="${tickColor}" font-weight="bold">${v}</text>`;
    }
    for (let v = Math.ceil(min / subStep) * subStep; v <= max; v += subStep) {
      if (v % step === 0) continue;
      const y = this._valueToY(v);
      svgContent += `<line x1="38" y1="${y}" x2="58" y2="${y}" stroke="${tickColor}" stroke-width="1" />`;
    }
    group.innerHTML = svgContent;
  }
  drawSegments() {
    const segments = this.config.segments || [];
    const group = this.shadowRoot.getElementById("segments-group");
    if (!group || !segments.length) return;
    const behindMercury = this.config.segments_under_mercury === true;
    const xPos = behindMercury ? 47.5 : 72;
    const width = behindMercury ? 20 : 10;
    const opacity = behindMercury ? 0.35 : 0.8;
    let svgContent = "";
    segments.forEach((seg) => {
      const from = seg.from !== void 0 ? seg.from : 0;
      const to = seg.to !== void 0 ? seg.to : 0;
      if (from >= to) return;
      const yTop = this._valueToY(to);
      const yBottom = this._valueToY(from);
      const height = Math.max(0, yBottom - yTop);
      svgContent += `<rect x="${xPos}" y="${yTop}" width="${width}" height="${height}" rx="2" ry="2" fill="${seg.color}" opacity="${opacity}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />`;
    });
    group.innerHTML = svgContent;
  }
  updateCard() {
    if (!this._hass || !this.config) return;
    const entity = this._hass.states[this.config.entity];
    if (!entity) return;
    const val = parseFloat(entity.state);
    if (isNaN(val)) return;
    const valY = this._valueToY(val);
    const liquidCol = this.shadowRoot.getElementById("liquid-col");
    if (liquidCol) {
      const liquidBottom = 295;
      const currentHeight = Math.max(0, liquidBottom - valY);
      liquidCol.setAttribute("y", valY);
      liquidCol.setAttribute("height", currentHeight);
      liquidCol.style.transition = `y ${this.config.animation_duration || 1.5}s ease-out, height ${this.config.animation_duration || 1.5}s ease-out`;
    }
  }
  static getConfigElement() {
    return document.createElement("foundry-thermostat-editor");
  }
  static getStubConfig() {
    return {
      entity: "sensor.temperature",
      min: 0,
      max: 100,
      ring_style: "brass",
      title: "Temp",
      unit: "\xB0C",
      mercury_width: 50,
      segments_under_mercury: true,
      animation_duration: 1.5,
      plate_color: "#8c7626",
      rivet_color: "#6a5816",
      font_bg_color: "#ffffff",
      font_color: "#3e2723",
      segments: [
        { from: 0, to: 33, color: "#4CAF50" },
        { from: 33, to: 66, color: "#FFC107" },
        { from: 66, to: 100, color: "#F44336" }
      ]
    };
  }
};
if (!customElements.get("foundry-thermostat-card")) {
  customElements.define("foundry-thermostat-card", FoundryThermostatCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-thermostat-card",
  name: "Foundry Thermostat Card",
  preview: true,
  description: "A vintage industrial style thermostat card"
});

// src/cards/foundry-thermostat-editor.js
var FoundryThermostatEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = {
      ...config,
      segments: Array.isArray(config.segments) ? config.segments : []
    };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._form1 = null;
      this._form2 = null;
      this._segmentsContainer = null;
      if (!this._advancedMode) {
        this.render();
      }
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      this._root.className = "card-config";
      const style = document.createElement("style");
      style.textContent = `
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                
                /* Segment Styles */
                .segments-section {
                  margin: 8px 0;
                  padding: 16px;
                  background: var(--card-background-color, #fff);
                  border: 1px solid var(--divider-color, #e0e0e0);
                  border-radius: 4px;
                }
                .section-header {
                  font-weight: 500;
                  margin-bottom: 12px;
                  color: var(--primary-text-color);
                  font-size: 16px;
                }
                .segment-row {
                  display: flex;
                  gap: 8px;
                  align-items: flex-end;
                  margin-bottom: 12px;
                  background: var(--secondary-background-color, #f9f9f9);
                  padding: 10px;
                  border-radius: 4px;
                }
                .input-group {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .input-group label {
                  font-size: 11px;
                  color: var(--secondary-text-color);
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .input-group input {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                .input-group input[type="color"] {
                  height: 36px;
                  padding: 2px;
                  cursor: pointer;
                }
                .remove-btn {
                  background: none;
                  border: none;
                  color: var(--error-color, #db4437);
                  cursor: pointer;
                  padding: 8px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                }
                .add-btn {
                  background-color: var(--primary-color, #03a9f4);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  margin-top: 4px;
                }
            `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
      this._form1 = document.createElement("ha-form");
      this._form1.computeLabel = this._computeLabel;
      this._form1.addEventListener(
        "value-changed",
        (ev) => this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form1);
      this._segmentsContainer = document.createElement("div");
      this._segmentsContainer.className = "segments-section";
      this._root.appendChild(this._segmentsContainer);
      this._form2 = document.createElement("ha-form");
      this._form2.computeLabel = this._computeLabel;
      this._form2.addEventListener(
        "value-changed",
        (ev) => this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form2);
    }
    const formData = this._configToForm(this._config);
    if (this._form1) {
      this._form1.hass = this._hass;
      this._form1.data = formData;
      this._form1.schema = this._getSchemaTop();
    }
    this._renderSegments();
    if (this._form2) {
      this._form2.hass = this._hass;
      this._form2.data = formData;
      this._form2.schema = this._getSchemaBottom();
    }
  }
  _renderSegments() {
    if (!this._segmentsContainer) return;
    const segments = this._config.segments || [];
    let html = `<div class="section-header">Color Ranges (Right Side)</div>`;
    if (segments.length === 0) {
      html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>`;
    }
    segments.forEach((seg, index) => {
      const fromVal = seg.from !== void 0 ? seg.from : 0;
      const toVal = seg.to !== void 0 ? seg.to : 0;
      const colVal = seg.color || "#000000";
      html += `
                <div class="segment-row">
                  <div class="input-group">
                    <label>From</label>
                    <input type="number" class="seg-input" data-idx="${index}" data-key="from" value="${fromVal}">
                  </div>
                  <div class="input-group">
                    <label>To</label>
                    <input type="number" class="seg-input" data-idx="${index}" data-key="to" value="${toVal}">
                  </div>
                  <div class="input-group">
                    <label>Color</label>
                    <input type="color" class="seg-input" data-idx="${index}" data-key="color" value="${colVal}">
                  </div>
                  <button class="remove-btn" data-idx="${index}" title="Remove">\u274C</button>
                </div>
            `;
    });
    html += `<button id="add-btn" class="add-btn">+ Add Color Range</button>`;
    this._segmentsContainer.innerHTML = html;
    this._segmentsContainer.querySelectorAll(".seg-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const key = e.target.dataset.key;
        let val = e.target.value;
        if (key !== "color") val = Number(val);
        this._updateSegment(idx, key, val);
      });
    });
    this._segmentsContainer.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener(
        "click",
        (e) => this._removeSegment(parseInt(e.target.dataset.idx))
      );
    });
    const addBtn = this._segmentsContainer.querySelector("#add-btn");
    if (addBtn) addBtn.addEventListener("click", () => this._addSegment());
  }
  _updateSegment(index, key, value) {
    const segments = [...this._config.segments || []];
    if (segments[index]) {
      segments[index] = { ...segments[index], [key]: value };
      this._updateConfig({ segments });
    }
  }
  _addSegment() {
    const segments = [...this._config.segments || []];
    const last = segments[segments.length - 1];
    const from = last ? last.to : this._config.min || 0;
    const to = from + 10;
    segments.push({ from, to, color: "#4CAF50" });
    this._updateConfig({ segments });
  }
  _removeSegment(index) {
    const segments = [...this._config.segments || []];
    segments.splice(index, 1);
    this._updateConfig({ segments });
  }
  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    this._config = { ...this._config, ...updates };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "ring_style",
        "title_color",
        "font_color",
        "font_bg_color",
        "number_color",
        "primary_tick_color",
        "secondary_tick_color",
        "background_style",
        "face_color",
        "liquid_color",
        "needle_color",
        "plate_transparent",
        "glass_effect_enabled",
        "wear_level",
        "aged_texture",
        "aged_texture_intensity",
        "slider_color",
        "knob_color",
        "tick_color"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    if (newConfig.title_font_color && !newConfig.font_color) {
      newConfig.font_color = newConfig.title_font_color;
    }
    delete newConfig.title_font_color;
    delete newConfig.title_color;
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }
  _configToForm(config) {
    const data = { ...config };
    delete data.segments;
    data.theme = config.theme ?? "none";
    data.liquid_color = this._hexToRgb(config.liquid_color ?? "#cc0000") || [
      204,
      0,
      0
    ];
    data.plate_color = this._hexToRgb(config.plate_color ?? "#f5f5f5") || [
      245,
      245,
      245
    ];
    data.rivet_color = this._hexToRgb(config.rivet_color ?? "#6d5d4b") || [
      109,
      93,
      75
    ];
    data.font_bg_color = this._hexToRgb(config.font_bg_color ?? "#ffffff") || [
      255,
      255,
      255
    ];
    data.font_color = this._hexToRgb(
      config.font_color || config.title_font_color || "#3e2723"
    ) ?? [62, 39, 35];
    data.ring_style = config.ring_style ?? "brass";
    data.min = config.min ?? -40;
    data.max = config.max ?? 120;
    data.mercury_width = config.mercury_width ?? 50;
    data.animation_duration = config.animation_duration ?? 1.5;
    data.segments_under_mercury = config.segments_under_mercury ?? true;
    data.plate_transparent = config.plate_transparent ?? false;
    data.glass_effect_enabled = config.glass_effect_enabled ?? true;
    data.wear_level = config.wear_level ?? 50;
    data.aged_texture = config.aged_texture ?? "everywhere";
    data.aged_texture_intensity = config.aged_texture_intensity ?? 50;
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config };
    Object.keys(formData).forEach((key) => {
      config[key] = formData[key];
    });
    if (this._config.segments) {
      config.segments = this._config.segments;
    }
    if (config.liquid_color)
      config.liquid_color = this._rgbToHex(config.liquid_color);
    if (config.plate_color)
      config.plate_color = this._rgbToHex(config.plate_color);
    if (config.rivet_color)
      config.rivet_color = this._rgbToHex(config.rivet_color);
    if (config.font_bg_color)
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
    if (config.font_color)
      config.font_color = this._rgbToHex(config.font_color);
    delete config.title_color;
    return config;
  }
  _getSchemaTop() {
    return [
      { name: "entity", selector: { entity: { domain: "sensor" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "title", selector: { text: {} } },
          {
            name: "font_color",
            label: "Title Color",
            selector: { color_rgb: {} }
          }
        ]
      },
      { name: "unit", selector: { text: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          {
            name: "segments_under_mercury",
            label: "Segments Behind Liquid",
            selector: { boolean: {} }
          },
          {
            name: "mercury_width",
            label: "Mercury Width (%)",
            selector: { number: { min: 5, max: 100, mode: "slider" } }
          },
          {
            name: "animation_duration",
            label: "Anim. Duration (s)",
            selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "box" } }
          }
        ]
      }
    ];
  }
  _getSchemaBottom() {
    return [
      {
        name: "",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          {
            name: "ring_style",
            label: "Casing Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "liquid_color",
                label: "Mercury Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              },
              {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { color_rgb: {} }
              },
              {
                name: "font_bg_color",
                label: "Tube Background",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          },
          {
            name: "glass_effect_enabled",
            label: "Glass Effect",
            selector: { boolean: {} }
          },
          {
            name: "wear_level",
            label: "Wear Level (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "aged_texture",
            label: "Aged Texture Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          {
            name: "aged_texture_intensity",
            label: "Texture Intensity (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "tap_action",
            label: "Tap Action",
            selector: { "ui-action": {} }
          }
        ]
      }
    ];
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map(
      (n) => Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  _computeLabel(schema2) {
    if (schema2.label) return schema2.label;
    return schema2.name;
  }
};
if (!customElements.get("foundry-thermostat-editor")) {
  customElements.define("foundry-thermostat-editor", FoundryThermostatEditor);
}

// src/cards/foundry-homethermostat-card.js
var FoundryHomeThermostatCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._selectedTarget = "low";
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define a climate entity");
    }
    this.config = { ...config };
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this.render();
          this._updateValues();
        }
      });
    }
    this.config.title = this.config.title !== void 0 ? this.config.title : "Thermostat";
    this.config.plate_color = this.config.plate_color || "#f5f5f5";
    this.config.rivet_color = this.config.rivet_color || "#6d5d4b";
    this.config.ring_style = this.config.ring_style || "brass";
    this.config.font_color = this.config.font_color || "#000000";
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    this.config.title_color = this.config.title_color || "#3e2723";
    this.config.wear_level = this.config.wear_level !== void 0 ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== void 0 ? this.config.glass_effect_enabled : true;
    this.config.plate_transparent = this.config.plate_transparent !== void 0 ? this.config.plate_transparent : false;
    this.config.aged_texture = this.config.aged_texture !== void 0 ? this.config.aged_texture : "everywhere";
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== void 0 ? this.config.aged_texture_intensity : 50;
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
    this._rendered = false;
    this.render();
  }
  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot || !this.config) return;
    this._updateValues();
  }
  _updateValues() {
    if (!this._hass || !this.config) return;
    if (!this._rendered) {
      this.render();
      return;
    }
    const stateObj = this._hass.states[this.config.entity];
    if (!stateObj) return;
    const attributes = stateObj.attributes;
    const mode = stateObj.state;
    this._updateScreenValues(stateObj, attributes);
    const isDualMode = (mode === "heat_cool" || mode === "auto") && attributes.target_temp_high != null && attributes.target_temp_low != null;
    let targetDisplayVal = "--";
    let selectorDisplayVal = this._selectedTarget.toUpperCase();
    if (isDualMode) {
      let val = this._selectedTarget === "high" ? attributes.target_temp_high : attributes.target_temp_low;
      targetDisplayVal = val !== void 0 && val !== null ? val : "--";
    } else {
      let val = attributes.temperature;
      targetDisplayVal = val !== void 0 && val !== null ? val : "--";
    }
    this.updateWordOdometer(
      `odo-selector-${this._uniqueId}`,
      selectorDisplayVal
    );
    this.updateWordOdometer(
      `odo-mode-${this._uniqueId}`,
      (stateObj.state || "").toUpperCase()
    );
    this.updateWordOdometer(
      `odo-fan-${this._uniqueId}`,
      (attributes.fan_mode || "AUTO").toUpperCase()
    );
    this.updateWordOdometer(
      `odo-preset-${this._uniqueId}`,
      (attributes.preset_mode || "NONE").toUpperCase()
    );
    this.updateNumericOdometer(
      `odo-setpoint-${this._uniqueId}`,
      targetDisplayVal
    );
  }
  _updateScreenValues(stateObj, attributes) {
    const currentTemp = attributes.current_temperature !== void 0 && attributes.current_temperature !== null ? attributes.current_temperature : "--";
    let humidity = "--";
    if (attributes.current_humidity !== void 0 && attributes.current_humidity !== null) {
      humidity = attributes.current_humidity;
    } else if (attributes.humidity !== void 0 && attributes.humidity !== null) {
      humidity = attributes.humidity;
    }
    const hvacAction = attributes.hvac_action || stateObj.state || "off";
    const actionText = hvacAction.toUpperCase();
    const root = this.shadowRoot;
    const elTemp = root.getElementById(`screen-temp-${this._uniqueId}`);
    const elHum = root.getElementById(`screen-hum-${this._uniqueId}`);
    const elAction = root.getElementById(`screen-action-${this._uniqueId}`);
    if (elTemp)
      elTemp.innerHTML = `${currentTemp}<tspan font-size="28" dy="-20">\xB0</tspan>`;
    if (elHum) elHum.textContent = humidity !== "--" ? humidity + "%" : "--";
    if (elAction) elAction.textContent = actionText;
  }
  updateWordOdometer(id, inValue) {
    const container = this.shadowRoot.getElementById(id);
    if (!container) return;
    let value = String(inValue || "").replace(/_/g, " ");
    if (!value) value = "";
    const lastValue = container.dataset.lastValue;
    if (value === lastValue) return;
    container.dataset.lastValue = value;
    const isLong = value.length > 7;
    const fontSizeClass = isLong ? "small" : "";
    if (lastValue === void 0) {
      container.innerHTML = `<div class="word-window"><div class="word-reel"><div class="word-item ${fontSizeClass}">${value}</div></div></div>`;
      return;
    }
    container.innerHTML = `
        <div class="word-window">
            <div class="word-reel" style="transform: translateY(0);">
                <div class="word-item ${isLong ? "small" : ""}">${lastValue}</div>
                <div class="word-item ${isLong ? "small" : ""}">${value}</div>
            </div>
        </div>
      `;
    const reel = container.querySelector(".word-reel");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        reel.style.transition = "transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)";
        reel.style.transform = "translateY(-24px)";
        setTimeout(() => {
          container.innerHTML = `<div class="word-window"><div class="word-reel"><div class="word-item ${fontSizeClass}">${value}</div></div></div>`;
        }, 500);
      });
    });
  }
  updateNumericOdometer(id, value) {
    const container = this.shadowRoot.getElementById(id);
    if (!container) return;
    let strVal = String(value);
    if (value === void 0 || value === null) strVal = "--";
    let numericRow = container.querySelector(".numeric-row");
    if (!numericRow) {
      container.innerHTML = `<div class="numeric-row"></div>`;
      numericRow = container.querySelector(".numeric-row");
    }
    const chars = strVal.split("");
    const currentSlots = Array.from(numericRow.children);
    while (currentSlots.length < chars.length) {
      const slot = document.createElement("div");
      slot.className = "digit-strip-window";
      const strip = document.createElement("div");
      strip.className = "digit-strip";
      const charset2 = [
        "-",
        ".",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9"
      ];
      charset2.forEach((char) => {
        const item = document.createElement("div");
        item.className = "strip-char";
        item.textContent = char;
        strip.appendChild(item);
      });
      slot.appendChild(strip);
      numericRow.appendChild(slot);
      currentSlots.push(slot);
    }
    while (currentSlots.length > chars.length) {
      numericRow.removeChild(numericRow.lastChild);
      currentSlots.pop();
    }
    const charset = [
      "-",
      ".",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9"
    ];
    const charHeight = 24;
    chars.forEach((char, i) => {
      const slot = currentSlots[i];
      const strip = slot.querySelector(".digit-strip");
      let index = charset.indexOf(char);
      if (index === -1) index = 2;
      const targetY = index * -charHeight;
      strip.style.transition = "transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)";
      strip.style.transform = `translateY(${targetY}px)`;
    });
  }
  static getConfigElement() {
    return document.createElement("foundry-homethermostat-editor");
  }
  static getStubConfig() {
    return {
      entity: "climate.example",
      title: "Thermostat",
      ring_style: "brass",
      plate_color: "#8c7626",
      title_color: "#3e2723",
      font_bg_color: "#ffffff",
      font_color: "#000000"
    };
  }
  render() {
    if (!this.config || !this._hass) return;
    this._rendered = true;
    const width = 300;
    const height = 440;
    const padding = 10;
    const plateW = width - padding * 2;
    const plateH = height - padding * 2;
    const uid = this._uniqueId;
    const {
      plate_color,
      rivet_color,
      font_color,
      font_bg_color,
      ring_style,
      wear_level,
      glass_effect_enabled,
      title,
      title_color,
      plate_transparent,
      aged_texture,
      aged_texture_intensity
    } = this.config;
    const agedTextureOpacity = (100 - aged_texture_intensity) / 100 * 1;
    const effectiveAgedTexture = plate_transparent && aged_texture === "everywhere" ? "glass_only" : aged_texture;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { background: transparent; container-type: inline-size; }
        .card { position: relative; cursor: pointer; }
        .vector-svg { width: 100%; height: auto; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3)); }
        .digital-text { font-family: 'ds-digitaldot', monospace; pointer-events: none; }
        .label-text { font-family: 'Georgia', serif; font-weight: bold; fill: #ccc; font-size: 10px; text-anchor: middle; pointer-events: none; }
        .rivet { fill: ${rivet_color}; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4)); pointer-events: none; }
        .screw-detail { stroke: #4a4034; stroke-width: 0.5; fill: none; pointer-events: none; }
        
        .knob-arrow { cursor: pointer; transition: fill 0.2s; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); }
        .knob-arrow:hover { fill: #fff; }
        .knob-hit-area { fill: transparent; cursor: pointer; }

        /* Odometer Common */
        .odometer-container {
            width: 100%;
            height: 100%;
            background: #111;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            user-select: none;
        }

        /* Word Odometer (Vertical Roll) */
        .word-reel {
            display: flex;
            flex-direction: column;
            align-items: center;
            /* Will animate transform translateY */
        }
        .word-item {
            height: 30px; /* Matches foreignObject height */
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .word-item.small {
            font-size: 10px;
            letter-spacing: 0px;
        }

        /* Numeric Odometer (Digit Strips) */
        .numeric-row {
            display: flex;
            gap: 1px;
            justify-content: center;
            align-items: center;
        }
        .digit-strip-window {
            width: 14px;
            height: 24px;
            overflow: hidden;
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
            border: 1px solid #333;
            border-radius: 2px;
            position: relative;
        }
        .digit-strip {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            will-change: transform;
        }
        .strip-char {
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #fff;
        }
        /* Word Window Styling */
        .word-window {
            width: 100%;
            height: 24px;
            overflow: hidden;
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
            border: 1px solid #333;
            border-radius: 2px;
            position: relative;
            box-shadow: inset 0 1px 2px rgba(255,255,255,0.1); 
        }
        .word-reel {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            /* transform will be applied via JS */
        }
        .word-item {
            height: 24px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #f0f0f0;
            text-shadow: 0 1px 1px rgba(0,0,0,0.5);
        }
        .word-item.small {
            font-size: 10px;
            letter-spacing: 0px;
        }

        /* Overlay Styles */
        .overlay-container {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10;
            justify-content: center;
            align-items: center;
            border-radius: 15px; /* Match card radius */
        }
        .overlay-content {
            background: #2a2a2a;
            border: 2px solid #8B7355; 
            border-radius: 8px;
            padding: 10px;
            width: 80%;
            max-height: 80%;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
        }
        .overlay-title {
            color: #ccc;
            text-align: center;
            font-family: 'Georgia', serif;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .overlay-option {
            background: #111;
            color: #fff;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            cursor: pointer;
            font-family: monospace;
            font-size: 16px;
            border: 1px solid #444;
            transition: background 0.2s;
        }
        .overlay-option:hover {
            background: #333;
            border-color: #8B7355;
        }
        .overlay-option.active {
            background: #8B7355;
            color: #000;
            font-weight: bold;
        }
        .overlay-input-group {
            display: flex;
            gap: 5px;
        }
        .overlay-input {
            flex: 1;
            background: #000;
            color: #fff;
            border: 1px solid #444;
            padding: 10px;
            font-size: 18px;
            text-align: center;
            border-radius: 4px;
        }
        .overlay-btn {
            background: #8B7355;
            color: #000;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        .odometer-hit-area {
            fill: transparent;
            cursor: pointer;
        }
      </style>
      <ha-card>
        <div class="card" id="card-root">
          <svg class="vector-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              ${this.renderGradients(uid)}
              ${this.renderFilters(uid, agedTextureOpacity)}
            </defs>

            <!-- Plate -->
            <rect x="${padding}" y="${padding}" width="${plateW}" height="${plateH}" rx="15" ry="15"
                  fill="${plate_transparent ? "none" : plate_color}" 
                  stroke="${plate_transparent ? "none" : "#444"}" stroke-width="2"
                  filter="${effectiveAgedTexture === "everywhere" && !plate_transparent ? `url(#aged-${uid})` : ""}" />

            ${this.renderRivets(width, height, padding)}
            <text x="${width / 2}" y="40" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="20" fill="${title_color}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${title}</text>

            <!-- Screen -->
            <g transform="translate(${width / 2 - 120}, 50)">
                ${this.renderTopScreen(uid, ring_style, font_bg_color, font_color, glass_effect_enabled, 0, "--", "")}
            </g>

            <!-- Controls -->
            <g transform="translate(${width / 2}, 215)">
                <g transform="translate(-75, 0)">
                   ${this.renderOdometerGroup(uid, "odo-selector", "SELECTOR", "selector", ring_style, title_color)}
                </g>
                <g transform="translate(75, 0)">
                   ${this.renderOdometerGroup(uid, "odo-setpoint", "TEMP", "setpoint", ring_style, title_color)}
                </g>
            </g>

            <g transform="translate(${width / 2}, 330)">
                 <g transform="translate(-85, 0)">
                    ${this.renderOdometerGroup(uid, "odo-mode", "MODE", "mode", ring_style, title_color)}
                 </g>
                 <g transform="translate(0, 0)">
                    ${this.renderOdometerGroup(uid, "odo-fan", "FAN", "fan", ring_style, title_color)}
                 </g>
                 <g transform="translate(85, 0)">
                    ${this.renderOdometerGroup(uid, "odo-preset", "PRESET", "preset", ring_style, title_color)}
                 </g>
            </g>
            
            ${this.renderWearMarks(width, height, wear_level)}
          </svg>
          
          <!-- Interaction Overlay -->
          <div id="overlay-${uid}" class="overlay-container">
               <div id="overlay-content-${uid}" class="overlay-content">
                  <!-- Injected via JS -->
               </div>
          </div>
        </div>
      </ha-card>
    `;
    this.shadowRoot.querySelectorAll(".knob-hit-area").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this._handleAction(el.dataset.type, el.dataset.dir);
      });
    });
    this.shadowRoot.querySelectorAll(".odometer-hit-area").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this._handleDisplayClick(el.dataset.type);
      });
    });
    const overlay = this.shadowRoot.getElementById(`overlay-${uid}`);
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this._closeOverlay();
        }
      });
    }
    this._updateValues();
  }
  // ... (keep handleAction, renderGradients, separate renderOdometerGroup function not in class text here but logic below)
  _closeOverlay() {
    const overlay = this.shadowRoot.getElementById(`overlay-${this._uniqueId}`);
    if (overlay) overlay.style.display = "none";
  }
  _handleDisplayClick(type2) {
    const entityId = this.config.entity;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return;
    const attr = stateObj.attributes;
    const overlay = this.shadowRoot.getElementById(`overlay-${this._uniqueId}`);
    const content = this.shadowRoot.getElementById(
      `overlay-content-${this._uniqueId}`
    );
    if (!overlay || !content) return;
    let title = type2.toUpperCase();
    let html = "";
    if (type2 === "setpoint") {
      const isDualMode = (stateObj.state === "heat_cool" || stateObj.state === "auto") && attr.target_temp_high != null && attr.target_temp_low != null;
      let currentVal;
      if (isDualMode) {
        currentVal = this._selectedTarget === "high" ? attr.target_temp_high : attr.target_temp_low;
      } else {
        currentVal = attr.temperature;
      }
      if (currentVal === void 0) currentVal = attr.current_temperature || 0;
      title = "SET TEMPERATURE";
      html = `
            <div class="overlay-title">${title}</div>
            <div class="overlay-input-group">
                <input type="number" id="overlay-input-${this._uniqueId}" class="overlay-input" value="${currentVal}" step="${attr.target_temp_step || 0.5}">
                <button class="overlay-btn" id="overlay-set-btn-${this._uniqueId}">SET</button>
            </div>
        `;
    } else {
      let options = [];
      let current = "";
      if (type2 === "selector") {
        options = ["low", "high"];
        current = this._selectedTarget;
      } else if (type2 === "mode") {
        options = attr.hvac_modes || [];
        current = stateObj.state;
      } else if (type2 === "fan") {
        options = attr.fan_modes || [];
        current = attr.fan_mode;
      } else if (type2 === "preset") {
        options = [...attr.preset_modes || []];
        if (!options.includes("none") && !options.includes("None"))
          options.unshift("none");
        current = attr.preset_mode || "none";
      }
      if (options.length === 0) return;
      html = `<div class="overlay-title">SELECT ${title}</div>`;
      options.forEach((opt) => {
        const label = opt.toUpperCase().replace(/_/g, " ");
        const isActive = opt.toLowerCase() === (current || "").toLowerCase();
        html += `<div class="overlay-option ${isActive ? "active" : ""}" data-value="${opt}">${label}</div>`;
      });
    }
    content.innerHTML = html;
    overlay.style.display = "flex";
    if (type2 === "setpoint") {
      const btn = this.shadowRoot.getElementById(
        `overlay-set-btn-${this._uniqueId}`
      );
      const input = this.shadowRoot.getElementById(
        `overlay-input-${this._uniqueId}`
      );
      btn.onclick = () => {
        const val = parseFloat(input.value);
        this._handleAction("setpoint", null, val);
        this._closeOverlay();
      };
    } else {
      content.querySelectorAll(".overlay-option").forEach((el) => {
        el.onclick = () => {
          const val = el.dataset.value;
          if (type2 === "selector") {
            this._selectedTarget = val;
            this._updateValues();
          } else {
            this._applyDirectValue(type2, val);
          }
          this._closeOverlay();
        };
      });
    }
  }
  _applyDirectValue(type2, value) {
    if (type2 === "mode") {
      this._hass.callService("climate", "set_hvac_mode", {
        entity_id: this.config.entity,
        hvac_mode: value
      });
    } else if (type2 === "fan") {
      this._hass.callService("climate", "set_fan_mode", {
        entity_id: this.config.entity,
        fan_mode: value
      });
    } else if (type2 === "preset") {
      this._hass.callService("climate", "set_preset_mode", {
        entity_id: this.config.entity,
        preset_mode: value
      });
    }
  }
  // Update handleAction to accept absolute value for setpoint
  _handleAction(type2, direction, absoluteValue = null) {
    const entityId = this.config.entity;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return;
    const attr = stateObj.attributes;
    const mode = stateObj.state;
    if (type2 === "selector") {
      this._selectedTarget = this._selectedTarget === "low" ? "high" : "low";
      this._updateValues();
    } else if (type2 === "setpoint") {
      const isDualMode = (mode === "heat_cool" || mode === "auto") && attr.target_temp_high != null && attr.target_temp_low != null;
      let currentVal;
      let min = attr.min_temp || 7;
      let max = attr.max_temp || 35;
      if (isDualMode) {
        currentVal = this._selectedTarget === "high" ? attr.target_temp_high : attr.target_temp_low;
      } else {
        currentVal = attr.temperature;
      }
      if (currentVal === void 0 || currentVal === null) {
        if (attr.current_temperature != null)
          currentVal = attr.current_temperature;
        else return;
      }
      let newVal;
      if (absoluteValue !== null) {
        newVal = absoluteValue;
      } else {
        let step = attr.target_temp_step || 1;
        newVal = direction === "up" ? currentVal + step : currentVal - step;
      }
      newVal = Math.max(min, Math.min(max, newVal));
      const serviceData = { entity_id: entityId };
      if (isDualMode) {
        if (this._selectedTarget === "high") {
          serviceData.target_temp_high = newVal;
          serviceData.target_temp_low = attr.target_temp_low;
        } else {
          serviceData.target_temp_low = newVal;
          serviceData.target_temp_high = attr.target_temp_high;
        }
      } else {
        serviceData.temperature = newVal;
      }
      this._hass.callService("climate", "set_temperature", serviceData);
    } else if (type2 === "mode") {
      const modes = attr.hvac_modes || [];
      if (modes.length === 0) return;
      let idx = modes.indexOf(stateObj.state);
      if (idx === -1) idx = 0;
      idx = direction === "up" ? (idx + 1) % modes.length : (idx - 1 + modes.length) % modes.length;
      this._hass.callService("climate", "set_hvac_mode", {
        entity_id: entityId,
        hvac_mode: modes[idx]
      });
    } else if (type2 === "fan") {
      const modes = attr.fan_modes || [];
      if (modes.length === 0) return;
      let idx = modes.indexOf(attr.fan_mode);
      if (idx === -1) idx = 0;
      idx = direction === "up" ? (idx + 1) % modes.length : (idx - 1 + modes.length) % modes.length;
      this._hass.callService("climate", "set_fan_mode", {
        entity_id: entityId,
        fan_mode: modes[idx]
      });
    } else if (type2 === "preset") {
      const modes = attr.preset_modes || [];
      if (modes.length === 0) return;
      let current = attr.preset_mode || "none";
      let activeModes = [...modes];
      if (!activeModes.includes("none") && !activeModes.includes("None"))
        activeModes.unshift("none");
      let idx = activeModes.indexOf(current);
      if (idx === -1) idx = 0;
      idx = direction === "up" ? (idx + 1) % activeModes.length : (idx - 1 + activeModes.length) % activeModes.length;
      const newPreset = activeModes[idx];
      this._hass.callService("climate", "set_preset_mode", {
        entity_id: entityId,
        preset_mode: newPreset === "none" ? "none" : newPreset
      });
    }
  }
  renderGradients(uid) {
    return `
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
     `;
  }
  renderFilters(uid, opacity) {
    if (!opacity) opacity = 0.5;
    return `
        <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
          <feComponentTransfer result="grainTexture">
            <feFuncR type="linear" slope="${1 - opacity}" intercept="${opacity}"/>
            <feFuncG type="linear" slope="${1 - opacity}" intercept="${opacity}"/>
            <feFuncB type="linear" slope="${1 - opacity}" intercept="${opacity}"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
          <feComposite in="blended" in2="SourceGraphic" operator="in"/>
        </filter>
      `;
  }
  renderRivets(w, h, p) {
    const inset = p + 10;
    const coords = [
      [inset, inset],
      [w - inset, inset],
      [inset, h - inset],
      [w - inset, h - inset]
    ];
    return coords.map(
      ([cx, cy]) => `
        <g>
            <circle cx="${cx}" cy="${cy}" r="4" class="rivet" />
            <circle cx="${cx}" cy="${cy}" r="2.5" class="screw-detail" />
            <line x1="${cx - 3}" y1="${cy}" x2="${cx + 3}" y2="${cy}" class="screw-detail" transform="rotate(45, ${cx}, ${cy})" />
        </g>
      `
    ).join("");
  }
  renderWearMarks(w, h, level) {
    if (!level || level <= 0) return "";
    const opacity = Math.min(0.2, level / 200);
    return `
      <g opacity="${opacity}" fill="none" stroke="#000" stroke-width="0.5">
          <path d="M 20 60 Q 40 70 60 50" />
          <path d="M ${w - 40} ${h - 30} L ${w - 20} ${h - 50}" />
          <path d="M 50 ${h - 60} Q 60 ${h - 40} 80 ${h - 70}" />
      </g>
    `;
  }
  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "white":
        return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper":
        return { grad: `copperRim-${uid}`, stroke: "#8B4513" };
      case "blue":
        return { grad: `blueRim-${uid}`, stroke: "#104E8B" };
      case "green":
        return { grad: `greenRim-${uid}`, stroke: "#006400" };
      case "red":
        return { grad: `redRim-${uid}`, stroke: "#8B0000" };
      default:
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
    }
  }
  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    const bevelX = x + 8;
    const bevelY = y + 8;
    const bevelW = w - 16;
    const bevelH = h - 16;
    const screenX = bevelX + 4;
    const screenY = bevelY + 4;
    const screenW = bevelW - 8;
    const screenH = bevelH - 8;
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" fill="${bgColor}" stroke="none" />
      ${glassEffectEnabled ? `<path d="M ${screenX} ${screenY} L ${screenX + screenW} ${screenY} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ""}
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }
  renderTopScreen(uid, ringStyle, bg, color, glass, temp, humidity, action) {
    const w = 240;
    const h = 120;
    const x = 0;
    const y = 0;
    const rimSvg = this.renderSquareRim(ringStyle, uid, bg, glass, x, y, w, h);
    return `
        ${rimSvg}
        <g transform="translate(${x + w / 2}, ${y + h / 2})">
             <!-- Temp -->
            <text id="screen-temp-${uid}" x="0" y="15" text-anchor="middle" class="digital-text" font-size="52" fill="${color}" style="filter: drop-shadow(0 0 2px ${color});">${temp}<tspan font-size="28" dy="-20">\xB0</tspan></text>
            
            <!-- Label -->
            <text x="0" y="-35" text-anchor="middle" class="digital-text" font-size="14" fill="${color}" opacity="0.8">CURRENT</text>
            
            <!-- Bottom Row -->
            <g transform="translate(0, 42)">
                 <!-- Humidity -->
                <text x="-70" y="0" text-anchor="middle" class="digital-text" font-size="14" fill="${color}" opacity="0.8">RH</text>
                <text id="screen-hum-${uid}" x="-40" y="0" text-anchor="middle" class="digital-text" font-size="18" fill="${color}">${humidity}</text>
                
                <!-- Action -->
                <text id="screen-action-${uid}" x="50" y="0" text-anchor="middle" class="digital-text" font-size="18" fill="${color}">${action}</text>
            </g>
        </g>
      `;
  }
  renderOdometerGroup(uid, idKey, knobLabel, type2, ringStyle, labelColor) {
    const rim = this.getRimStyleData(ringStyle, uid);
    const arrowColor = labelColor || "#555";
    const odoId = `${idKey}-${uid}`;
    return `
        <!-- Odometer Window (Ring) -->
        <rect x="-50" y="-35" width="100" height="34" rx="2" fill="url(#${rim.grad})" stroke="${rim.stroke}" stroke-width="1" />
        
        <!-- Inner Black Background & ForeignObject Odometer -->
        <foreignObject x="-48" y="-33" width="96" height="30" style="pointer-events: none;">
            <div id="${odoId}" class="odometer-container" xmlns="http://www.w3.org/1999/xhtml"></div>
        </foreignObject>
        
        <!-- Hit Area Overlay for Click Interaction -->
        <rect class="odometer-hit-area" data-type="${type2}" x="-50" y="-35" width="100" height="34" rx="2" />

        <!-- Knob Graphic -->
        <g transform="translate(0, 25)">
            <g class="knob-arrow-group" transform="translate(-28, 0) scale(0.8)">
                <path class="knob-arrow" d="M -5 0 L 5 -8 L 5 8 Z" fill="${arrowColor}" />
                <rect class="knob-hit-area" data-type="${type2}" data-dir="down" x="-10" y="-15" width="25" height="30" />
            </g>
            <g class="knob-arrow-group" transform="translate(28, 0) scale(0.8)">
                <path class="knob-arrow" d="M 5 0 L -5 -8 L -5 8 Z" fill="${arrowColor}" />
                <rect class="knob-hit-area" data-type="${type2}" data-dir="up" x="-15" y="-15" width="25" height="30" />
            </g>
            <circle r="22" fill="#222" stroke="#111" stroke-width="1" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))" />
            <circle r="20" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2 2" opacity="0.6" />
            <circle r="12" fill="url(#${rim.grad})" stroke="#000" stroke-width="0.5" />
            <circle r="3" fill="#111" />
            <text x="0" y="38" class="label-text" style="fill: ${labelColor || "#888"};">${knobLabel}</text>
        </g>
      `;
  }
};
if (!customElements.get("foundry-homethermostat-card")) {
  customElements.define(
    "foundry-homethermostat-card",
    FoundryHomeThermostatCard
  );
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-homethermostat-card",
  name: "Foundry Home Thermostat",
  description: "Industrial style thermostat control"
});

// src/cards/foundry-homethermostat-editor.js
var fireEvent2 = (node, type2, detail, options) => {
  options = options || {};
  detail = detail === null || detail === void 0 ? {} : detail;
  const event = new Event(type2, {
    bubbles: options.bubbles === void 0 ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === void 0 ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};
var FoundryHomeThermostatEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = { ...config };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      this.shadowRoot.innerHTML = "";
      this.render();
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    this.render();
  }
  render() {
    if (!this._hass || !this._config) return;
    const schema2 = this._getSchema();
    const data = this._configToForm(this._config);
    const element = this.shadowRoot.querySelector("ha-form");
    if (element) {
      element.hass = this._hass;
      element.data = data;
      element.schema = schema2;
      element.computeLabel = this._computeLabel;
      return;
    }
    const container = document.createElement("div");
    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.data = data;
    form.schema = schema2;
    form.computeLabel = this._computeLabel;
    form.addEventListener("value-changed", (ev) => {
      this._handleFormChanged(ev);
    });
    container.appendChild(form);
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(container);
  }
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "ring_style",
        "font_color",
        "font_bg_color",
        "title_color",
        "wear_level",
        "glass_effect_enabled",
        "plate_transparent",
        "aged_texture",
        "aged_texture_intensity"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    this._config = newConfig;
    fireEvent2(this, "config-changed", { config: this._config });
  }
  _getSchema() {
    return [
      {
        name: "entity",
        label: "Entity (Climate)",
        selector: { entity: { domain: "climate" } }
      },
      {
        name: "title",
        label: "Title",
        selector: { text: {} }
      },
      // Scale removed as requested
      {
        name: "",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "font_bg_color",
                label: "Screen Background",
                selector: { color_rgb: {} }
              },
              {
                name: "font_color",
                label: "Digital Font Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              },
              {
                name: "title_color",
                label: "Title Color",
                selector: { color_rgb: {} }
              },
              {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          },
          {
            name: "glass_effect_enabled",
            label: "Glass Effect",
            selector: { boolean: {} }
          },
          {
            name: "wear_level",
            label: "Wear Level (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "aged_texture",
            label: "Aged Texture/Noise",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          {
            name: "aged_texture_intensity",
            label: "Texture Intensity (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          }
        ]
      }
    ];
  }
  _configToForm(config) {
    const data = { ...config };
    data.theme = config.theme ?? "none";
    data.title = config.title ?? "Thermostat";
    data.ring_style = config.ring_style ?? "brass";
    data.title_color = this._hexToRgb(
      config.title_color || config.title_font_color || "#3e2723"
    ) ?? [62, 39, 35];
    data.font_bg_color = this._hexToRgb(config.font_bg_color ?? "#1a1a1a") ?? [
      26,
      26,
      26
    ];
    data.font_color = this._hexToRgb(config.font_color ?? "#ff0055") ?? [
      255,
      0,
      85
    ];
    data.rivet_color = this._hexToRgb(config.rivet_color ?? "#6d5d4b") ?? [
      109,
      93,
      75
    ];
    data.plate_color = this._hexToRgb(config.plate_color ?? "#2b2b2b") ?? [
      43,
      43,
      43
    ];
    data.plate_transparent = config.plate_transparent ?? false;
    data.wear_level = config.wear_level ?? 50;
    data.glass_effect_enabled = config.glass_effect_enabled ?? true;
    data.aged_texture = config.aged_texture ?? "everywhere";
    data.aged_texture_intensity = config.aged_texture_intensity ?? 50;
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config, ...formData };
    if (config.title_color)
      config.title_color = this._rgbToHex(config.title_color);
    if (config.font_bg_color)
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
    if (config.font_color)
      config.font_color = this._rgbToHex(config.font_color);
    if (config.rivet_color)
      config.rivet_color = this._rgbToHex(config.rivet_color);
    if (config.plate_color)
      config.plate_color = this._rgbToHex(config.plate_color);
    return config;
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map(
      (n) => Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  _computeLabel(schema2) {
    if (schema2.label) return schema2.label;
    return schema2.name;
  }
};
customElements.define(
  "foundry-homethermostat-editor",
  FoundryHomeThermostatEditor
);

// src/cards/foundry-analog-clock-card.js
var FoundryAnalogClockCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._timer = null;
    this._handState = {
      s: { v: -1, off: 0 },
      m: { v: -1, off: 0 },
      h: { v: -1, off: 0 }
    };
  }
  setConfig(config) {
    this.config = { ...config };
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this.render();
        }
      });
    }
    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }
    if (this.config.ring_style === void 0) {
      this.config.ring_style = "brass";
    }
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    this.render();
    this._startClock();
  }
  set hass(hass) {
    this._hass = hass;
  }
  connectedCallback() {
    this._startClock();
  }
  disconnectedCallback() {
    this._stopClock();
  }
  _startClock() {
    this._stopClock();
    this._updateTime();
    this._timer = setInterval(() => this._updateTime(), 1e3);
  }
  _stopClock() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
  _updateTime() {
    if (!this.shadowRoot) return;
    const now = /* @__PURE__ */ new Date();
    let time = now;
    if (this.config.time_zone) {
      try {
        const tzString = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
          timeZone: this.config.time_zone
        });
        time = new Date(tzString);
      } catch (_e) {
        console.warn("Invalid time zone:", this.config.time_zone);
      }
    }
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();
    if (this._handState.s.v !== -1 && seconds < this._handState.s.v) {
      this._handState.s.off += 360;
    }
    this._handState.s.v = seconds;
    const secondAngle = seconds * 6 + this._handState.s.off;
    if (this._handState.m.v !== -1 && minutes < this._handState.m.v) {
      this._handState.m.off += 360;
    }
    this._handState.m.v = minutes;
    const minuteAngle = minutes * 6 + seconds * 0.1 + this._handState.m.off;
    const displayHour = hours % 12;
    const prevDisplayHour = this._handState.h.v !== -1 ? this._handState.h.v % 12 : displayHour;
    if (this._handState.h.v !== -1 && displayHour < prevDisplayHour) {
      this._handState.h.off += 360;
    }
    this._handState.h.v = hours;
    const hourAngle = displayHour * 30 + minutes * 0.5 + this._handState.h.off;
    this._updateHand("secondHand", secondAngle);
    this._updateHand("minuteHand", minuteAngle);
    this._updateHand("hourHand", hourAngle);
  }
  _updateHand(id, angle) {
    const hand = this.shadowRoot.getElementById(id);
    if (hand) {
      hand.style.transform = `rotate(${angle}deg)`;
    }
  }
  render() {
    const config = this.config;
    const title = config.title || "";
    const uid = this._uniqueId;
    const titleFontSize = config.title_font_size !== void 0 ? config.title_font_size : 12;
    const ringStyle = config.ring_style !== void 0 ? config.ring_style : "brass";
    const rivetColor = config.rivet_color !== void 0 ? config.rivet_color : "#6d5d4b";
    const plateColor = config.plate_color !== void 0 ? config.plate_color : "#f5f5f5";
    const plateTransparent = config.plate_transparent !== void 0 ? config.plate_transparent : false;
    const wearLevel = config.wear_level !== void 0 ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== void 0 ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== void 0 ? config.aged_texture : "glass_only";
    const agedTextureIntensity = config.aged_texture_intensity !== void 0 ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = plateTransparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    const agedTextureEnabled = effectiveAgedTexture === "glass_only";
    const secondHandEnabled = config.second_hand_enabled !== void 0 ? config.second_hand_enabled : false;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 0px;
        }
        ha-card {
          container-type: inline-size;
        }
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
          cursor: pointer;          
        }
        .clock-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          container-type: inline-size;
        }
        .clock-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${rivetColor};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${title ? title : "Foundry Analog Clock"}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="clock-container" role="presentation">
            <svg class="clock-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for clock face -->
                <radialGradient id="clockFace-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%" style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
                </radialGradient>
                
                <!-- Gradient for brass rim -->
                <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
                </linearGradient>
                
                <!-- Gradient for silver rim -->
                <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
                </linearGradient>
                
                <!-- White rim -->
                <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#dcdcdc;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#f0f0f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
                </linearGradient>

                <!-- Blue rim -->
                <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
                </linearGradient>

                <!-- Green rim -->
                <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
                </linearGradient>

                <!-- Red rim -->
                <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
                </linearGradient>

                <!-- Black / gunmetal -->
                <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#555555;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#1f1f1f;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#444444;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
                </linearGradient>

                <!-- Copper -->
                <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
                </linearGradient>
                
                <!-- Aged texture -->
                <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply"/>
                </filter>
                
                <!-- Clip path for gauge face -->
                <clipPath id="clockFaceClip-${uid}">
                  <circle cx="100" cy="100" r="85"/>
                </clipPath>
              </defs>
              
              <rect x="0" y="0" width="200" height="200" fill="${plateTransparent ? "rgba(240, 235, 225, 0.15)" : plateColor}" ${effectiveAgedTexture === "everywhere" ? `filter="url(#aged-${uid})"` : ""} />
              ${this.renderRim(ringStyle, uid)}
              
              <!-- Clock face -->
              <circle cx="100" cy="100" r="85" fill="${config.background_style === "solid" ? config.face_color || "#f8f8f0" : `url(#clockFace-${uid})`}" ${agedTextureEnabled || effectiveAgedTexture === "everywhere" ? `filter="url(#aged-${uid})" clip-path="url(#clockFaceClip-${uid})"` : ""}/>
                            
              <!-- Glass effect overlay -->
              ${glassEffectEnabled ? '<ellipse cx="100" cy="80" rx="60" ry="50" fill="white" opacity="0.15"/>' : ""}
              
              <!-- Ticks and Numbers -->
              <g id="ticks"></g>
              <g id="numbers"></g>
              
              <!-- Title text -->
              ${title ? this.renderTitleText(title, titleFontSize, config.number_color) : ""}
              
              <!-- Hands -->
              
              <!-- Hour Hand -->
              <g id="hourHand" style="transform-origin: 100px 100px;">
                  <rect x="97" y="50" width="6" height="55" rx="2" fill="${config.hour_hand_color || "#3e2723"}" stroke="#2c1810" stroke-width="0.5" />
                   <path d="M 100 100 L 97 55 L 100 45 L 103 55 Z" fill="${config.hour_hand_color || "#3e2723"}" />
              </g>

              <!-- Minute Hand -->
              <g id="minuteHand" style="transform-origin: 100px 100px;">
                  <rect x="98" y="30" width="4" height="75" rx="2" fill="${config.minute_hand_color || "#3e2723"}" stroke="#2c1810" stroke-width="0.5" />
                  <path d="M 100 100 L 98 35 L 100 25 L 102 35 Z" fill="${config.minute_hand_color || "#3e2723"}" />
              </g>

              <!-- Second Hand -->
              ${secondHandEnabled ? `
              <g id="secondHand" style="transform-origin: 100px 100px; transition: transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44);">
                  <!-- Shaft -->
                  <rect x="99" y="30" width="2" height="85" fill="${config.second_hand_color || "#C41E3A"}" />
                  <!-- Pointed Tip -->
                  <path d="M 99 30 L 100 20 L 101 30 Z" fill="${config.second_hand_color || "#C41E3A"}" />
              </g>
              ` : ""}

              <!-- Center Cap -->
              <circle cx="100" cy="100" r="5" class="rivet"/>
              <circle cx="100" cy="100" r="3.5" class="screw-detail"/>
              <line x1="97" y1="100" x2="103" y2="100" class="screw-detail"/>
              
              <!-- Corner rivets -->
              <circle cx="20" cy="20" r="4" class="rivet"/>
              <circle cx="20" cy="20" r="2.5" class="screw-detail"/>
              <line x1="17" y1="20" x2="23" y2="20" class="screw-detail"/>
              <circle cx="180" cy="20" r="4" class="rivet"/>
              <circle cx="180" cy="20" r="2.5" class="screw-detail"/>
              <line x1="177" y1="20" x2="183" y2="20" class="screw-detail"/>
              <circle cx="20" cy="180" r="4" class="rivet"/>
              <circle cx="20" cy="180" r="2.5" class="screw-detail"/>
              <line x1="17" y1="180" x2="23" y2="180" class="screw-detail"/>
              <circle cx="180" cy="180" r="4" class="rivet"/>
              <circle cx="180" cy="180" r="2.5" class="screw-detail"/>
              <line x1="177" y1="180" x2="183" y2="180" class="screw-detail"/>
              
              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(wearLevel)}
            </svg>
          </div>
        </div>
      </ha-card>
    `;
    this._attachActionListeners();
    this.drawClockTicks(config);
  }
  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById("actionRoot");
    if (!root) return;
    root.onclick = () => {
      const tap = getActionConfig(this.config, "tap_action", {
        action: "more-info"
      });
      if (tap.action !== "none") {
        if (this.config.entity) {
          this._handleAction("tap");
        }
      }
    };
  }
  _handleAction(kind) {
    if (!this._hass || !this.config) return;
    const entityId = this.config.entity;
    if (!entityId) return;
    const tap = getActionConfig(this.config, "tap_action", {
      action: "more-info"
    });
    const hold = getActionConfig(this.config, "hold_action", {
      action: "more-info"
    });
    const dbl = getActionConfig(this.config, "double_tap_action", {
      action: "more-info"
    });
    const actionConfig = kind === "hold" ? hold : kind === "double_tap" ? dbl : tap;
    const action = actionConfig?.action;
    if (!action || action === "none") return;
    if (action === "more-info") {
      fireEvent(this, "hass-more-info", { entityId });
    }
  }
  renderTitleText(title, fontSize, color = "#3e2723") {
    const lines = title.replace(/\\n/g, "\n").split("\n").slice(0, 3);
    const lineHeight = fontSize * 1.2;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = 140 - totalHeight / 2;
    return lines.map((line, index) => {
      const y = startY + index * lineHeight;
      return `<text x="100" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="${color}" font-family="Georgia, serif" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${line}</text>`;
    }).join("\n");
  }
  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "white":
        return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "blue":
        return { grad: `blueRim-${uid}`, stroke: "#1e4f8f" };
      case "green":
        return { grad: `greenRim-${uid}`, stroke: "#1f6b3a" };
      case "red":
        return { grad: `redRim-${uid}`, stroke: "#8f1e1e" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper":
        return { grad: `copperRim-${uid}`, stroke: "#8b5a2b" };
      default:
        return null;
    }
  }
  renderRim(ringStyle, uid) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";
    return `
      <circle cx="100" cy="100" r="95" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="2"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
    `;
  }
  renderWearMarks(wearLevel) {
    if (wearLevel === 0) return "";
    const allMarks = [
      {
        type: "circle",
        cx: 45,
        cy: 60,
        r: 2,
        fill: "#8B7355",
        baseOpacity: 0.2
      },
      {
        type: "circle",
        cx: 155,
        cy: 75,
        r: 1.5,
        fill: "#8B7355",
        baseOpacity: 0.15
      },
      {
        type: "circle",
        cx: 70,
        cy: 120,
        r: 1,
        fill: "#6d5d4b",
        baseOpacity: 0.2
      },
      {
        type: "ellipse",
        cx: 130,
        cy: 50,
        rx: 3,
        ry: 1.5,
        fill: "#8B7355",
        baseOpacity: 0.1
      },
      {
        type: "circle",
        cx: 35,
        cy: 140,
        r: 1.2,
        fill: "#8B7355",
        baseOpacity: 0.12
      },
      {
        type: "circle",
        cx: 165,
        cy: 130,
        r: 1.8,
        fill: "#6d5d4b",
        baseOpacity: 0.18
      },
      {
        type: "ellipse",
        cx: 50,
        cy: 90,
        rx: 2,
        ry: 1,
        fill: "#8B7355",
        baseOpacity: 0.08
      },
      {
        type: "circle",
        cx: 120,
        cy: 145,
        r: 0.8,
        fill: "#6d5d4b",
        baseOpacity: 0.15
      },
      {
        type: "circle",
        cx: 180,
        cy: 65,
        r: 1.3,
        fill: "#8B7355",
        baseOpacity: 0.1
      },
      {
        type: "ellipse",
        cx: 25,
        cy: 100,
        rx: 2.5,
        ry: 1.2,
        fill: "#6d5d4b",
        baseOpacity: 0.09
      }
    ];
    const markCount = Math.ceil(wearLevel / 100 * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);
    return marksToShow.map((mark) => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      return `<${mark.type} cx="${mark.cx}" cy="${mark.cy}" ${mark.r ? `r="${mark.r}"` : `rx="${mark.rx}" ry="${mark.ry}"`} fill="${mark.fill}" opacity="${opacity}"/>`;
    }).join("\n");
  }
  drawClockTicks(config = {}) {
    const ticksGroup = this.shadowRoot.getElementById("ticks");
    const numbersGroup = this.shadowRoot.getElementById("numbers");
    if (!ticksGroup || !numbersGroup) return;
    ticksGroup.innerHTML = "";
    numbersGroup.innerHTML = "";
    const centerX = 100;
    const centerY = 100;
    for (let i = 1; i <= 12; i++) {
      const angleRad = (i * 30 - 90) * Math.PI / 180;
      const x1 = centerX + 75 * Math.cos(angleRad);
      const y1 = centerY + 75 * Math.sin(angleRad);
      const x2 = centerX + 85 * Math.cos(angleRad);
      const y2 = centerY + 85 * Math.sin(angleRad);
      const tick = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      tick.setAttribute("x1", x1);
      tick.setAttribute("y1", y1);
      tick.setAttribute("x2", x2);
      tick.setAttribute("y2", y2);
      tick.setAttribute("stroke", config.primary_tick_color || "#3e2723");
      tick.setAttribute("stroke-width", "2");
      ticksGroup.appendChild(tick);
      const textRadius = 65;
      const textX = centerX + textRadius * Math.cos(angleRad);
      const textY = centerY + textRadius * Math.sin(angleRad);
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", textX);
      text.setAttribute("y", textY);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "14");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("fill", config.number_color || "#3e2723");
      text.textContent = i.toString();
      numbersGroup.appendChild(text);
      for (let j = 1; j < 5; j++) {
        const minorAngle = i * 30 - 90 + j * 6;
        const minorAngleRad = minorAngle * Math.PI / 180;
        const mx1 = centerX + 80 * Math.cos(minorAngleRad);
        const my1 = centerY + 80 * Math.sin(minorAngleRad);
        const mx2 = centerX + 85 * Math.cos(minorAngleRad);
        const my2 = centerY + 85 * Math.sin(minorAngleRad);
        const minorTick = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        minorTick.setAttribute("x1", mx1);
        minorTick.setAttribute("y1", my1);
        minorTick.setAttribute("x2", mx2);
        minorTick.setAttribute("y2", my2);
        minorTick.setAttribute(
          "stroke",
          config.secondary_tick_color || "#5d4e37"
        );
        minorTick.setAttribute("stroke-width", "1");
        ticksGroup.appendChild(minorTick);
      }
    }
  }
  static getConfigElement() {
    return document.createElement("foundry-analog-clock-editor");
  }
  static getStubConfig() {
    return {
      entity: "sun.sun",
      title: "Local Time",
      title_font_size: 12,
      ring_style: "brass",
      rivet_color: "#6a5816",
      plate_color: "#8c7626",
      plate_transparent: false,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "everywhere",
      aged_texture_intensity: 50,
      second_hand_enabled: true,
      background_style: "gradient",
      face_color: "#f8f8f0",
      title_font_color: "#3e2723",
      number_color: "#3e2723",
      primary_tick_color: "#3e2723",
      secondary_tick_color: "#5d4e37",
      hour_hand_color: "#3e2723",
      minute_hand_color: "#3e2723",
      second_hand_color: "#C41E3A"
    };
  }
};
if (!customElements.get("foundry-analog-clock-card")) {
  customElements.define("foundry-analog-clock-card", FoundryAnalogClockCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-analog-clock-card",
  name: "Foundry Analog Clock",
  preview: true,
  description: "A skeaumorphic analog clock with various styles."
});

// src/cards/foundry-analog-clock-editor.js
var FoundryAnalogClockCardEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = { ...config };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._form1 = null;
      this._form2 = null;
      this.render();
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      const style = document.createElement("style");
      style.textContent = `
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
      this._form1 = document.createElement("ha-form");
      this._form1.addEventListener(
        "value-changed",
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form1);
      this._form2 = document.createElement("ha-form");
      this._form2.addEventListener(
        "value-changed",
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form2);
      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-btn";
      resetBtn.textContent = "\u26A0\uFE0F Reset to Default Configuration";
      resetBtn.title = "Reset all settings to defaults";
      resetBtn.addEventListener("click", () => this._resetToDefaults());
      this._root.appendChild(resetBtn);
    }
    if (this._form1) this._form1.hass = this._hass;
    if (this._form2) this._form2.hass = this._hass;
    const formData = this._configToForm(this._config);
    this._form1.schema = this._getSchemaTop(formData);
    this._form1.data = formData;
    this._form1.computeLabel = this._computeLabel;
    this._form2.schema = this._getSchemaBottom(formData);
    this._form2.data = formData;
    this._form2.computeLabel = this._computeLabel;
  }
  _resetToDefaults() {
    if (!confirm(
      "Reset all settings to defaults? This will keep your entity but reset all other configuration."
    )) {
      return;
    }
    const entity = this._config.entity;
    this._updateConfig({
      entity,
      title: "Local Time",
      time_zone: "",
      second_hand_enabled: true,
      title_font_size: 12,
      ring_style: "brass",
      rivet_color: "#6a5816",
      plate_color: "#8c7626",
      plate_transparent: false,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "everywhere",
      aged_texture_intensity: 50,
      tap_action: { action: "more-info" },
      hold_action: { action: "more-info" },
      double_tap_action: { action: "more-info" }
    });
  }
  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "ring_style",
        "title_color",
        "font_color",
        "font_bg_color",
        "number_color",
        "primary_tick_color",
        "secondary_tick_color",
        "background_style",
        "face_color",
        "liquid_color",
        "needle_color",
        "plate_transparent",
        "glass_effect_enabled",
        "wear_level",
        "aged_texture",
        "aged_texture_intensity",
        "slider_color",
        "knob_color",
        "tick_color",
        "hour_hand_color",
        "minute_hand_color",
        "second_hand_color"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._config = newConfig;
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        })
      );
    }
  }
  _configToForm(config) {
    const data = { ...config };
    data.appearance = {
      theme: config.theme ?? "none",
      ring_style: config.ring_style,
      rivet_color: this._hexToRgb(config.rivet_color ?? "#6a5816") ?? [
        106,
        88,
        22
      ],
      plate_color: this._hexToRgb(config.plate_color ?? "#8c7626") ?? [
        140,
        118,
        38
      ],
      plate_transparent: config.plate_transparent,
      wear_level: config.wear_level,
      glass_effect_enabled: config.glass_effect_enabled,
      aged_texture: config.aged_texture,
      aged_texture_intensity: config.aged_texture_intensity,
      second_hand_enabled: config.second_hand_enabled,
      background_style: config.background_style,
      face_color: this._hexToRgb(config.face_color ?? "#f8f8f0") ?? [
        248,
        248,
        240
      ],
      hour_hand_color: this._hexToRgb(config.hour_hand_color ?? "#3e2723") ?? [
        62,
        39,
        35
      ],
      minute_hand_color: this._hexToRgb(
        config.minute_hand_color ?? "#3e2723"
      ) ?? [62, 39, 35],
      second_hand_color: this._hexToRgb(
        config.second_hand_color ?? "#C41E3A"
      ) ?? [196, 30, 58]
    };
    data.style_fonts_ticks = {
      title_color: this._hexToRgb(
        config.title_color || config.title_font_color || "#3e2723"
      ) ?? [62, 39, 35],
      number_color: this._hexToRgb(config.number_color ?? "#3e2723") ?? [
        62,
        39,
        35
      ],
      primary_tick_color: this._hexToRgb(
        config.primary_tick_color ?? "#3e2723"
      ) ?? [62, 39, 35],
      secondary_tick_color: this._hexToRgb(
        config.secondary_tick_color ?? "#5d4e37"
      ) ?? [93, 78, 55]
    };
    data.layout = {
      title_font_size: config.title_font_size
    };
    data.actions = {};
    ["tap", "hold", "double_tap"].forEach((type2) => {
      const conf = config[`${type2}_action`] || {};
      data.actions[`${type2}_action_action`] = conf.action || "more-info";
      data.actions[`${type2}_action_navigation_path`] = conf.navigation_path || "";
      data.actions[`${type2}_action_service`] = conf.service || "";
      data.actions[`${type2}_action_target_entity`] = conf.target?.entity_id || "";
    });
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config };
    const defaults = {
      rivet_color: this._config?.rivet_color ?? "#6a5816",
      plate_color: this._config?.plate_color ?? "#8c7626",
      face_color: this._config?.face_color ?? "#f8f8f0",
      title_color: this._config?.title_color ?? this._config?.title_font_color ?? "#3e2723",
      number_color: this._config?.number_color ?? "#3e2723",
      primary_tick_color: this._config?.primary_tick_color ?? "#3e2723",
      secondary_tick_color: this._config?.secondary_tick_color ?? "#5d4e37",
      hour_hand_color: this._config?.hour_hand_color ?? "#3e2723",
      minute_hand_color: this._config?.minute_hand_color ?? "#3e2723",
      second_hand_color: this._config?.second_hand_color ?? "#C41E3A"
    };
    Object.keys(formData).forEach((key) => {
      if (["appearance", "layout", "actions", "style_fonts_ticks"].includes(key))
        return;
      config[key] = formData[key];
    });
    if (formData.appearance) Object.assign(config, formData.appearance);
    if (formData.layout) Object.assign(config, formData.layout);
    if (formData.style_fonts_ticks)
      Object.assign(config, formData.style_fonts_ticks);
    const rc = this._rgbToHex(config.rivet_color);
    if (rc) config.rivet_color = rc;
    else config.rivet_color = defaults.rivet_color;
    const pc = this._rgbToHex(config.plate_color);
    if (pc) config.plate_color = pc;
    else config.plate_color = defaults.plate_color;
    const fc = this._rgbToHex(config.face_color);
    if (fc) config.face_color = fc;
    else config.face_color = defaults.face_color;
    const tfc = this._rgbToHex(config.title_color);
    if (tfc) config.title_color = tfc;
    else config.title_color = defaults.title_color;
    const nc = this._rgbToHex(config.number_color);
    if (nc) config.number_color = nc;
    else config.number_color = defaults.number_color;
    const ptc = this._rgbToHex(config.primary_tick_color);
    if (ptc) config.primary_tick_color = ptc;
    else config.primary_tick_color = defaults.primary_tick_color;
    const stc = this._rgbToHex(config.secondary_tick_color);
    if (stc) config.secondary_tick_color = stc;
    else config.secondary_tick_color = defaults.secondary_tick_color;
    const hhc = this._rgbToHex(config.hour_hand_color);
    if (hhc) config.hour_hand_color = hhc;
    else config.hour_hand_color = defaults.hour_hand_color;
    const mhc = this._rgbToHex(config.minute_hand_color);
    if (mhc) config.minute_hand_color = mhc;
    else config.minute_hand_color = defaults.minute_hand_color;
    const shc = this._rgbToHex(config.second_hand_color);
    if (shc) config.second_hand_color = shc;
    else config.second_hand_color = defaults.second_hand_color;
    if (formData.actions) {
      ["tap", "hold", "double_tap"].forEach((type2) => {
        const group = formData.actions;
        const actionType = group[`${type2}_action_action`];
        const newAction = { action: actionType };
        if (actionType === "navigate") {
          newAction.navigation_path = group[`${type2}_action_navigation_path`];
        } else if (actionType === "call-service") {
          newAction.service = group[`${type2}_action_service`];
          const targetEnt = group[`${type2}_action_target_entity`];
          if (targetEnt) newAction.target = { entity_id: targetEnt };
        }
        config[`${type2}_action`] = newAction;
      });
    }
    return config;
  }
  _computeLabel(schema2) {
    if (schema2.label) return schema2.label;
    if (schema2.name === "entity") return "Entity (Optional)";
    return schema2.name.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  _getSchemaTop(_formData) {
    return [
      {
        name: "entity",
        selector: { entity: {} }
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "title", selector: { text: {} } },
          {
            name: "time_zone",
            label: "Time Zone",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "", label: "Local Time" },
                  { value: "Etc/UTC", label: "UTC" },
                  { value: "America/New_York", label: "New York (Eastern)" },
                  { value: "America/Chicago", label: "Chicago (Central)" },
                  { value: "America/Denver", label: "Denver (Mountain)" },
                  {
                    value: "America/Los_Angeles",
                    label: "Los Angeles (Pacific)"
                  },
                  { value: "America/Phoenix", label: "Phoenix (MST)" },
                  { value: "America/Anchorage", label: "Anchorage (Alaska)" },
                  { value: "Pacific/Honolulu", label: "Honolulu (Hawaii)" },
                  { value: "Europe/London", label: "London (GMT/BST)" },
                  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
                  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
                  { value: "Europe/Moscow", label: "Moscow (MSK)" },
                  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
                  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
                  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
                  { value: "Asia/Singapore", label: "Singapore (SGT)" },
                  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
                  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" }
                ]
              }
            }
          }
        ]
      }
    ];
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map(
      (n) => Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  _getSchemaBottom(formData) {
    const actionData = formData.actions || {};
    return [
      {
        name: "appearance",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          },
          {
            name: "second_hand_enabled",
            label: "Show Second Hand",
            selector: { boolean: {} }
          },
          {
            name: "wear_level",
            label: "Wear Level",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "glass_effect_enabled",
            label: "Glass Effect",
            selector: { boolean: {} }
          },
          {
            name: "aged_texture",
            label: "Aged Texture",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          {
            name: "aged_texture_intensity",
            label: "Texture Intensity",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "background_style",
            label: "Background Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "gradient", label: "Default Gradient" },
                  { value: "solid", label: "Solid Color" }
                ]
              }
            }
          },
          {
            name: "face_color",
            label: "Face Color (Solid Mode)",
            selector: { color_rgb: {} }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "hour_hand_color",
                label: "Hour Hand",
                selector: { color_rgb: {} }
              },
              {
                name: "minute_hand_color",
                label: "Minute Hand",
                selector: { color_rgb: {} }
              },
              {
                name: "second_hand_color",
                label: "Second Hand",
                selector: { color_rgb: {} }
              }
            ]
          }
        ]
      },
      {
        name: "style_fonts_ticks",
        type: "expandable",
        title: "Fonts & Ticks",
        schema: [
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "title_color",
                label: "Title Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "number_color",
                label: "Number Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "primary_tick_color",
                label: "Primary Tick Color",
                selector: { color_rgb: {} }
              },
              {
                name: "secondary_tick_color",
                label: "Secondary Tick Color",
                selector: { color_rgb: {} }
              }
            ]
          }
        ]
      },
      {
        name: "layout",
        type: "expandable",
        title: "Layout & Text",
        schema: [
          {
            name: "title_font_size",
            label: "Title Font Size",
            selector: { number: { mode: "box" } }
          }
        ]
      },
      {
        name: "actions",
        type: "expandable",
        title: "Actions",
        schema: [
          ...this._getActionSchema("tap", "Tap", actionData),
          ...this._getActionSchema("hold", "Hold", actionData),
          ...this._getActionSchema("double_tap", "Double Tap", actionData)
        ]
      }
    ];
  }
  _getActionSchema(type2, label, actionData) {
    const actionKey = `${type2}_action_action`;
    const currentAction = actionData ? actionData[actionKey] : "more-info";
    const schema2 = [
      {
        name: actionKey,
        label: `${label} Action`,
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "more-info", label: "More Info" },
              { value: "toggle", label: "Toggle" },
              { value: "navigate", label: "Navigate" },
              { value: "call-service", label: "Call Service" },
              { value: "none", label: "None" }
            ]
          }
        }
      }
    ];
    if (currentAction === "navigate") {
      schema2.push({
        name: `${type2}_action_navigation_path`,
        label: "Navigation Path",
        selector: { text: {} }
      });
    }
    if (currentAction === "call-service") {
      schema2.push({
        name: `${type2}_action_service`,
        label: "Service",
        selector: { text: {} }
      });
      schema2.push({
        name: `${type2}_action_target_entity`,
        label: "Target Entity",
        selector: { entity: {} }
      });
    }
    return schema2;
  }
};
if (!customElements.get("foundry-analog-clock-editor")) {
  customElements.define(
    "foundry-analog-clock-editor",
    FoundryAnalogClockCardEditor
  );
}

// src/cards/foundry-digital-clock-card.js
var FoundryDigitalClockCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._timer = null;
  }
  setConfig(config) {
    this.config = { ...config };
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this.render();
        }
      });
    }
    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }
    this.config.ring_style = this.config.ring_style || "brass";
    this.config.title_font_size = this.config.title_font_size !== void 0 ? this.config.title_font_size : 14;
    this.config.title_color = this.config.title_color || "#3e2723";
    this.config.plate_color = this.config.plate_color || "#f5f5f5";
    this.config.plate_transparent = this.config.plate_transparent !== void 0 ? this.config.plate_transparent : false;
    this.config.rivet_color = this.config.rivet_color || "#6d5d4b";
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    this.config.font_color = this.config.font_color || "#000000";
    this.config.use_24h_format = this.config.use_24h_format !== void 0 ? this.config.use_24h_format : true;
    this.config.show_seconds = this.config.show_seconds !== void 0 ? this.config.show_seconds : true;
    this.config.wear_level = this.config.wear_level !== void 0 ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== void 0 ? this.config.glass_effect_enabled : true;
    this.config.aged_texture = this.config.aged_texture !== void 0 ? this.config.aged_texture : "everywhere";
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== void 0 ? this.config.aged_texture_intensity : 50;
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
    this.render();
    this._startClock();
  }
  set hass(hass) {
    this._hass = hass;
  }
  connectedCallback() {
    this._startClock();
  }
  disconnectedCallback() {
    this._stopClock();
  }
  _startClock() {
    this._stopClock();
    this._updateTime();
    this._timer = setInterval(() => this._updateTime(), 1e3);
  }
  _stopClock() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
  _updateTime() {
    if (!this.shadowRoot) return;
    const now = /* @__PURE__ */ new Date();
    let time = now;
    if (this.config.time_zone) {
      try {
        const tzString = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
          timeZone: this.config.time_zone
        });
        time = new Date(tzString);
      } catch (_e) {
        console.warn("Invalid time zone:", this.config.time_zone);
      }
    }
    let hoursNum = time.getHours();
    let isPm = hoursNum >= 12;
    if (this.config.use_24h_format === false) {
      hoursNum = hoursNum % 12;
      hoursNum = hoursNum ? hoursNum : 12;
    }
    const hours = hoursNum.toString().padStart(2, "0");
    let minutes = time.getMinutes().toString().padStart(2, "0");
    let seconds = time.getSeconds().toString().padStart(2, "0");
    const showPm = this.config.use_24h_format === false && isPm;
    const timeFull = this.config.show_seconds !== false ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
    const timeDisplay = this.shadowRoot.getElementById("timeDisplay");
    const pmIndicator = this.shadowRoot.getElementById("pmIndicator");
    if (timeDisplay) timeDisplay.textContent = timeFull;
    if (pmIndicator) pmIndicator.textContent = showPm ? "." : "";
  }
  render() {
    const config = this.config;
    const title = config.title || "";
    const uid = this._uniqueId;
    const titleFontSize = config.title_font_size;
    const titleColor = config.title_color;
    const ringStyle = config.ring_style;
    const rivetColor = config.rivet_color;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;
    const fontBgColor = config.font_bg_color;
    const fontColor = config.font_color;
    const wearLevel = config.wear_level !== void 0 ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== void 0 ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== void 0 ? config.aged_texture : "everywhere";
    const agedTextureIntensity = config.aged_texture_intensity !== void 0 ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = plateTransparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    const titleFontFamily = "Georgia, serif";
    this.shadowRoot.innerHTML = `
      <style>
        .flip-digit {
          font-family: 'ds-digitalnormal', monospace; 
        }

        .digit-item {
          font-family: 'ds-digitalnormal', monospace;
        }
        :host {
          display: block;
          padding: 0px;
        }
        ha-card {
          container-type: inline-size;
        }
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
          cursor: pointer;          
        }
        .clock-container {
          position: relative;
          width: 100%;
          max-width: 520px; /* Allowed to be wider */
          margin: 0 auto;
          container-type: inline-size;
          aspect-ratio: 26 / 15;
        }
        .clock-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${rivetColor};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${title ? title : "Foundry Digital Clock"}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="clock-container" role="presentation">
            <svg class="clock-svg" viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for clock face/background -->
                <radialGradient id="clockFace-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${fontBgColor};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(fontBgColor, -20)};stop-opacity:1" />
                </radialGradient>
                
                <!-- Gradients for Rims -->
                ${this.renderGradients(uid)}

                <!-- Aged texture -->
                <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
                  <feComposite in="blended" in2="SourceGraphic" operator="in"/>
                </filter>
              </defs>
              
              <!-- 1. The Plate (Base) -->
              <!-- Wider and shorter: 260x140 (ViewBox 260) -->
              <rect x="5" y="10" width="250" height="130" rx="20" ry="20" 
                    fill="${plateTransparent ? "none" : plateColor}" 
                    stroke="${plateTransparent ? "none" : "#888"}" stroke-width="0.5"
                    filter="${effectiveAgedTexture === "everywhere" && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              <!-- 2. The Rivets -->
              ${this.renderRivets()}

              <!-- 3. The Ring (Wider) -->
              ${this.renderSquareRim(ringStyle, uid, fontBgColor, glassEffectEnabled)}
              
              <!-- Title text -->
              ${title ? `<text x="130" y="28" text-anchor="middle" font-size="${titleFontSize}" font-weight="bold" fill="${titleColor}" font-family="${titleFontFamily}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${title}</text>` : ""}
              
              <!-- Digital Time -->
              ${this.config.show_seconds !== false ? `
                  <!-- Layout with Seconds: H:M:S -->
                  <g font-size="50" font-family="ds-digitalnormal" fill="${fontColor}" dominant-baseline="middle" stroke="${fontColor}" stroke-width="0.2" style="pointer-events: none; letter-spacing: 2px;">
                    <text id="timeDisplay" x="130" y="75" text-anchor="middle">--:--:--</text>
                    <text id="pmIndicator" x="205" y="75" text-anchor="start"></text>
                  </g>
                ` : `
                  <!-- Layout without Seconds: H:M -->
                  <g font-size="55" font-family="ds-digitalnormal" fill="${fontColor}" dominant-baseline="middle" stroke="${fontColor}" stroke-width="0.2" style="pointer-events: none; letter-spacing: 2px;">
                    <text id="timeDisplay" x="130" y="75" text-anchor="middle">--:--</text>
                    <text id="pmIndicator" x="185" y="75" text-anchor="start"></text>
                  </g>
                `}
              
              <!-- Wear Marks -->
              ${this.renderWearMarks(wearLevel)}

            </svg>
          </div>
        </div>
      </ha-card>
    `;
    this._attachActionListeners();
  }
  renderRivets() {
    const rivets = [
      { cx: 20, cy: 25 },
      { cx: 240, cy: 25 },
      { cx: 20, cy: 125 },
      { cx: 240, cy: 125 }
    ];
    return rivets.map(
      (r) => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" class="screw-detail" transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `
    ).join("");
  }
  renderWearMarks(wearLevel) {
    if (wearLevel === 0) return "";
    const allMarks = [
      {
        type: "circle",
        cx: 50,
        cy: 45,
        r: 2,
        fill: "#8B7355",
        baseOpacity: 0.2
      },
      {
        type: "circle",
        cx: 210,
        cy: 56,
        r: 1.5,
        fill: "#8B7355",
        baseOpacity: 0.15
      },
      {
        type: "circle",
        cx: 77,
        cy: 90,
        r: 1,
        fill: "#6d5d4b",
        baseOpacity: 0.2
      },
      {
        type: "ellipse",
        cx: 163,
        cy: 37,
        rx: 3,
        ry: 1.5,
        fill: "#8B7355",
        baseOpacity: 0.1
      },
      {
        type: "circle",
        cx: 38,
        cy: 105,
        r: 1.2,
        fill: "#8B7355",
        baseOpacity: 0.12
      },
      {
        type: "circle",
        cx: 220,
        cy: 97,
        r: 1.8,
        fill: "#6d5d4b",
        baseOpacity: 0.18
      },
      {
        type: "ellipse",
        cx: 55,
        cy: 67,
        rx: 2,
        ry: 1,
        fill: "#8B7355",
        baseOpacity: 0.08
      },
      {
        type: "circle",
        cx: 152,
        cy: 108,
        r: 0.8,
        fill: "#6d5d4b",
        baseOpacity: 0.15
      },
      {
        type: "circle",
        cx: 238,
        cy: 48,
        r: 1.3,
        fill: "#8B7355",
        baseOpacity: 0.1
      },
      {
        type: "ellipse",
        cx: 27,
        cy: 75,
        rx: 2.5,
        ry: 1.2,
        fill: "#6d5d4b",
        baseOpacity: 0.09
      }
    ];
    const markCount = Math.ceil(wearLevel / 100 * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);
    return marksToShow.map((mark) => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      return `<${mark.type} cx="${mark.cx}" cy="${mark.cy}" ${mark.r ? `r="${mark.r}"` : `rx="${mark.rx}" ry="${mark.ry}"`} fill="${mark.fill}" opacity="${opacity}"/>`;
    }).join("");
  }
  // ... helper methods for color, common gradients etc ...
  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith("#")) {
      let num = parseInt(color.replace("#", ""), 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 255) + amt, B = (num & 255) + amt;
      return "#" + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }
  renderGradients(uid) {
    return `
        <!-- Brass -->
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <!-- Silver/Chrome -->
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <!-- White -->
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
         <!-- Black -->
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <!-- Copper -->
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <!-- Blue -->
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <!-- Green -->
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <!-- Red -->
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `;
  }
  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";
    return `
      <!-- Outer Frame (The Ring) -->
      <rect x="20" y="35" width="220" height="80" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>

      <!-- Face Background (Screen Color) -->
      <rect x="32" y="47" width="196" height="56" rx="10" ry="10" fill="${bgColor}" stroke="none" />

      <!-- Glass Glare on Screen (Top 20% approx) -->
      <!-- Screen: x=32, w=196. Top=47. -->
      ${glassEffectEnabled ? `<path d="M 32 47 L 228 47 L 228 58 Q 130 62 32 58 Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ""}

      <!-- Screen Frame (Shadow & Border) - Drawn ON TOP -->
      <rect x="32" y="47" width="196" height="56" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <!-- Inner Bevel (Inset) - Drawn LAST to overlap edges -->
      <rect x="28" y="43" width="204" height="64" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }
  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "white":
        return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper":
        return { grad: `copperRim-${uid}`, stroke: "#8B4513" };
      case "blue":
        return { grad: `blueRim-${uid}`, stroke: "#104E8B" };
      case "green":
        return { grad: `greenRim-${uid}`, stroke: "#006400" };
      case "red":
        return { grad: `redRim-${uid}`, stroke: "#8B0000" };
      default:
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
    }
  }
  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById("actionRoot");
    if (!root) return;
    root.onclick = () => {
      const tap = getActionConfig(this.config, "tap_action", {
        action: "more-info"
      });
      if (tap.action !== "none") {
        if (this.config.entity) {
          this._handleAction("tap");
        }
      }
    };
  }
  _handleAction(_kind) {
    if (!this._hass || !this.config) return;
    const entityId = this.config.entity;
    if (!entityId) return;
    const tap = getActionConfig(this.config, "tap_action", {
      action: "more-info"
    });
    const actionConfig = tap;
    const action = actionConfig?.action;
    if (!action || action === "none") return;
    if (action === "more-info") {
      fireEvent(this, "hass-more-info", { entityId });
    }
  }
  static getConfigElement() {
    return document.createElement("foundry-digital-clock-editor");
  }
  static getStubConfig() {
    return {
      entity: "sun.sun",
      title: "Local Time",
      title_font_size: 12,
      title_color: "#3e2723",
      ring_style: "brass",
      rivet_color: "#6a5816",
      plate_color: "#8c7626",
      plate_transparent: false,
      font_bg_color: "#ffffff",
      font_color: "#000000",
      use_24h_format: true,
      show_seconds: true,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "everywhere",
      aged_texture_intensity: 50
    };
  }
};
if (!customElements.get("foundry-digital-clock-card")) {
  customElements.define("foundry-digital-clock-card", FoundryDigitalClockCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-digital-clock-card",
  name: "Foundry Digital Clock",
  preview: true,
  description: "A digital clock with square ring and LED font."
});

// src/cards/foundry-digital-clock-editor.js
var FoundryDigitalClockCardEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = { ...config };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._form1 = null;
      this._form2 = null;
      if (!this._advancedMode) {
        this.render();
      }
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      const style = document.createElement("style");
      style.textContent = `
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
      this._form1 = document.createElement("ha-form");
      this._form1.addEventListener(
        "value-changed",
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form1);
      this._form2 = document.createElement("ha-form");
      this._form2.addEventListener(
        "value-changed",
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form2);
    }
    if (this._form1) this._form1.hass = this._hass;
    if (this._form2) this._form2.hass = this._hass;
    const formData = this._configToForm(this._config);
    this._form1.schema = this._getSchemaTop(formData);
    this._form1.data = formData;
    this._form1.computeLabel = this._computeLabel;
    this._form2.schema = this._getSchemaBottom(formData);
    this._form2.data = formData;
    this._form2.computeLabel = this._computeLabel;
  }
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "ring_style",
        "title_color",
        "font_color",
        "font_bg_color",
        "number_color",
        "primary_tick_color",
        "secondary_tick_color",
        "background_style",
        "face_color",
        "liquid_color",
        "needle_color",
        "plate_transparent",
        "glass_effect_enabled",
        "wear_level",
        "aged_texture",
        "aged_texture_intensity",
        "slider_color",
        "knob_color",
        "tick_color"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._config = newConfig;
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        })
      );
    }
  }
  _configToForm(config) {
    const data = { ...config };
    data.appearance = {
      theme: config.theme ?? "none",
      ring_style: config.ring_style ?? "brass",
      font_bg_color: this._hexToRgb(config.font_bg_color ?? "#ffffff") ?? [
        255,
        255,
        255
      ],
      font_color: this._hexToRgb(config.font_color ?? "#000000") ?? [0, 0, 0],
      title_color: this._hexToRgb(
        config.title_color || config.title_font_color || "#3e2723"
      ) ?? [62, 39, 35],
      rivet_color: this._hexToRgb(config.rivet_color ?? "#6d5d4b") ?? [
        109,
        93,
        75
      ],
      plate_color: this._hexToRgb(config.plate_color ?? "#f5f5f5") ?? [
        245,
        245,
        245
      ],
      plate_transparent: config.plate_transparent ?? false,
      wear_level: config.wear_level ?? 50,
      glass_effect_enabled: config.glass_effect_enabled ?? true,
      aged_texture: config.aged_texture ?? "everywhere",
      aged_texture_intensity: config.aged_texture_intensity ?? 50
    };
    data.layout = {
      title_font_size: config.title_font_size ?? 14,
      use_24h_format: config.use_24h_format ?? true,
      show_seconds: config.show_seconds ?? true
    };
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config };
    Object.keys(formData).forEach((key) => {
      if (["appearance", "layout"].includes(key)) return;
      config[key] = formData[key];
    });
    if (formData.appearance) {
      Object.assign(config, formData.appearance);
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
      config.font_color = this._rgbToHex(config.font_color);
      config.title_color = this._rgbToHex(config.title_color);
      config.rivet_color = this._rgbToHex(config.rivet_color);
      config.plate_color = this._rgbToHex(config.plate_color);
    }
    if (formData.layout) {
      Object.assign(config, formData.layout);
    }
    return config;
  }
  _getSchemaTop(_formData) {
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "title", selector: { text: {} } },
      {
        name: "time_zone",
        label: "Time Zone",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: "Local Time" },
              { value: "Etc/UTC", label: "UTC" },
              { value: "America/New_York", label: "New York (Eastern)" },
              { value: "America/Chicago", label: "Chicago (Central)" },
              { value: "America/Denver", label: "Denver (Mountain)" },
              { value: "America/Los_Angeles", label: "Los Angeles (Pacific)" },
              { value: "America/Phoenix", label: "Phoenix (MST)" },
              { value: "America/Anchorage", label: "Anchorage (Alaska)" },
              { value: "Pacific/Honolulu", label: "Honolulu (Hawaii)" },
              { value: "Europe/London", label: "London (GMT/BST)" },
              { value: "Europe/Paris", label: "Paris (CET/CEST)" },
              { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
              { value: "Europe/Moscow", label: "Moscow (MSK)" },
              { value: "Asia/Tokyo", label: "Tokyo (JST)" },
              { value: "Asia/Shanghai", label: "Shanghai (CST)" },
              { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
              { value: "Asia/Singapore", label: "Singapore (SGT)" },
              { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
              { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" }
            ]
          }
        }
      },
      {
        name: "layout",
        type: "expandable",
        title: "Layout & Text",
        schema: [
          {
            name: "title_font_size",
            label: "Title Font Size",
            selector: { number: { mode: "box" } }
          },
          {
            name: "use_24h_format",
            label: "Use 24h Format",
            selector: { boolean: {} }
          },
          {
            name: "show_seconds",
            label: "Show Seconds",
            selector: { boolean: {} }
          }
        ]
      }
    ];
  }
  _getSchemaBottom(_formData) {
    return [
      {
        name: "appearance",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "font_bg_color",
                label: "Screen Background",
                selector: { color_rgb: {} }
              },
              {
                name: "font_color",
                label: "Digital Font Color",
                selector: { color_rgb: {} }
              },
              {
                name: "title_color",
                label: "Title Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              },
              {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          },
          {
            name: "glass_effect_enabled",
            label: "Glass Effect",
            selector: { boolean: {} }
          },
          {
            name: "wear_level",
            label: "Wear Level (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "aged_texture",
            label: "Aged Texture Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          {
            name: "aged_texture_intensity",
            label: "Texture Intensity (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          }
        ]
      }
    ];
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map(
      (n) => Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  _computeLabel(schema2) {
    if (schema2.label) return schema2.label;
    return schema2.name;
  }
};
if (!customElements.get("foundry-digital-clock-editor")) {
  customElements.define(
    "foundry-digital-clock-editor",
    FoundryDigitalClockCardEditor
  );
}

// src/cards/foundry-slider-card.js
var FoundrySliderCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uniqueId = Math.random().toString(36).substr(2, 9);
  }
  setConfig(config) {
    this.config = { ...config };
    this.config = { ...config };
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this.render();
          this._updateValueDisplay(this.config.value);
        }
      });
    }
    this.config.min = this.config.min !== void 0 ? this.config.min : 0;
    this.config.max = this.config.max !== void 0 ? this.config.max : 100;
    this.config.step = this.config.step !== void 0 ? this.config.step : 1;
    this.config.value = this.config.value !== void 0 ? this.config.value : this.config.min;
    this.config.ring_style = this.config.ring_style || "brass";
    this.config.plate_color = this.config.plate_color || "#8c7626";
    this.config.face_color = this.config.face_color ?? this.config.background_color ?? this.config.plate_color ?? this.config.slider_background_color ?? "#8c7626";
    this.config.plate_transparent = this.config.plate_transparent !== void 0 ? this.config.plate_transparent : false;
    this.config.rivet_color = this.config.rivet_color || "#6a5816";
    this.config.knob_color = this.config.knob_color || "#c9a961";
    this.config.font_color = this.config.font_color || "#000000";
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    this.config.slider_color = this.config.slider_color || "#444444";
    this.config.tick_color = this.config.tick_color || "rgba(0,0,0,0.22)";
    this.config.show_value = this.config.show_value !== void 0 ? this.config.show_value : true;
    this.config.title_color = this.config.title_color || "#3e2723";
    this.config.title_font_size = this.config.title_font_size !== void 0 ? this.config.title_font_size : 14;
    this.config.value_font_size = this.config.value_font_size !== void 0 ? this.config.value_font_size : 36;
    this.config.knob_shape = this.config.knob_shape || "square";
    this.config.knob_size = this.config.knob_size !== void 0 ? this.config.knob_size : 100;
    this.config.wear_level = this.config.wear_level !== void 0 ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== void 0 ? this.config.glass_effect_enabled : true;
    this.config.aged_texture = this.config.aged_texture !== void 0 ? this.config.aged_texture : "everywhere";
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== void 0 ? this.config.aged_texture_intensity : 50;
    ensureLedFont();
    this.render();
  }
  set hass(hass) {
    this._hass = hass;
  }
  render() {
    const cfg = this.config;
    const uid = this._uniqueId;
    const title = cfg.title || "";
    const width = 155;
    const height = 350;
    this._viewBoxHeight = height;
    const plateWidth = 145;
    const plateHeight = 340;
    const plateX = 5;
    const plateY = 5;
    const rimWidth = 115;
    const rimHeight = 310;
    const rimX = 20;
    const rimY = 20;
    const bevelX = rimX + 8;
    const bevelY = rimY + 8;
    const bevelW = rimWidth - 16;
    const bevelH = rimHeight - 16;
    const screenX = bevelX + 4;
    const screenY = bevelY + 4;
    const screenW = bevelW - 8;
    const screenH = bevelH - 8;
    const screenCenterX = screenX + screenW / 2;
    const TRACK_WIDTH_MULTIPLIER = 0.32;
    const KNOB_SIZE_MAX = 32;
    const KNOB_SIZE_MIN = KNOB_SIZE_MAX / 8;
    const knobSizePercent = Math.max(0, Math.min(100, Number(cfg.knob_size)));
    const knobSize = KNOB_SIZE_MIN + (KNOB_SIZE_MAX - KNOB_SIZE_MIN) * (knobSizePercent / 100);
    let knobWidth, knobHeight, knobBorderRadius;
    switch (cfg.knob_shape) {
      case "circular":
        knobWidth = knobSize;
        knobHeight = knobSize;
        knobBorderRadius = "50%";
        break;
      case "rectangular":
        knobWidth = knobSize;
        knobHeight = Math.round(knobSize * 1.33);
        knobBorderRadius = "10px";
        break;
      case "square":
      default:
        knobWidth = knobSize;
        knobHeight = knobSize;
        knobBorderRadius = "10px";
        break;
    }
    const knobRx = knobBorderRadius === "50%" ? knobWidth / 2 : Number.parseFloat(knobBorderRadius);
    const knobRy = knobBorderRadius === "50%" ? knobHeight / 2 : Number.parseFloat(knobBorderRadius);
    this._knobWidth = knobWidth;
    this._knobHeight = knobHeight;
    this._knobRx = knobRx;
    this._knobRy = knobRy;
    const displayChars = this._getLedCharCount(cfg);
    const ledCharWidth = cfg.value_font_size * 0.45;
    const ledPaddingX = Math.max(6, Math.round(cfg.value_font_size * 0.2));
    const ledWidthBase = Math.round(
      displayChars * ledCharWidth + ledPaddingX * 2
    );
    const ledWidth = Math.min(screenW - 12, Math.max(50, ledWidthBase));
    const ledHeight = 46;
    const ledX = screenCenterX - ledWidth / 2;
    const ledY = screenY + screenH - ledHeight - 10;
    const trackWidth = knobSize * TRACK_WIDTH_MULTIPLIER;
    const trackX = screenCenterX - trackWidth / 2;
    const trackTopY = screenY + 40;
    const trackBottomY = cfg.show_value ? ledY - 10 : screenY + screenH - 16;
    const trackHeight = trackBottomY - trackTopY;
    const sliderInputTop = trackTopY;
    const sliderInputBottom = trackBottomY;
    const sliderInputHeight = sliderInputBottom - sliderInputTop;
    const sliderInputLength = sliderInputHeight;
    this._trackTopY = trackTopY;
    this._trackBottomY = trackBottomY;
    this._trackHeight = trackHeight;
    this._trackCenterX = trackX + trackWidth / 2;
    const tickMajorLength = 12;
    const tickMinorLength = 6;
    const tickStartX = Math.min(
      trackX + trackWidth + 6,
      screenX + screenW - tickMajorLength - 2
    );
    const wearLevel = cfg.wear_level;
    const glassEffectEnabled = false;
    const agedTexture = cfg.aged_texture;
    const agedTextureIntensity = cfg.aged_texture_intensity;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = cfg.plate_transparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    const backgroundColor = cfg.face_color ?? cfg.plate_color;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        ha-card {
          background: transparent;
          box-shadow: none;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
        }
        .card {
          position: relative;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .slider-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${cfg.rivet_color};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
        .title {
          font-family: 'Georgia', serif;
          font-size: ${cfg.title_font_size}px;
          font-weight: bold;
          opacity: 0.9;
          text-anchor: middle;
          pointer-events: none;
          letter-spacing: 1px;
        }

        /* HTML input range overlay */
        .slider-input-container {
          position: absolute;
          top: ${(sliderInputTop / height * 100).toFixed(2)}%;
          left: ${((trackX + trackWidth / 2) / width * 100).toFixed(2)}%;
          width: 100%;
          height: ${(sliderInputHeight / height * 100).toFixed(2)}%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          pointer-events: all;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          width: ${sliderInputLength}px;
          height: ${trackWidth}px;
          writing-mode: bt-lr;
          -webkit-writing-mode: bt-lr;
          transform-origin: center center;
          transform: rotate(270deg);
          cursor: pointer;
          margin: 0;
        }

        /* Hide default track */
        input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
          height: ${trackWidth}px;
          border: none;
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: ${trackWidth}px;
          border: none;
        }

        /* Thumb/Knob styling */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 1px;
          height: 1px;
          margin-top: 0;
          border-radius: 0;
          background: transparent;
          border: none;
          box-shadow: none;
          cursor: grab;
        }

        input[type="range"]::-moz-range-thumb {
          width: 1px;
          height: 1px;
          border-radius: 0;
          background: transparent;
          border: none;
          box-shadow: none;
          cursor: grab;
        }

        input[type="range"]:active::-webkit-slider-thumb {
          cursor: grabbing;
        }

        input[type="range"]:active::-moz-range-thumb {
          cursor: grabbing;
        }
      </style>

      <ha-card role="img" aria-label="${title ? title : "Foundry Slider"}" tabindex="0">
        <div class="card" id="actionRoot">
          <svg class="slider-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Radial gradient for LED display background -->
              <radialGradient id="ledBg-${uid}" cx="50%" cy="50%">
                <stop offset="0%" style="stop-color:${cfg.font_bg_color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${this.adjustColor(cfg.font_bg_color, -20)};stop-opacity:1" />
              </radialGradient>

              ${this.renderGradients(uid)}

              <!-- Track Gradient -->
              <linearGradient id="trackGradient-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:${this.adjustColor(cfg.slider_color, 25)};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${cfg.slider_color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${this.adjustColor(cfg.slider_color, -8)};stop-opacity:1" />
              </linearGradient>

              <!-- Knob Gradient -->
              <linearGradient id="knobGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${this.adjustColor(cfg.knob_color, 40)};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${cfg.knob_color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${this.adjustColor(cfg.knob_color, -15)};stop-opacity:1" />
              </linearGradient>

              <!-- Aged texture filter -->
              <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                <feComponentTransfer result="grainTexture">
                  <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                </feComponentTransfer>
                <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
                <feComposite in="blended" in2="SourceGraphic" operator="in"/>
              </filter>
            </defs>

            <!-- Base Plate -->
            <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="15" ry="15" 
                  fill="${cfg.plate_transparent ? "none" : cfg.plate_color}"
                  stroke="${cfg.plate_transparent ? "none" : "#888"}" 
                  stroke-width="0.5"
                  filter="${effectiveAgedTexture === "everywhere" && !cfg.plate_transparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

            ${this.renderRivets(plateWidth, plateHeight, plateX, plateY)}

            ${this.renderSquareRim(
      cfg.ring_style,
      uid,
      backgroundColor,
      glassEffectEnabled,
      rimX,
      rimY,
      rimWidth,
      rimHeight
    )}

            ${effectiveAgedTexture === "everywhere" && !cfg.plate_transparent ? `
              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}"
                    rx="15" ry="15" fill="rgba(255,255,255,0.35)" filter="url(#aged-${uid})"
                    style="pointer-events:none;" />
            ` : ""}

            ${effectiveAgedTexture === "glass_only" ? `
              <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}"
                    rx="10" ry="10" fill="rgba(255,255,255,0.35)" filter="url(#aged-${uid})"
                    style="pointer-events:none;" />
            ` : ""}

            <!-- Title -->
            ${title ? `<text x="${screenCenterX}" y="${screenY + 22}" class="title" style="fill: ${cfg.title_color}">${title}</text>` : ""}

            <!-- Slider Track -->
            <rect x="${trackX}" y="${trackTopY}" width="${trackWidth}" height="${trackHeight}"
                  rx="${trackWidth / 2}" ry="${trackWidth / 2}"
                  fill="${cfg.slider_color}"
                  stroke="rgba(0,0,0,0.3)"
                  stroke-width="1"
                  style="box-shadow: inset 0 2px 6px rgba(0,0,0,0.45);" />

            <!-- Inner track shadow effect -->
            <rect x="${trackX + 1}" y="${trackTopY + 2}" width="${trackWidth - 2}" height="${trackHeight - 4}"
                  rx="${(trackWidth - 2) / 2}" ry="${(trackWidth - 2) / 2}"
                  fill="url(#trackGradient-${uid})"
                  opacity="0.4" />

            <!-- Tick Marks -->
            ${this.renderTickMarks(
      cfg,
      trackTopY,
      trackBottomY,
      tickStartX,
      tickMajorLength,
      tickMinorLength
    )}

            <!-- Slider Knob -->
            <rect id="sliderKnob"
                  x="${(trackX + trackWidth / 2 - knobWidth / 2).toFixed(2)}"
                  y="${(trackBottomY - knobHeight / 2).toFixed(2)}"
                  width="${knobWidth}"
                  height="${knobHeight}"
                  rx="${knobRx}"
                  ry="${knobRy}"
                  fill="url(#knobGrad-${uid})"
              style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.45)); pointer-events: none;" />

            <!-- LED Display Box -->
            ${cfg.show_value ? this.renderLEDDisplay(uid, cfg, ledX, ledY, ledWidth, ledHeight, glassEffectEnabled) : ""}

            <!-- Wear Marks -->
            ${this.renderWearMarks(wearLevel, width, height)}
          </svg>

          <!-- HTML Input Range Overlay -->
          <div class="slider-input-container">
            <input id="slider" type="range" 
                   min="${cfg.min}" 
                   max="${cfg.max}" 
                   step="${cfg.step}" 
                   value="${cfg.value}" 
                   aria-label="Slider control"
                   aria-valuemin="${cfg.min}"
                   aria-valuemax="${cfg.max}"
                   aria-valuenow="${cfg.value}" />
          </div>
        </div>
      </ha-card>
    `;
    this._attachListeners();
    this._updateValueDisplay(cfg.value);
  }
  renderGradients(uid) {
    return `
      <!-- Brass -->
      <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
      </linearGradient>
      <!-- Silver/Chrome -->
      <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
      </linearGradient>
      <!-- White -->
      <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f6f6f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
      </linearGradient>
      <!-- Black -->
      <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
      </linearGradient>
      <!-- Copper -->
      <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#c77c43;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#e1a06a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#9a5c2a;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#d7925a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
      </linearGradient>
      <!-- Blue -->
      <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2a6fdb;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#5ea2ff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1f4f9e;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#4f8fe6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
      </linearGradient>
      <!-- Green -->
      <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2fbf71;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#6fe0a6;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1f7a49;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#53cf8e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
      </linearGradient>
      <!-- Red -->
      <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e53935;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ff6f6c;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#9e1f1c;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#e85a57;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
      </linearGradient>
    `;
  }
  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";
    const bevelX = x + 8;
    const bevelY = y + 8;
    const bevelW = w - 16;
    const bevelH = h - 16;
    const screenX = bevelX + 4;
    const screenY = bevelY + 4;
    const screenW = bevelW - 8;
    const screenH = bevelH - 8;
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="${bgColor}" stroke="none" />

      ${glassEffectEnabled ? `<path d="M ${screenX} ${screenY} L ${screenX + screenW} ${screenY} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ""}

      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }
  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "white":
        return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper":
        return { grad: `copperRim-${uid}`, stroke: "#8B4513" };
      case "blue":
        return { grad: `blueRim-${uid}`, stroke: "#104E8B" };
      case "green":
        return { grad: `greenRim-${uid}`, stroke: "#006400" };
      case "red":
        return { grad: `redRim-${uid}`, stroke: "#8B0000" };
      default:
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
    }
  }
  renderRivets(w, h, x, y) {
    const offset = 15;
    const rivets = [
      { cx: x + offset, cy: y + offset },
      { cx: x + w - offset, cy: y + offset },
      { cx: x + offset, cy: y + h - offset },
      { cx: x + w - offset, cy: y + h - offset }
    ];
    return rivets.map(
      (r) => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" 
              class="screw-detail" 
              transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `
    ).join("");
  }
  renderTickMarks(cfg, trackTopY, trackBottomY, tickStartX, majorLength, minorLength) {
    const min = cfg.min;
    const max = cfg.max;
    const step = cfg.step;
    const tickColor = cfg.tick_color;
    const range = max - min;
    const trackHeight = trackBottomY - trackTopY;
    let ticks = "";
    for (let i = 0; i <= 10; i++) {
      const percent = i / 10;
      const y = trackBottomY - trackHeight * percent;
      ticks += `<line x1="${tickStartX}" y1="${y}" x2="${tickStartX + majorLength}" y2="${y}" 
                      stroke="${tickColor}" stroke-width="2" />`;
    }
    const numSteps = range / step;
    if (numSteps > 0 && numSteps <= 100) {
      for (let i = 0; i <= numSteps; i++) {
        const value = min + i * step;
        const percent = (value - min) / range;
        const y = trackBottomY - trackHeight * percent;
        const isMajor = i % Math.ceil(numSteps / 10) === 0;
        if (!isMajor) {
          ticks += `<line x1="${tickStartX}" y1="${y}" x2="${tickStartX + minorLength}" y2="${y}" 
                          stroke="${tickColor}" stroke-width="1" />`;
        }
      }
    }
    return ticks;
  }
  renderLEDDisplay(uid, cfg, x, y, width, height, glassEffectEnabled) {
    const borderRadius = 8;
    return `
      <!-- LED Display Background -->
      <rect x="${x}" y="${y}" width="${width}" height="${height}" 
            rx="${borderRadius}" ry="${borderRadius}"
            fill="url(#ledBg-${uid})"
            stroke="rgba(0,0,0,0.5)"
            stroke-width="1" />
      
      <!-- Inner bevel -->
      <rect x="${x + 2}" y="${y + 2}" width="${width - 4}" height="${height - 4}" 
            rx="${borderRadius - 2}" ry="${borderRadius - 2}"
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            stroke-width="1" />
      
      <!-- Glass glare effect -->
      ${glassEffectEnabled ? `
        <path d="M ${x + 4} ${y + 4} 
                 L ${x + width - 4} ${y + 4} 
                 L ${x + width - 4} ${y + height * 0.4} 
                 Q ${x + width / 2} ${y + height * 0.5} ${x + 4} ${y + height * 0.4} Z" 
              fill="white" 
              opacity="0.08" />
      ` : ""}
      
      <!-- Value Text -->
      <text id="valueDisplay" 
            x="${x + width / 2}" 
            y="${y + height / 2}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-size="${cfg.value_font_size}" 
            font-family="ds-digitalnormal, monospace" 
            fill="${cfg.font_color}"
            style="text-shadow: 0 0 5px ${cfg.font_color}; pointer-events: none;">
        ${this._formatValue(cfg.value)}
      </text>
    `;
  }
  renderWearMarks(wearLevel, viewBoxWidth, viewBoxHeight) {
    if (wearLevel === 0) return "";
    const baseWidth = 150;
    const baseHeight = 260;
    const scaleX = viewBoxWidth / baseWidth;
    const scaleY = viewBoxHeight / baseHeight;
    const allMarks = [
      {
        type: "circle",
        cx: 30,
        cy: 55,
        r: 1.8,
        fill: "#8B7355",
        baseOpacity: 0.18
      },
      {
        type: "ellipse",
        cx: 120,
        cy: 45,
        rx: 2.5,
        ry: 1.2,
        fill: "#6d5d4b",
        baseOpacity: 0.12
      },
      {
        type: "circle",
        cx: 45,
        cy: 95,
        r: 1.2,
        fill: "#8B7355",
        baseOpacity: 0.15
      },
      {
        type: "circle",
        cx: 128,
        cy: 88,
        r: 1.5,
        fill: "#6d5d4b",
        baseOpacity: 0.2
      },
      {
        type: "ellipse",
        cx: 22,
        cy: 140,
        rx: 2,
        ry: 1,
        fill: "#8B7355",
        baseOpacity: 0.1
      },
      {
        type: "circle",
        cx: 135,
        cy: 155,
        r: 1,
        fill: "#6d5d4b",
        baseOpacity: 0.15
      },
      {
        type: "circle",
        cx: 38,
        cy: 185,
        r: 1.3,
        fill: "#8B7355",
        baseOpacity: 0.12
      },
      {
        type: "ellipse",
        cx: 118,
        cy: 195,
        rx: 3,
        ry: 1.5,
        fill: "#8B7355",
        baseOpacity: 0.08
      },
      {
        type: "circle",
        cx: 25,
        cy: 225,
        r: 2,
        fill: "#6d5d4b",
        baseOpacity: 0.2
      },
      {
        type: "circle",
        cx: 125,
        cy: 238,
        r: 1.8,
        fill: "#8B7355",
        baseOpacity: 0.18
      },
      {
        type: "ellipse",
        cx: 60,
        cy: 70,
        rx: 1.5,
        ry: 0.8,
        fill: "#6d5d4b",
        baseOpacity: 0.09
      },
      {
        type: "circle",
        cx: 100,
        cy: 215,
        r: 0.8,
        fill: "#8B7355",
        baseOpacity: 0.1
      }
    ];
    const markCount = Math.ceil(wearLevel / 100 * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);
    return marksToShow.map((mark) => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      const cx = (mark.cx * scaleX).toFixed(2);
      const cy = (mark.cy * scaleY).toFixed(2);
      const r = mark.r ? (mark.r * ((scaleX + scaleY) / 2)).toFixed(2) : null;
      const rx = mark.rx ? (mark.rx * scaleX).toFixed(2) : null;
      const ry = mark.ry ? (mark.ry * scaleY).toFixed(2) : null;
      return `<${mark.type} cx="${cx}" cy="${cy}" ${r ? `r="${r}"` : `rx="${rx}" ry="${ry}"`} fill="${mark.fill}" opacity="${opacity}"/>`;
    }).join("");
  }
  _attachListeners() {
    const slider = this.shadowRoot.getElementById("slider");
    if (!slider) return;
    slider.oninput = (e) => this._onSliderInput(e);
    slider.onchange = (e) => this._onSliderChange(e);
    const root = this.shadowRoot.getElementById("actionRoot");
    const sliderContainer = this.shadowRoot.querySelector(
      ".slider-input-container"
    );
    const pointerTarget = sliderContainer || root;
    if (pointerTarget) {
      pointerTarget.onpointerdown = (e) => {
        if (e.button !== 0) return;
        this._draggingSlider = true;
        this._suppressTap = true;
        pointerTarget.setPointerCapture(e.pointerId);
        this._setSliderValueFromClientY(e.clientY, false);
        e.preventDefault();
      };
      pointerTarget.onpointermove = (e) => {
        if (!this._draggingSlider) return;
        this._setSliderValueFromClientY(e.clientY, false);
        e.preventDefault();
      };
      pointerTarget.onpointerup = (e) => {
        if (!this._draggingSlider) return;
        this._draggingSlider = false;
        pointerTarget.releasePointerCapture(e.pointerId);
        this._setSliderValueFromClientY(e.clientY, true);
        e.preventDefault();
      };
      pointerTarget.onpointercancel = (e) => {
        if (!this._draggingSlider) return;
        this._draggingSlider = false;
        pointerTarget.releasePointerCapture(e.pointerId);
      };
    }
    if (root) {
      root.onclick = (e) => {
        if (this._suppressTap) {
          this._suppressTap = false;
          return;
        }
        if (e.target.id !== "slider") {
          this._handleAction("tap");
        }
      };
    }
  }
  _onSliderInput(e) {
    const v = e.target.value;
    this._updateValueDisplay(v);
    fireEvent(this, "foundry-slider-input", { value: Number(v) });
  }
  _onSliderChange(e) {
    const v = e.target.value;
    this.config.value = Number(v);
    this._updateValueDisplay(v);
    fireEvent(this, "foundry-slider-change", { value: Number(v) });
  }
  _setSliderValueFromClientY(clientY, commit) {
    const slider = this.shadowRoot.getElementById("slider");
    const svg = this.shadowRoot.querySelector(".slider-svg");
    if (!slider || !svg || this._trackHeight === void 0) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.height) return;
    const scaleY = rect.height / (this._viewBoxHeight || rect.height);
    const yInSvg = (clientY - rect.top) / scaleY;
    const cfg = this.config || {};
    const min = Number(cfg.min) || 0;
    const max = Number(cfg.max) || 0;
    const range = max - min || 1;
    const tRaw = (this._trackBottomY - yInSvg) / this._trackHeight;
    const t = Math.min(1, Math.max(0, tRaw));
    const rawValue = min + t * range;
    const step = Number(cfg.step) || 1;
    const decimals = (() => {
      const s = String(step);
      return s.includes(".") ? s.split(".")[1].length : 0;
    })();
    const stepped = step ? Math.round((rawValue - min) / step) * step + min : rawValue;
    const value = Number(stepped.toFixed(decimals));
    slider.value = value;
    if (commit) {
      this.config.value = Number(value);
      this._updateValueDisplay(value);
      fireEvent(this, "foundry-slider-change", { value: Number(value) });
    } else {
      this._updateValueDisplay(value);
      fireEvent(this, "foundry-slider-input", { value: Number(value) });
    }
  }
  _updateValueDisplay(v) {
    const formatted = this._formatValue(v);
    const el = this.shadowRoot.getElementById("valueDisplay");
    if (el) el.textContent = formatted;
    const knob = this.shadowRoot.getElementById("sliderKnob");
    if (knob && this._trackHeight !== void 0) {
      const cfg = this.config || {};
      const min = Number(cfg.min) || 0;
      const max = Number(cfg.max) || 0;
      const range = max - min || 1;
      const value = Number(v);
      const clamped = Math.min(max, Math.max(min, value));
      const t = (clamped - min) / range;
      const centerY = this._trackBottomY - t * this._trackHeight;
      knob.setAttribute("y", (centerY - this._knobHeight / 2).toFixed(2));
      knob.setAttribute(
        "x",
        (this._trackCenterX - this._knobWidth / 2).toFixed(2)
      );
    }
  }
  _getLedCharCount(cfg) {
    const minText = this._formatValue(cfg.min);
    const maxText = this._formatValue(cfg.max);
    const valText = this._formatValue(cfg.value);
    return Math.max(minText.length, maxText.length, valText.length);
  }
  _formatValue(v) {
    const cfg = this.config || {};
    const step = Number(cfg.step) || 1;
    const min = Number(cfg.min) || 0;
    const max = Number(cfg.max) || 0;
    const decimalPlaces = (() => {
      const s = String(step);
      if (s.indexOf(".") === -1) return 0;
      return s.split(".")[1].length;
    })();
    const num = Number(v);
    const allowSign = Number(cfg.min) < 0 || Number(cfg.max) < 0;
    const sign = allowSign ? num < 0 ? "-" : "+" : "";
    const abs = Math.abs(num);
    const maxAbs = Math.max(Math.abs(min), Math.abs(max), 0);
    const intDigits = Math.max(String(Math.floor(maxAbs)).length, 1);
    const fixed = decimalPlaces > 0 ? abs.toFixed(decimalPlaces) : String(Math.floor(abs));
    const parts = String(fixed).split(".");
    const intPart = parts[0].padStart(intDigits, "0");
    const fracPart = parts[1] ? "." + parts[1] : "";
    return `${sign}${intPart}${fracPart}`;
  }
  _handleAction(_kind) {
    if (!this.config) return;
    const act = getActionConfig(this.config, "tap_action", { action: "none" });
    if (!act || act.action === "none") return;
    if (act.action === "more-info" && this.config.entity) {
      fireEvent(this, "hass-more-info", { entityId: this.config.entity });
    }
  }
  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith("#")) {
      let num = parseInt(color.replace("#", ""), 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 255) + amt, B = (num & 255) + amt;
      return "#" + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }
  static getConfigElement() {
    return document.createElement("foundry-slider-editor");
  }
  static get supportsCardResize() {
    return true;
  }
  getGridOptions() {
    return {
      columns: 6,
      rows: 6,
      min_columns: 3,
      min_rows: 3
    };
  }
  static getStubConfig() {
    return {
      title: "Slider",
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      ring_style: "brass",
      face_color: "#8c7626",
      plate_color: "#8c7626",
      plate_transparent: false,
      rivet_color: "#6a5816",
      slider_color: "#444444",
      knob_color: "#c9a961",
      knob_shape: "square",
      knob_size: 100,
      tick_color: "rgba(0,0,0,0.22)",
      font_bg_color: "#ffffff",
      font_color: "#000000",
      title_color: "#000000",
      title_font_size: 14,
      value_font_size: 36,
      show_value: true,
      grid_options: {
        columns: 6,
        rows: 6
      },
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "everywhere",
      aged_texture_intensity: 50
    };
  }
};
if (!customElements.get("foundry-slider-card")) {
  customElements.define("foundry-slider-card", FoundrySliderCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-slider-card",
  name: "Foundry Slider",
  preview: true,
  description: "A vertical retro-style slider with LED display and 70s aesthetic."
});

// src/cards/foundry-slider-editor.js
var FoundrySliderEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = { ...config };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._form = null;
      this.render();
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      const style = document.createElement("style");
      style.textContent = `
        /* Layout adjustments */
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
      this._form = document.createElement("ha-form");
      this._form.addEventListener(
        "value-changed",
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form);
      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-btn";
      resetBtn.textContent = "\u26A0\uFE0F Reset to Default Configuration";
      resetBtn.title = "Reset all settings to defaults (keeps entity)";
      resetBtn.addEventListener("click", () => this._resetToDefaults());
      this._root.appendChild(resetBtn);
    }
    if (this._form) this._form.hass = this._hass;
    const formData = this._configToForm(this._config);
    this._form.schema = this._getSchema();
    this._form.data = formData;
    this._form.computeLabel = (s) => s.label || s.name;
  }
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "title_color",
        "font_color",
        "font_bg_color",
        "ring_style",
        "plate_transparent",
        "glass_effect_enabled",
        "wear_level",
        "aged_texture",
        "aged_texture_intensity",
        "slider_color",
        "knob_color",
        "tick_color"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }
  _resetToDefaults() {
    if (!confirm(
      "Reset all settings to defaults? This will keep your entity but reset all other configuration."
    )) {
      return;
    }
    const entity = this._config.entity;
    this._updateConfig({
      entity,
      title: "Slider",
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      ring_style: "brass",
      face_color: "#8c7626",
      plate_color: "#8c7626",
      plate_transparent: false,
      rivet_color: "#6a5816",
      slider_color: "#444444",
      knob_color: "#c9a961",
      knob_shape: "square",
      knob_size: 100,
      tick_color: "rgba(0,0,0,0.22)",
      font_bg_color: "#ffffff",
      font_color: "#000000",
      title_color: "#3e2723",
      title_font_size: 14,
      value_font_size: 36,
      show_value: true,
      wear_level: 50,
      aged_texture: "everywhere",
      aged_texture_intensity: 50
    });
  }
  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }
  _configToForm(config) {
    const data = { ...config };
    data.appearance = {
      theme: config.theme ?? "none",
      ring_style: config.ring_style ?? "brass",
      face_color: this._hexToRgb(
        config.face_color ?? config.background_color ?? config.plate_color ?? config.slider_background_color ?? "#8c7626"
      ) ?? [140, 118, 38],
      plate_color: this._hexToRgb(config.plate_color ?? "#8c7626") ?? [
        140,
        118,
        38
      ],
      title_color: this._hexToRgb(config.title_color ?? "#3e2723") ?? [
        62,
        39,
        35
      ],
      plate_transparent: config.plate_transparent ?? false,
      rivet_color: this._hexToRgb(config.rivet_color ?? "#6a5816") ?? [
        106,
        88,
        22
      ],
      slider_color: this._hexToRgb(config.slider_color ?? "#444444") ?? [
        68,
        68,
        68
      ],
      tick_color: this._colorToRgb(config.tick_color) ?? [0, 0, 0]
    };
    data.knob_settings = {
      knob_shape: config.knob_shape ?? "square",
      knob_size: config.knob_size ?? 100,
      knob_color: this._hexToRgb(config.knob_color ?? "#c9a961") ?? [
        201,
        169,
        97
      ]
    };
    data.led_settings = {
      show_value: config.show_value ?? true,
      font_bg_color: this._hexToRgb(config.font_bg_color ?? "#ffffff") ?? [
        255,
        255,
        255
      ],
      font_color: this._hexToRgb(config.font_color ?? "#000000") ?? [0, 0, 0],
      title_font_size: config.title_font_size ?? 14,
      value_font_size: config.value_font_size ?? 36
    };
    data.effects = {
      wear_level: config.wear_level ?? 50,
      aged_texture: (config.aged_texture ?? "everywhere") !== "none",
      aged_texture_intensity: config.aged_texture_intensity ?? 50
    };
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config };
    Object.keys(formData).forEach((k) => {
      if (["appearance", "knob_settings", "led_settings", "effects"].includes(k))
        return;
      config[k] = formData[k];
    });
    if (formData.appearance) {
      Object.assign(config, formData.appearance);
      config.face_color = this._rgbToHex(config.face_color);
      delete config.background_color;
      config.plate_color = this._rgbToHex(config.plate_color);
      config.title_color = this._rgbToHex(config.title_color);
      config.rivet_color = this._rgbToHex(config.rivet_color);
      config.slider_color = this._rgbToHex(config.slider_color);
      config.tick_color = this._rgbToHex(config.tick_color);
    }
    if (formData.knob_settings) {
      Object.assign(config, formData.knob_settings);
      config.knob_color = this._rgbToHex(config.knob_color);
    }
    if (formData.led_settings) {
      Object.assign(config, formData.led_settings);
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
      config.font_color = this._rgbToHex(config.font_color);
    }
    if (formData.effects) {
      Object.assign(config, formData.effects);
      config.aged_texture = config.aged_texture ? "everywhere" : "none";
    }
    return config;
  }
  _getSchema() {
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "title", selector: { text: {} } },
      { name: "min", label: "Minimum", selector: { number: { mode: "box" } } },
      { name: "max", label: "Maximum", selector: { number: { mode: "box" } } },
      {
        name: "step",
        label: "Step",
        selector: { number: { mode: "box", step: 0.1 } }
      },
      {
        name: "value",
        label: "Initial Value",
        selector: { number: { mode: "box" } }
      },
      {
        name: "appearance",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                options: [
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "face_color",
                label: "Face Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "title_color",
                label: "Title Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "slider_color",
                label: "Track Color",
                selector: { color_rgb: {} }
              },
              {
                name: "tick_color",
                label: "Tick Mark Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          }
        ]
      },
      {
        name: "knob_settings",
        type: "expandable",
        title: "Knob Settings",
        schema: [
          {
            name: "knob_shape",
            label: "Knob Shape",
            selector: {
              select: {
                options: [
                  { value: "circular", label: "Circular" },
                  { value: "square", label: "Square" },
                  { value: "rectangular", label: "Rectangular" }
                ]
              }
            }
          },
          {
            name: "knob_size",
            label: "Knob Size",
            selector: {
              number: {
                min: 0,
                max: 100,
                step: 1,
                mode: "slider"
              }
            }
          },
          {
            name: "knob_color",
            label: "Knob Color",
            selector: { color_rgb: {} }
          }
        ]
      },
      {
        name: "led_settings",
        type: "expandable",
        title: "LED Display",
        schema: [
          {
            name: "show_value",
            label: "Show Value",
            selector: { boolean: {} }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "font_bg_color",
                label: "LED Background",
                selector: { color_rgb: {} }
              },
              {
                name: "font_color",
                label: "LED Text Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "title_font_size",
                label: "Title Font Size",
                selector: {
                  number: {
                    min: 8,
                    max: 24,
                    mode: "slider"
                  }
                }
              },
              {
                name: "value_font_size",
                label: "Value Font Size",
                selector: {
                  number: {
                    min: 20,
                    max: 60,
                    mode: "slider"
                  }
                }
              }
            ]
          }
        ]
      },
      {
        name: "effects",
        type: "expandable",
        title: "Visual Effects",
        schema: [
          {
            name: "wear_level",
            label: "Wear Level",
            selector: {
              number: {
                min: 0,
                max: 100,
                mode: "slider",
                unit_of_measurement: "%"
              }
            }
          },
          {
            name: "aged_texture",
            label: "Aged Texture",
            selector: { boolean: {} }
          },
          {
            name: "aged_texture_intensity",
            label: "Texture Intensity",
            selector: {
              number: {
                min: 0,
                max: 100,
                mode: "slider",
                unit_of_measurement: "%"
              }
            }
          }
        ]
      }
    ];
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _colorToRgb(color) {
    if (!color) return null;
    if (Array.isArray(color) && color.length === 3) return color;
    if (typeof color === "string") {
      const hex = this._hexToRgb(color);
      if (hex) return hex;
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (match) {
        return [Number(match[1]), Number(match[2]), Number(match[3])];
      }
    }
    return null;
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map(
      (n) => Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
};
if (!customElements.get("foundry-slider-editor")) {
  customElements.define("foundry-slider-editor", FoundrySliderEditor);
}

// src/cards/foundry-entities-card.js
var FoundryEntitiesCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this.config = { ...config };
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this.render();
        }
      });
    }
    if (!this.config.entities) {
      throw new Error("Entities list is required");
    }
    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }
    this.config.ring_style = this.config.ring_style || "brass";
    this.config.title = this.config.title !== void 0 ? this.config.title : "Entities";
    this.config.title_font_size = this.config.title_font_size !== void 0 ? this.config.title_font_size : 14;
    this.config.title_color = this.config.title_color || "#3e2723";
    this.config.plate_color = this.config.plate_color || "#f5f5f5";
    this.config.plate_transparent = this.config.plate_transparent !== void 0 ? this.config.plate_transparent : false;
    this.config.rivet_color = this.config.rivet_color || "#6d5d4b";
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    this.config.font_color = this.config.font_color || "#000000";
    this.config.wear_level = this.config.wear_level !== void 0 ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== void 0 ? this.config.glass_effect_enabled : true;
    this.config.aged_texture = this.config.aged_texture !== void 0 ? this.config.aged_texture : "everywhere";
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== void 0 ? this.config.aged_texture_intensity : 50;
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
    this.render();
  }
  set hass(hass) {
    this._hass = hass;
    this._updateValues();
  }
  _updateValues() {
    if (!this.shadowRoot) return;
    if (!this._hass || !this.config) return;
    const now = /* @__PURE__ */ new Date();
    this.config.entities.forEach((entityConf, index) => {
      let entityId = typeof entityConf === "string" ? entityConf : entityConf.entity;
      if (!entityId) return;
      const stateObj = this._hass.states[entityId];
      const stateEl = this.shadowRoot.getElementById(`state-${index}`);
      if (stateEl) {
        const stateStr = stateObj ? stateObj.state : "N/A";
        const unit = stateObj && stateObj.attributes.unit_of_measurement ? stateObj.attributes.unit_of_measurement : "";
        stateEl.textContent = `${stateStr}${unit ? " " + unit : ""}`;
      }
      const secondaryEl = this.shadowRoot.getElementById(`secondary-${index}`);
      const secondaryType = typeof entityConf === "object" ? entityConf.secondary_info : null;
      if (secondaryEl && secondaryType && secondaryType !== "none") {
        if (stateObj) {
          if (secondaryType === "entity-id") {
            secondaryEl.textContent = entityId;
          } else if (secondaryType === "state") {
            const unit = stateObj.attributes.unit_of_measurement || "";
            secondaryEl.textContent = `${stateObj.state}${unit ? " " + unit : ""}`;
          } else if (secondaryType === "last-updated" || secondaryType === "last-changed") {
            const tsStr = secondaryType === "last-updated" ? stateObj.last_updated : stateObj.last_changed;
            const ts = new Date(tsStr);
            const diff = Math.floor((now - ts) / 1e3);
            let secondary = "";
            if (diff < 60) secondary = `${diff}s ago`;
            else if (diff < 3600) secondary = `${Math.floor(diff / 60)}m ago`;
            else if (diff < 86400)
              secondary = `${Math.floor(diff / 3600)}h ago`;
            else secondary = `${Math.floor(diff / 86400)}d ago`;
            secondaryEl.textContent = secondary;
          }
        } else {
          secondaryEl.textContent = "";
        }
      }
    });
  }
  render() {
    const config = this.config;
    const title = config.title || "";
    const uid = this._uniqueId;
    const titleFontSize = config.title_font_size;
    const titleColor = config.title_color;
    const ringStyle = config.ring_style;
    const rivetColor = config.rivet_color;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;
    const fontBgColor = config.config_bg_color || config.font_bg_color;
    const fontColor = config.font_color;
    const wearLevel = config.wear_level !== void 0 ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== void 0 ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== void 0 ? config.aged_texture : "everywhere";
    const agedTextureIntensity = config.aged_texture_intensity !== void 0 ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = plateTransparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    const titleFontFamily = "Georgia, serif";
    const rowHeightSingle = 15;
    const rowHeightDouble = 26;
    let currentY = 12;
    const rowLayouts = config.entities.map((ent) => {
      const isString = typeof ent === "string";
      const hasSecondary = !isString && ent.secondary_info && ent.secondary_info !== "none";
      const height = hasSecondary ? rowHeightDouble : rowHeightSingle;
      const y = currentY;
      currentY += height;
      return {
        original: ent,
        y,
        height,
        hasSecondary,
        // Extract core data for easier usage
        entityId: isString ? ent : ent.entity,
        name: isString ? ent : ent.name || ent.entity,
        secondaryInfo: hasSecondary ? ent.secondary_info : null
      };
    });
    const totalContentHeight = currentY + 6;
    const screenHeight = Math.max(totalContentHeight, 60);
    const rimHeight = screenHeight + 24;
    const plateHeight = rimHeight + 50;
    const viewBoxHeight = plateHeight + 20;
    const plateWidth = 250;
    const plateX = 5;
    const plateY = 10;
    const rimWidth = 220;
    const rimX = 20;
    const rimY = 35;
    this.shadowRoot.innerHTML = `
      <style>
        .digital-font {
          font-family: 'ds-digitalnormal', monospace; 
        }
        :host {
          display: block;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
        }
        .card {
          position: relative;
          cursor: pointer;          
        }
        .container {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }
        .vector-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${rivetColor};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${title}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="container" role="presentation">
            <svg class="vector-svg" viewBox="0 0 260 ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="screenGrad-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${fontBgColor};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(fontBgColor, -20)};stop-opacity:1" />
                </radialGradient>
                ${this.renderGradients(uid)}
                
                <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
                  <feComposite in="blended" in2="SourceGraphic" operator="in"/>
                </filter>
              </defs>
              
              <!-- Plate -->
              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="20" ry="20" 
                    fill="${plateTransparent ? "none" : plateColor}" 
                    stroke="${plateTransparent ? "none" : "#888"}" stroke-width="0.5"
                    filter="${effectiveAgedTexture === "everywhere" && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              <!-- Rivets -->
              ${this.renderRivets(plateWidth, plateHeight, plateX, plateY)}

              <!-- Ring & Screen -->
              ${this.renderSquareRim(ringStyle, uid, fontBgColor, glassEffectEnabled, rimX, rimY, rimWidth, rimHeight)}
              
              <!-- Title -->
              ${title ? `<text x="130" y="28" text-anchor="middle" font-size="${titleFontSize}" font-weight="bold" fill="${titleColor}" font-family="${titleFontFamily}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${title}</text>` : ""}
              
              <!-- Entities List -->
              <g transform="translate(${rimX + 12}, ${rimY + 12})" font-family="ds-digitaldot" font-size="8" fill="${fontColor}" stroke="${fontColor}" stroke-width="0.2" style="letter-spacing: 1px; pointer-events: none;">
                ${this.renderEntitiesLoop(rowLayouts)}
              </g>

              <!-- Wear Marks -->
              ${this.renderWearMarks(wearLevel, viewBoxHeight)}

            </svg>
          </div>
        </div>
      </ha-card>
    `;
    this.shadowRoot.querySelectorAll(".entity-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        const entityId = row.getAttribute("data-entity-id");
        if (entityId) {
          fireEvent(this, "hass-more-info", { entityId });
        }
      });
    });
    this._updateValues();
  }
  renderEntitiesLoop(rowLayouts) {
    return rowLayouts.map((layout, i) => {
      const { entityId, name, hasSecondary, y, height } = layout;
      const yTop = y;
      const yText = hasSecondary ? yTop : yTop + 2;
      const ySecondary = yTop + 10;
      const yState = hasSecondary ? yTop + 6 : yTop + 2;
      const hitWidth = 220;
      return `
             <g class="entity-row" data-entity-id="${entityId}" style="cursor: pointer;">
                 <!-- Hit target for clicking -->
                 <rect x="0" y="${yTop - 6}" width="${hitWidth}" height="${height}" fill="transparent" stroke="none" pointer-events="all"/>
                 <text x="10" y="${yText}" text-anchor="start" style="pointer-events: none;">${name}</text>
                 ${hasSecondary ? `<text id="secondary-${i}" x="22" y="${ySecondary}" text-anchor="start" font-size="8" opacity="0.7" style="pointer-events: none;"></text>` : ""}
                 <text id="state-${i}" x="190" y="${yState}" text-anchor="end" style="pointer-events: none;">--</text>
             </g>
          `;
    }).join("");
  }
  renderRivets(w, h, x, y) {
    const offset = 15;
    const rivets = [
      { cx: x + offset, cy: y + offset },
      { cx: x + w - offset, cy: y + offset },
      { cx: x + offset, cy: y + h - offset },
      { cx: x + w - offset, cy: y + h - offset }
    ];
    return rivets.map(
      (r) => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" class="screw-detail" transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `
    ).join("");
  }
  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";
    const bevelX = x + 8;
    const bevelY = y + 8;
    const bevelW = w - 16;
    const bevelH = h - 16;
    const screenX = bevelX + 4;
    const screenY = bevelY + 4;
    const screenW = bevelW - 8;
    const screenH = bevelH - 8;
    return `
      <!-- Outer Frame (The Ring) -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <!-- Face Background (Screen Color) -->
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="${bgColor}" stroke="none" />

      <!-- Glass Glare (Top 20%) -->
      ${glassEffectEnabled ? `<path d="M ${screenX} ${screenY} L ${screenX + screenW} ${screenY} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ""}

      <!-- Screen Frame (Shadow & Border) - Drawn ON TOP -->
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <!-- Inner Bevel -->
      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }
  // Reuse from Digital Clock
  renderWearMarks(wearLevel, viewBoxHeight) {
    if (wearLevel === 0) return "";
    return `
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="210" cy="${viewBoxHeight - 40}" r="1.5" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
    `;
  }
  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith("#")) {
      let num = parseInt(color.replace("#", ""), 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 255) + amt, B = (num & 255) + amt;
      return "#" + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }
  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "white":
        return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper":
        return { grad: `copperRim-${uid}`, stroke: "#8B4513" };
      case "blue":
        return { grad: `blueRim-${uid}`, stroke: "#104E8B" };
      case "green":
        return { grad: `greenRim-${uid}`, stroke: "#006400" };
      case "red":
        return { grad: `redRim-${uid}`, stroke: "#8B0000" };
      default:
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
    }
  }
  renderGradients(uid) {
    return `
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `;
  }
  static getConfigElement() {
    return document.createElement("foundry-entities-editor");
  }
  static getStubConfig() {
    return {
      entities: [
        { entity: "sensor.sun_next_dawn", name: "Dawn" },
        { entity: "sensor.sun_next_dusk", name: "Dusk" }
      ],
      title: "Foundry Data",
      title_font_size: 14,
      title_color: "#3e2723",
      ring_style: "brass",
      rivet_color: "#6a5816",
      plate_color: "#8c7626",
      plate_transparent: false,
      font_bg_color: "#ffffff",
      font_color: "#000000",
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "everywhere",
      aged_texture_intensity: 50
    };
  }
};
if (!customElements.get("foundry-entities-card")) {
  customElements.define("foundry-entities-card", FoundryEntitiesCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-entities-card",
  name: "Foundry Entities",
  preview: true,
  description: "A digital display for a list of entities."
});

// src/cards/foundry-entities-editor.js
var fireEvent3 = (node, type2, detail, options) => {
  options = options || {};
  detail = detail === null || detail === void 0 ? {} : detail;
  const event = new Event(type2, {
    bubbles: options.bubbles === void 0 ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === void 0 ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};
var FoundryEntitiesEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = { ...config };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      this._entitiesForm = null;
      this._settingsForm = null;
      this._toggleBtn = null;
      this._renderedMode = null;
      if (!this._advancedMode) {
        this.render();
      }
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    this.render();
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      this._root.className = "card-config";
      const style = document.createElement("style");
      style.textContent = `
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                .sub-config { display: flex; flex-direction: column; gap: 8px; }
                .toggle-button { 
                    background: var(--primary-color); 
                    color: var(--text-primary-color);
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    align-self: flex-start;
                    font-weight: 500;
                    margin-top: -8px; 
                    margin-bottom: 8px;
                }
                .toggle-button:hover {
                    background: var(--primary-color-dark, var(--primary-color));
                }
                .header {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
            `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
    }
    const targetMode = this._advancedMode ? "advanced" : "standard";
    if (this._renderedMode !== targetMode) {
      this._root.innerHTML = "";
      this._renderedMode = targetMode;
      if (this._advancedMode) {
        this._buildAdvancedUI();
      } else {
        this._buildStandardUI();
      }
    }
    if (this._advancedMode) {
      this._updateAdvancedUI();
    } else {
      this._updateStandardUI();
    }
  }
  _buildAdvancedUI() {
    const btn = document.createElement("button");
    btn.className = "toggle-button";
    btn.textContent = "\u2190 Back to Settings";
    btn.onclick = () => {
      this._advancedMode = false;
      this.render();
    };
    this._root.appendChild(btn);
    const header = document.createElement("div");
    header.className = "header";
    header.textContent = "Edit Entity Details";
    this._root.appendChild(header);
    this._advancedForm = document.createElement("ha-form");
    this._advancedForm.computeLabel = this._computeLabel;
    this._advancedForm.addEventListener(
      "value-changed",
      (ev) => this._handleFormChangedAdvanced(ev)
    );
    this._root.appendChild(this._advancedForm);
  }
  _updateAdvancedUI() {
    if (this._advancedForm) {
      this._advancedForm.hass = this._hass;
      this._advancedForm.data = this._configToFormAdvanced(this._config);
      this._advancedForm.schema = this._getSchemaAdvanced();
    }
  }
  _buildStandardUI() {
    this._entitiesForm = document.createElement("ha-form");
    this._entitiesForm.computeLabel = this._computeLabel;
    this._entitiesForm.addEventListener(
      "value-changed",
      (ev) => this._handleFormChanged(ev)
    );
    this._root.appendChild(this._entitiesForm);
    this._toggleBtn = document.createElement("button");
    this._toggleBtn.className = "toggle-button";
    this._toggleBtn.textContent = "Edit Entity Details / Overrides \u2192";
    this._toggleBtn.onclick = () => {
      this._advancedMode = true;
      this.render();
    };
    this._root.appendChild(this._toggleBtn);
    this._settingsForm = document.createElement("ha-form");
    this._settingsForm.computeLabel = this._computeLabel;
    this._settingsForm.addEventListener(
      "value-changed",
      (ev) => this._handleFormChanged(ev)
    );
    this._root.appendChild(this._settingsForm);
  }
  _updateStandardUI() {
    const formData = this._configToForm(this._config);
    if (this._entitiesForm) {
      this._entitiesForm.hass = this._hass;
      this._entitiesForm.data = formData;
      this._entitiesForm.schema = [this._getSchemaTop()[0]];
    }
    if (this._toggleBtn) {
      const hasEntities = this._config.entities && this._config.entities.length > 0;
      this._toggleBtn.style.display = hasEntities ? "block" : "none";
    }
    if (this._settingsForm) {
      this._settingsForm.hass = this._hass;
      this._settingsForm.data = formData;
      this._settingsForm.schema = [
        this._getSchemaTop()[1],
        ...this._getSchemaBottom()
      ];
    }
  }
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "ring_style",
        "title_color",
        "font_color",
        "font_bg_color",
        "number_color",
        "primary_tick_color",
        "secondary_tick_color",
        "background_style",
        "face_color",
        "liquid_color",
        "needle_color",
        "plate_transparent",
        "glass_effect_enabled",
        "wear_level",
        "aged_texture",
        "aged_texture_intensity",
        "slider_color",
        "knob_color",
        "tick_color"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._config = newConfig;
      fireEvent3(this, "config-changed", { config: this._config });
    }
  }
  _handleFormChangedAdvanced(ev) {
    const newConfig = this._formToConfigAdvanced(ev.detail.value);
    this._config = newConfig;
    fireEvent3(this, "config-changed", { config: this._config });
  }
  _configToForm(config) {
    const data = { ...config };
    if (Array.isArray(config.entities)) {
      data.entities = config.entities.map((e) => {
        if (typeof e === "string") return e;
        return e.entity || "";
      }).filter(Boolean);
    } else {
      data.entities = [];
    }
    data.theme = config.theme ?? "none";
    data.title = config.title ?? "Entities";
    data.title_font_size = config.title_font_size ?? 14;
    data.title_color = this._hexToRgb(config.title_color ?? "#3e2723") ?? [
      62,
      39,
      35
    ];
    data.ring_style = config.ring_style ?? "brass";
    data.font_bg_color = this._hexToRgb(config.font_bg_color ?? "#ffffff") ?? [
      255,
      255,
      255
    ];
    data.font_color = this._hexToRgb(config.font_color ?? "#000000") ?? [
      0,
      0,
      0
    ];
    data.rivet_color = this._hexToRgb(config.rivet_color ?? "#6d5d4b") ?? [
      109,
      93,
      75
    ];
    data.plate_color = this._hexToRgb(config.plate_color ?? "#f5f5f5") ?? [
      245,
      245,
      245
    ];
    data.plate_transparent = config.plate_transparent ?? false;
    data.wear_level = config.wear_level ?? 50;
    data.glass_effect_enabled = config.glass_effect_enabled ?? true;
    data.aged_texture = config.aged_texture ?? "everywhere";
    data.aged_texture_intensity = config.aged_texture_intensity ?? 50;
    return data;
  }
  _configToFormAdvanced(config) {
    const data = {};
    if (Array.isArray(config.entities)) {
      config.entities.forEach((e, i) => {
        const entityObj = typeof e === "string" ? { entity: e } : e;
        data[`name_${i}`] = entityObj.name || "";
        data[`info_${i}`] = entityObj.secondary_info || "none";
      });
    }
    return data;
  }
  _formToConfig(formData) {
    const existingEntities = this._config.entities || [];
    let mergedEntities = existingEntities;
    if (formData.entities !== void 0) {
      const newEntities = formData.entities || [];
      const lookup = /* @__PURE__ */ new Map();
      existingEntities.forEach((e) => {
        if (typeof e === "string") lookup.set(e, e);
        else if (e && e.entity) lookup.set(e.entity, e);
      });
      mergedEntities = newEntities.map((id) => lookup.get(id) || id);
    }
    const config = { ...this._config, ...formData };
    if (formData.entities !== void 0) {
      config.entities = mergedEntities;
    }
    if (config.title_color)
      config.title_color = this._rgbToHex(config.title_color);
    if (config.font_bg_color)
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
    if (config.font_color)
      config.font_color = this._rgbToHex(config.font_color);
    if (config.rivet_color)
      config.rivet_color = this._rgbToHex(config.rivet_color);
    if (config.plate_color)
      config.plate_color = this._rgbToHex(config.plate_color);
    return config;
  }
  _formToConfigAdvanced(formData) {
    const config = { ...this._config };
    if (Array.isArray(config.entities)) {
      config.entities = config.entities.map((e, i) => {
        const currentEntityId = typeof e === "string" ? e : e.entity;
        const newName = formData[`name_${i}`];
        const newInfo = formData[`info_${i}`];
        if ((!newName || newName === "") && (!newInfo || newInfo === "none")) {
          return currentEntityId;
        }
        return {
          entity: currentEntityId,
          name: newName,
          secondary_info: newInfo
        };
      });
    }
    return config;
  }
  _getSchemaTop() {
    return [
      {
        name: "entities",
        label: "Entities (List Management)",
        selector: { entity: { multiple: true } }
      },
      {
        name: "",
        type: "expandable",
        title: "Layout & Text",
        schema: [
          { name: "title", label: "Title", selector: { text: {} } },
          {
            name: "title_font_size",
            label: "Title Font Size",
            selector: { number: { mode: "box" } }
          }
        ]
      }
    ];
  }
  _getSchemaBottom() {
    return [
      {
        name: "",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "font_bg_color",
                label: "Screen Background",
                selector: { color_rgb: {} }
              },
              {
                name: "font_color",
                label: "Digital Font Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              },
              {
                name: "title_color",
                label: "Title Color",
                selector: { color_rgb: {} }
              },
              {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          },
          {
            name: "glass_effect_enabled",
            label: "Glass Effect",
            selector: { boolean: {} }
          },
          {
            name: "wear_level",
            label: "Wear Level (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "aged_texture",
            label: "Aged Texture Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          {
            name: "aged_texture_intensity",
            label: "Texture Intensity (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          }
        ]
      }
    ];
  }
  _getSchemaAdvanced() {
    const entities = this._config.entities || [];
    const schema2 = [];
    entities.forEach((e, i) => {
      const entId = typeof e === "string" ? e : e.entity;
      schema2.push({
        name: "",
        type: "expandable",
        title: `${entId}`,
        schema: [
          { name: `name_${i}`, label: "Name Override", selector: { text: {} } },
          {
            name: `info_${i}`,
            label: "Secondary Info",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "entity-id", label: "Entity ID" },
                  { value: "state", label: "State" },
                  { value: "last-updated", label: "Last Updated" },
                  { value: "last-changed", label: "Last Changed" }
                ]
              }
            }
          }
        ]
      });
    });
    if (schema2.length === 0) {
      schema2.push({
        name: "",
        type: "constant",
        value: "No entities selected. Go back to add entities."
      });
    }
    return schema2;
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map(
      (n) => Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  _computeLabel(schema2) {
    if (schema2.label) return schema2.label;
    return schema2.name;
  }
};
if (!customElements.get("foundry-entities-editor")) {
  customElements.define("foundry-entities-editor", FoundryEntitiesEditor);
}

// src/cards/foundry-button-card.js
var FoundryButtonCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._subscribedTemplates = /* @__PURE__ */ new Map();
  }
  // ... (existing code)
  setConfig(config) {
    this.config = { ...config };
    this.config.ring_style = this.config.ring_style || "brass";
    this.config.plate_color = this.config.plate_color || "#f5f5f5";
    this.config.plate_transparent = this.config.plate_transparent !== void 0 ? this.config.plate_transparent : false;
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    this.config.font_color = this.config.font_color || "#000000";
    this.config.card_width = this.config.card_width || 240;
    this.config.wear_level = this.config.wear_level !== void 0 ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== void 0 ? this.config.glass_effect_enabled : true;
    this.config.aged_texture = this.config.aged_texture !== void 0 ? this.config.aged_texture : "everywhere";
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== void 0 ? this.config.aged_texture_intensity : 50;
    this.config.icon_color = this.config.icon_color || "var(--primary-text-color)";
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          if (this.shadowRoot) {
            this.shadowRoot.innerHTML = "";
          }
          this._updateRender();
        }
      });
    }
  }
  set hass(hass) {
    this._hass = hass;
    this._updateTemplateSubscriptions();
    this._updateRender();
  }
  connectedCallback() {
    this._updateTemplateSubscriptions();
  }
  disconnectedCallback() {
    this._unsubscribeAll();
  }
  _unsubscribeAll() {
    this._subscribedTemplates.forEach((unsub) => {
      if (typeof unsub === "function") unsub();
      else if (unsub && unsub.then) unsub.then((u) => u && u());
    });
    this._subscribedTemplates.clear();
  }
  async _updateTemplateSubscriptions() {
    if (!this._hass || !this.config) return;
    const templates = {
      primary_info: this.config.primary_info,
      secondary_info: this.config.secondary_info,
      secondary_info_2: this.config.secondary_info_2,
      icon_color: this.config.icon_color
    };
    for (const [key, template] of Object.entries(templates)) {
      if (!template || typeof template !== "string") continue;
      if (!template.includes("{{") && !template.includes("{%")) {
        if (this[`_${key}`] !== template) {
          this[`_${key}`] = template;
          this._requestRender();
        }
        continue;
      }
      if (this._subscribedTemplates.has(key)) continue;
      try {
        const unsub = await this._hass.connection.subscribeMessage(
          (result) => {
            this[`_${key}`] = result.result;
            this._requestRender();
          },
          {
            type: "render_template",
            template,
            variables: {
              entity: this.config.entity,
              user: this._hass.user.name
            }
          }
        );
        this._subscribedTemplates.set(key, unsub);
      } catch (e) {
        console.error("Error subscribing to template", e);
        this[`_${key}`] = `Error: ${e.message}`;
        this._requestRender();
      }
    }
  }
  _requestRender() {
    if (!this._renderPending) {
      this._renderPending = true;
      requestAnimationFrame(() => {
        this._renderPending = false;
        this._updateRender();
      });
    }
  }
  _updateRender() {
    if (!this.shadowRoot) return;
    if (!this.shadowRoot.getElementById("actionRoot")) {
      this.renderSkeleton();
    }
    this.updateContent();
  }
  renderSkeleton() {
    const config = this.config;
    const uid = this._uniqueId;
    const ringStyle = config.ring_style;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;
    const fontBgColor = config.font_bg_color;
    const cardWidth = config.card_width !== void 0 ? config.card_width : 240;
    const wearLevel = config.wear_level !== void 0 ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== void 0 ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== void 0 ? config.aged_texture : "everywhere";
    const agedTextureIntensity = config.aged_texture_intensity !== void 0 ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = plateTransparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    const width = 110;
    const height = 110;
    const plateWidth = width - 10;
    const plateHeight = height - 10;
    const plateX = 5;
    const plateY = 5;
    const rimWidth = plateWidth - 10;
    const rimHeight = plateHeight - 10;
    const rimX = plateX + 5;
    const rimY = plateY + 5;
    this.shadowRoot.innerHTML = `
      <style>
        .digital-font {
          font-family: 'ds-digitaldot', monospace; 
        }
        :host {
          display: block;
          height: 100%;
        }
        ha-card {
          background: transparent;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          position: relative;
          cursor: pointer;
          width: 100%;
          height: 100%;
          aspect-ratio: 1 / 1;  

          max-width: ${cardWidth}px;       /* Stop growing after this width */
          margin: 0 auto;         /* Center the card if the space is wider */

          container-type: size; 
        }
        .container {
          position: relative;
          width: 100%;
          height: auto;
        }
        .vector-svg {
          width: 100%;
          height: 100%;
          max-height: 100%;  
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
      </style>
      <ha-card role="button" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="container" role="presentation">
            <svg class="vector-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="screenGrad-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${fontBgColor};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(fontBgColor, -20)};stop-opacity:1" />
                </radialGradient>
                ${this.renderGradients(uid)}
                
                <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
                  <feComposite in="blended" in2="SourceGraphic" operator="in"/>
                </filter>
              </defs>
              
              <!-- Plate -->
              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="15" ry="15" 
                    fill="${plateTransparent ? "none" : plateColor}" 
                    stroke="${plateTransparent ? "none" : "#888"}" stroke-width="0.5"
                    filter="${effectiveAgedTexture === "everywhere" && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              <!-- Ring & Screen -->
              ${this.renderSquareRim(ringStyle, uid, fontBgColor, glassEffectEnabled, rimX, rimY, rimWidth, rimHeight)}
              
              <!-- Content Group -->
               <g id="content-group" font-family="ds-digitaldot" text-anchor="middle" style="pointer-events: none;">
                   <!-- Icon -->
                   <g id="icon-container" transform="translate(${width / 2}, 35)">
                        <!-- Placeholder for icon, will render via HA Icon element if possible or font icon -->
                   </g>

                   <!-- Text Lines -->
                   <text id="primary-text" x="${width / 2}" y="60" font-size="12" fill="${this.config.font_color}">--</text>
                   <text id="secondary-text" x="${width / 2}" y="75" font-size="9" fill="${this.config.font_color}" opacity="0.8">--</text>
                   <text id="secondary-text-2" x="${width / 2}" y="88" font-size="9" fill="${this.config.font_color}" opacity="0.8">--</text>
               </g>

              <!-- Wear Marks -->
              ${this.renderWearMarks(wearLevel, height)}

            </svg>
             <!-- HTML Overlay for Icon (easier to use HA-ICON) -->
             <div style="position: absolute; top: 15%; left: 0; width: 100%; text-align: center; pointer-events: none;">
                <ha-icon id="icon-element" icon="${this.config.icon || "mdi:help"}" style="color: var(--primary-text-color); --mdc-icon-size: 25cqmin;"></ha-icon>
             </div>
          </div>
        </div>
      </ha-card>
    `;
    const card = this.shadowRoot.querySelector("ha-card");
    card.addEventListener("click", this._handleTap.bind(this));
  }
  _handleTap(e) {
    if (e) {
      e.stopPropagation();
    }
    const config = this.config;
    if (!config || !config.tap_action) return;
    if (config.tap_action.action === "none") return;
    handleAction(this, this._hass, config, config.tap_action);
  }
  updateContent() {
    const pText = this.shadowRoot.getElementById("primary-text");
    const sText = this.shadowRoot.getElementById("secondary-text");
    const sText2 = this.shadowRoot.getElementById("secondary-text-2");
    const iconEl = this.shadowRoot.getElementById("icon-element");
    if (pText) pText.textContent = this._primary_info || "";
    if (sText) sText.textContent = this._secondary_info || "";
    if (sText2) sText2.textContent = this._secondary_info_2 || "";
    if (iconEl && this._icon_color) {
      iconEl.style.color = this._icon_color;
    }
    if (iconEl && this.config.icon) {
      iconEl.setAttribute("icon", this.config.icon);
    }
  }
  renderRivets(_w, _h, _x, _y) {
    return "";
  }
  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";
    const bevelX = x + 4;
    const bevelY = y + 4;
    const bevelW = w - 8;
    const bevelH = h - 8;
    const screenX = bevelX + 3;
    const screenY = bevelY + 3;
    const screenW = bevelW - 6;
    const screenH = bevelH - 6;
    return `
      <!-- Outer Frame (The Ring) -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" ry="12" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <!-- Inner Bevel -->
      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>
      
      <!-- Face Background (Screen) -->
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="8" ry="8" 
            fill="${bgColor}" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>
      
      <!-- Glass Glare -->
      ${glassEffectEnabled ? `<path d="M ${screenX + 8} ${screenY} L ${screenX + screenW - 8} ${screenY} Q ${screenX + screenW} ${screenY} ${screenX + screenW} ${screenY + 8} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} L ${screenX} ${screenY + 8} Q ${screenX} ${screenY} ${screenX + 8} ${screenY} Z" fill="url(#glassGrad-${uid})" style="pointer-events: none;" />` : ""}
    `;
  }
  // Reuse from Entities Card / Digital Clock
  renderWearMarks(wearLevel, viewBoxHeight) {
    if (wearLevel === 0) return "";
    return `
        <circle cx="20" cy="20" r="1" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="${viewBoxHeight - 20}" cy="${viewBoxHeight - 20}" r="0.8" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
    `;
  }
  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith("#")) {
      let num = parseInt(color.replace("#", ""), 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 255) + amt, B = (num & 255) + amt;
      return "#" + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }
  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "white":
        return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper":
        return { grad: `copperRim-${uid}`, stroke: "#8B4513" };
      case "blue":
        return { grad: `blueRim-${uid}`, stroke: "#104E8B" };
      case "green":
        return { grad: `greenRim-${uid}`, stroke: "#006400" };
      case "red":
        return { grad: `redRim-${uid}`, stroke: "#8B0000" };
      default:
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
    }
  }
  renderGradients(uid) {
    return `
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `;
  }
  static getConfigElement() {
    return document.createElement("foundry-button-editor");
  }
  static get supportsCardResize() {
    return true;
  }
  getGridOptions() {
    return {
      columns: 6,
      rows: 4,
      min_columns: 3,
      min_rows: 2
    };
  }
  static getStubConfig() {
    return {
      entity: "light.sun_porch",
      icon: "mdi:lightbulb",
      primary_info: "Porch",
      secondary_info: "{{ states('light.sun_porch') }}",
      icon_color: "{{ 'amber' if states('light.sun_porch') == 'on' else 'grey' }}",
      ring_style: "brass",
      plate_color: "#8c7626",
      font_bg_color: "#ffffff",
      font_color: "#000000",
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "everywhere",
      aged_texture_intensity: 50,
      card_width: 240
    };
  }
};
if (!customElements.get("foundry-button-card")) {
  customElements.define("foundry-button-card", FoundryButtonCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-button-card",
  name: "Foundry Button",
  preview: true,
  description: "A compact industrial button card."
});

// src/cards/foundry-button-editor.js
var fireEvent4 = (node, type2, detail, options) => {
  options = options || {};
  detail = detail === null || detail === void 0 ? {} : detail;
  const event = new Event(type2, {
    bubbles: options.bubbles === void 0 ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === void 0 ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};
var FoundryButtonEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = { ...config };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      if (this._form && this._form.parentNode) {
        this._form.parentNode.removeChild(this._form);
      }
      this._form = null;
      this.render();
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    this.render();
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      this._root.className = "card-config";
      const style = document.createElement("style");
      style.textContent = `
                .card-config { display: flex; flex-direction: column; gap: 16px; }
            `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
    }
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = this._computeLabel;
      this._form.addEventListener(
        "value-changed",
        (ev) => this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._configToForm(this._config);
    this._form.schema = this._getSchema();
  }
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "ring_style",
        "title_color",
        "font_color",
        "font_bg_color",
        "number_color",
        "primary_tick_color",
        "secondary_tick_color",
        "background_style",
        "face_color",
        "liquid_color",
        "needle_color",
        "plate_transparent",
        "glass_effect_enabled",
        "wear_level",
        "aged_texture",
        "aged_texture_intensity",
        "slider_color",
        "knob_color",
        "tick_color"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._config = newConfig;
      fireEvent4(this, "config-changed", { config: this._config });
    }
  }
  _configToForm(config) {
    const data = { ...config };
    data.theme = config.theme ?? "none";
    data.ring_style = config.ring_style ?? "brass";
    data.plate_color = this._hexToRgb(config.plate_color ?? "#f5f5f5") ?? [
      245,
      245,
      245
    ];
    data.font_bg_color = this._hexToRgb(config.font_bg_color ?? "#ffffff") ?? [
      255,
      255,
      255
    ];
    data.font_color = this._hexToRgb(config.font_color ?? "#000000") ?? [
      0,
      0,
      0
    ];
    data.plate_transparent = config.plate_transparent ?? false;
    data.wear_level = config.wear_level ?? 50;
    data.glass_effect_enabled = config.glass_effect_enabled ?? true;
    data.aged_texture = config.aged_texture ?? "everywhere";
    data.aged_texture_intensity = config.aged_texture_intensity ?? 50;
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config, ...formData };
    if (config.plate_color)
      config.plate_color = this._rgbToHex(config.plate_color);
    if (config.font_bg_color)
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
    if (config.font_color)
      config.font_color = this._rgbToHex(config.font_color);
    return config;
  }
  _getSchema() {
    return [
      {
        name: "entity",
        label: "Entity (Optional)",
        selector: { entity: {} }
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "icon", label: "Icon", selector: { icon: {} } },
          {
            name: "tap_action",
            label: "Tap Action",
            selector: {
              ui_action: {
                actions: [
                  "more-info",
                  "toggle",
                  "navigate",
                  "url",
                  "call-service",
                  "perform-action",
                  "assist",
                  "none"
                ]
              }
            }
          }
        ]
      },
      {
        name: "",
        type: "expandable",
        title: "Content Templates (Jinja2 Supported)",
        schema: [
          {
            name: "primary_info",
            label: "Primary Info",
            selector: { template: {} }
          },
          {
            name: "secondary_info",
            label: "Secondary Info",
            selector: { template: {} }
          },
          {
            name: "secondary_info_2",
            label: "Secondary Info 2",
            selector: { template: {} }
          },
          {
            name: "icon_color",
            label: "Icon Color",
            selector: { template: {} }
          }
        ]
      },
      {
        name: "",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "font_bg_color",
                label: "Screen Background",
                selector: { color_rgb: {} }
              },
              {
                name: "font_color",
                label: "Digital Font Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          },
          {
            name: "glass_effect_enabled",
            label: "Glass Effect",
            selector: { boolean: {} }
          },
          {
            name: "wear_level",
            label: "Wear Level (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "aged_texture",
            label: "Aged Texture Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          {
            name: "aged_texture_intensity",
            label: "Texture Intensity (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          },
          {
            name: "card_width",
            label: "Card Max Width (px)",
            selector: { number: { min: 100, max: 500, mode: "box" } }
          }
        ]
      }
    ];
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map(
      (n) => Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  _computeLabel(schema2) {
    if (schema2.label) return schema2.label;
    return schema2.name;
  }
};
customElements.define("foundry-button-editor", FoundryButtonEditor);

// src/cards/foundry-uptime-card.js
var FoundryUptimeCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this.config = {
      ...config,
      alias: { ...config.alias || {} },
      color: { ...config.color || {} },
      duration: config.duration ? { ...config.duration } : void 0
    };
    if (this.config.theme && this.config.theme !== "none") {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this._rendered = false;
          this._renderHistory();
        }
      });
    }
    if (!this.config.entity) {
      throw new Error("Entity is required");
    }
    this.config.hours_to_show = this.config.hours_to_show || 24;
    this.config.update_interval = this.config.update_interval || 60;
    this.config.show_footer = this.config.show_footer !== void 0 ? this.config.show_footer : true;
    this.config.ok = this.config.ok || [
      "on",
      "connected",
      "home",
      "open",
      "true",
      "running",
      "active"
    ];
    this.config.ko = this.config.ko || [
      "off",
      "disconnected",
      "not_home",
      "closed",
      "false",
      "stopped",
      "inactive"
    ];
    this.config.alias.ok = this.config.alias.ok || "Up";
    this.config.alias.ko = this.config.alias.ko || "Down";
    if (this.config.duration) {
      const q = this.config.duration.quantity || 1;
      const u = this.config.duration.unit || "day";
      if (u === "minute") this.config.hours_to_show = q / 60;
      else if (u === "hour") this.config.hours_to_show = q;
      else if (u === "day") this.config.hours_to_show = q * 24;
      else if (u === "week") this.config.hours_to_show = q * 24 * 7;
    }
    this.config.ring_style = this.config.ring_style || "brass";
    this.config.title = this.config.title || "Uptime Monitor";
    this.config.title_font_size = this.config.title_font_size || 14;
    this.config.title_color = this.config.title_color || "#3e2723";
    this.config.plate_color = this.config.plate_color || "#f5f5f5";
    this.config.rivet_color = this.config.rivet_color || "#6d5d4b";
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    this.config.font_color = this.config.font_color || "#000000";
    this.config.wear_level = this.config.wear_level !== void 0 ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== void 0 ? this.config.glass_effect_enabled : true;
    this.config.color.none = this.config.color.none || "transparent";
    this.config.segments = this.config.segments || void 0;
    this.config.color_thresholds = this.config.color_thresholds || [
      { value: 98, color: "#4CAF50" },
      { value: 90, color: "#FF9800" },
      { value: 0, color: "#F44336" }
    ];
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
    if (this._interval) clearInterval(this._interval);
    this._interval = setInterval(
      () => this._fetchHistory(),
      this.config.update_interval * 1e3
    );
  }
  static getStubConfig() {
    return {
      entity: "binary_sensor.updater",
      title: "Uptime Monitor",
      title_color: "#3e2723",
      hours_to_show: 24,
      ok: "on",
      ko: "off",
      ring_style: "brass",
      rivet_color: "#6a5816",
      plate_color: "#8c7626",
      plate_transparent: false,
      font_bg_color: "#ffffff",
      font_color: "#000000",
      wear_level: 50,
      glass_effect_enabled: true,
      color_thresholds: [
        { value: 50, color: "#9C27B0" },
        // purple
        { value: 70, color: "#F44336" },
        // red
        { value: 99.9, color: "#FF9800" },
        // orange
        { value: 100, color: "#4CAF50" }
        // green
      ]
    };
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._lastFetch || /* @__PURE__ */ new Date() - this._lastFetch > this.config.update_interval * 1e3) {
      this._fetchHistory();
    } else {
      this._updateValues();
    }
  }
  disconnectedCallback() {
    if (this._interval) clearInterval(this._interval);
  }
  async _fetchHistory() {
    if (!this._hass) return;
    this._lastFetch = /* @__PURE__ */ new Date();
    const entityId = this.config.entity;
    const hours = this.config.hours_to_show;
    const startTime = /* @__PURE__ */ new Date();
    startTime.setHours(startTime.getHours() - hours);
    const isoStart = startTime.toISOString();
    try {
      const history2 = await this._hass.callApi(
        "GET",
        `history/period/${isoStart}?filter_entity_id=${entityId}&minimal_response&end_time=${(/* @__PURE__ */ new Date()).toISOString()}`
      );
      if (history2 && history2.length > 0) {
        this._history = history2[0];
      } else {
        this._history = [];
      }
      this._renderHistory();
    } catch (e) {
      console.error("Foundry Uptime: Fetch error", e);
    }
  }
  _renderHistory() {
    this.render();
    this._updateValues();
  }
  _updateValues() {
    if (!this.shadowRoot) return;
    if (!this._history) return;
    const now = /* @__PURE__ */ new Date();
    const hours = this.config.hours_to_show;
    const startTime = new Date(now.getTime() - hours * 3600 * 1e3);
    const startTs = startTime.getTime();
    const endTs = now.getTime();
    const totalDuration = endTs - startTs;
    const tubeWidth = 200;
    const bucketCount = 50;
    const bucketDur = totalDuration / bucketCount;
    const buckets = [];
    let totalUpTime = 0;
    let totalTrackedTime = 0;
    const segments = [];
    let currentState = "unknown";
    let lastChangeTs = startTs;
    if (this._history.length > 0) {
      const sortedHistory = [...this._history].sort(
        (a, b) => new Date(a.last_changed) - new Date(b.last_changed)
      );
      if (new Date(sortedHistory[0].last_changed).getTime() > startTs) {
        currentState = sortedHistory[0].state;
      } else {
        currentState = sortedHistory[0].state;
      }
      for (const entry of sortedHistory) {
        const t = new Date(entry.last_changed).getTime();
        if (t <= startTs) {
          currentState = entry.state;
          lastChangeTs = startTs;
          continue;
        }
        if (t > lastChangeTs) {
          segments.push({ start: lastChangeTs, end: t, state: currentState });
        }
        currentState = entry.state;
        lastChangeTs = t;
      }
    } else {
      if (this._hass.states[this.config.entity]) {
        currentState = this._hass.states[this.config.entity].state;
      }
    }
    if (lastChangeTs < endTs) {
      segments.push({ start: lastChangeTs, end: endTs, state: currentState });
    }
    for (let i = 0; i < bucketCount; i++) {
      const bStart = startTs + i * bucketDur;
      const bEnd = bStart + bucketDur;
      let bUp = 0;
      for (const seg of segments) {
        const overlapStart = Math.max(seg.start, bStart);
        const overlapEnd = Math.min(seg.end, bEnd);
        if (overlapEnd > overlapStart) {
          const dur = overlapEnd - overlapStart;
          if (this._isOk(seg.state)) {
            bUp += dur;
          }
        }
      }
      const bPct = bUp / bucketDur * 100;
      buckets.push({ id: i, pct: bPct, color: this._getColorForScore(bPct) });
      totalUpTime += bUp;
      totalTrackedTime += bucketDur;
    }
    const uptimePct = totalTrackedTime > 0 ? totalUpTime / totalTrackedTime * 100 : 0;
    const scoreEl = this.shadowRoot.getElementById("uptime-score");
    if (scoreEl) {
      scoreEl.textContent = `${uptimePct.toFixed(2)}%`;
      scoreEl.setAttribute("fill", this.config.font_color);
    }
    const statusEl = this.shadowRoot.getElementById("status-text");
    if (statusEl) {
      const entityState = this._hass.states[this.config.entity]?.state || "unknown";
      const isOk = this._isOk(entityState);
      const isKo = this._isKo(entityState);
      let statusText = entityState;
      if (isOk && this.config.alias.ok) statusText = this.config.alias.ok;
      else if (isKo && this.config.alias.ko) statusText = this.config.alias.ko;
      statusEl.textContent = statusText;
      statusEl.setAttribute("fill", this.config.font_color);
    }
    const bandsContainer = this.shadowRoot.getElementById("bands-container");
    if (bandsContainer) {
      bandsContainer.innerHTML = "";
      const barWidth = tubeWidth / bucketCount;
      const uid = this._uniqueId;
      const rimStyle = this.config.ring_style;
      const rimData = this.getRimStyleData(rimStyle, uid);
      const coalesced = [];
      if (buckets.length > 0) {
        let current = { ...buckets[0], count: 1 };
        for (let i = 1; i < buckets.length; i++) {
          const b = buckets[i];
          if (b.color === current.color) {
            current.count++;
          } else {
            coalesced.push(current);
            current = { ...b, count: 1 };
          }
        }
        coalesced.push(current);
      }
      let currentX = 0;
      const dividerWidth = 2;
      const dividers = [];
      coalesced.forEach((group, idx) => {
        const isLast = idx === coalesced.length - 1;
        const totalWidth = group.count * barWidth;
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", currentX);
        rect.setAttribute("y", 0);
        rect.setAttribute("width", totalWidth);
        rect.setAttribute("height", 24);
        rect.setAttribute("fill", group.color);
        bandsContainer.appendChild(rect);
        currentX += totalWidth;
        if (!isLast) {
          const div = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          div.setAttribute("x", currentX - dividerWidth / 2);
          div.setAttribute("y", 0);
          div.setAttribute("width", dividerWidth);
          div.setAttribute("height", 24);
          div.setAttribute("fill", `url(#${rimData.grad})`);
          div.setAttribute("stroke", "black");
          div.setAttribute("stroke-width", "0.2");
          div.setAttribute("opacity", "1");
          dividers.push(div);
        }
      });
      dividers.forEach((div) => bandsContainer.appendChild(div));
    }
    if (this.config.show_footer) {
      const startEl = this.shadowRoot.getElementById("footer-start");
      const endEl = this.shadowRoot.getElementById("footer-end");
      if (startEl && endEl) {
        startEl.textContent = this._timeAgo(startTime);
        endEl.textContent = "Now";
      }
    }
  }
  _getColorForScore(pct) {
    if (this.config.segments) return this.config.font_color;
    if (this.config.color_thresholds) {
      const thresholds = [...this.config.color_thresholds || []].sort(
        (a, b) => a.value - b.value
      );
      const match = thresholds.find((th) => pct <= th.value);
      if (match) return this._resolveColor(match.color);
    }
    return pct >= 50 ? "#4CAF50" : "#F44336";
  }
  _isOk(state) {
    if (Array.isArray(this.config.ok)) return this.config.ok.includes(state);
    return this.config.ok === state;
  }
  _isKo(state) {
    if (Array.isArray(this.config.ko)) return this.config.ko.includes(state);
    return this.config.ko === state;
  }
  _resolveColor(name) {
    const colors = {
      green: "#4CAF50",
      red: "#F44336",
      orange: "#FF9800",
      yellow: "#FFEB3B",
      purple: "#9C27B0",
      blue: "#2196F3",
      grey: "#9E9E9E"
    };
    return colors[name] || name;
  }
  _timeAgo(date) {
    const diff = (/* @__PURE__ */ new Date() - date) / 1e3;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
  render() {
    if (this._rendered) return;
    this._rendered = true;
    const config = this.config;
    const title = config.title;
    const uid = this._uniqueId;
    const fontBgColor = config.font_bg_color;
    const rimStyle = config.ring_style;
    const rimData = this.getRimStyleData(rimStyle, uid);
    const rivetColor = config.rivet_color;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;
    const agedTexture = config.aged_texture !== void 0 ? config.aged_texture : "everywhere";
    const agedTextureIntensity = config.aged_texture_intensity !== void 0 ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = plateTransparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    const plateWidth = 280;
    const plateHeight = 170;
    const rimWidth = 240;
    const rimHeight = 100;
    const rimX = (plateWidth - rimWidth) / 2;
    const rimY = 35;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { background: transparent; container-type: inline-size; }
        .card { position: relative; }
        .container { width: 100%; max-width: 520px; margin: 0 auto; }
        .vector-svg { width: 100%; height: auto; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3)); }
        .rivet { fill: ${rivetColor}; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4)); }
        .screw-detail { stroke: #4a4034; stroke-width: 0.5; fill: none; }
        .digital-font { font-family: 'ds-digitaldot', monospace; }
        .label-font { font-family: 'ds-digitaldot', monospace; letter-spacing: 1px; } 
      </style>
      <ha-card>
        <div class="card">
          <div class="container">
            <svg class="vector-svg" viewBox="0 0 ${plateWidth} ${plateHeight}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 ${this.renderGradients(uid)}
                 <!-- Reuse noise filter from entities if possible, inline here for safety -->
                 <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                   <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                   <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                   <feComponentTransfer result="grainTexture">
                        <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                        <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                        <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                   </feComponentTransfer>
                   <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
                   <feComposite in="blended" in2="SourceGraphic" operator="in"/>
                 </filter>
                 <!-- Tube Shadow -->
                 <filter id="inner-shadow-${uid}">
                    <feFlood flood-color="black"/>
                    <feComposite operator="out" in2="SourceGraphic"/>
                    <feGaussianBlur stdDeviation="2"/>
                    <feComposite operator="atop" in2="SourceGraphic"/>
                 </filter>
                 <!-- Glass Glare Vertical -->
                 <linearGradient id="tubeGlare-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.4)" />
                    <stop offset="40%" style="stop-color:rgba(255,255,255,0.1)" />
                    <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0.2)" />
                 </linearGradient>
                 <linearGradient id="screenGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#000;stop-opacity:0" />
                    <stop offset="100%" style="stop-color:#000;stop-opacity:0.2" />
                 </linearGradient>
              </defs>

              <!-- Plate -->
              <rect x="5" y="5" width="${plateWidth - 10}" height="${plateHeight - 10}" rx="20" ry="20" 
                    fill="${plateTransparent ? "none" : plateColor}" 
                    stroke="${plateTransparent ? "none" : "#888"}" stroke-width="0.5" 
                    filter="${effectiveAgedTexture === "everywhere" && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              ${this.renderRivets(plateWidth - 10, plateHeight - 10, 5, 5)}

              <!-- Main Frame (Rim) -->
              ${this.renderSquareRim(rimStyle, uid, fontBgColor, config.glass_effect_enabled, rimX, rimY, rimWidth, rimHeight)}

              <!-- Title -->
              <text x="${plateWidth / 2}" y="28" text-anchor="middle" font-size="${config.title_font_size}" font-weight="bold" fill="${config.title_color}" style="font-family: Georgia, serif; text-shadow: 1px 1px 2px rgba(255,255,255,0.2);">${title}</text>

              <!-- Main Content: The Tube -->
              <!-- Center Vertically in Rim: rimY + (rimHeight - 24)/2 -->
              <g transform="translate(${rimX + (rimWidth - 200) / 2}, ${rimY + (rimHeight - 24) / 2})">
                  
                  <!-- INNER RING (Bezel) -->
                  <!-- 4px thickness. -4 offset. -->
                  <rect x="-4" y="-4" width="208" height="32" rx="16" ry="16" 
                        fill="url(#${rimData.grad})" 
                        stroke="${rimData.stroke}" stroke-width="1"
                        filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.5))" />

                  <!-- Tube Background (The "lines" color) -->
                  <!-- Using rimData.stroke to match the ring color as requested -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="${rimData.stroke}" stroke="none" style="box-shadow: inset 0 0 5px black;"/>
                  
                  <!-- Bands Container -->
                  <clipPath id="tubeClip-${uid}">
                      <rect x="0" y="0" width="200" height="24" rx="12" ry="12" />
                  </clipPath>
                  
                  <g id="bands-container" clip-path="url(#tubeClip-${uid})">
                      <!-- Bands will be injected here -->
                  </g>
                  
                  <!-- Tube Glass Overlay -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="url(#tubeGlare-${uid})" style="pointer-events: none;"/>
                  
                  <!-- Tube Frame/Highlight (Existing) -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />

                   <!-- Inner Black Line (Inside the bezel, around the screen) -->
                   <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="none" stroke="#000000" stroke-width="1" opacity="0.6" />
              </g>

              <!-- Status Text (Top Left of Rim area) -->
              <text id="status-text" x="${rimX + 24}" y="${rimY + 28}" font-size="14" font-weight="bold" fill="${config.font_color}" class="label-font" text-anchor="start">--</text>

              <!-- Uptime % Score (Top Right of Ring area) -->
              <text id="uptime-score" x="${rimX + rimWidth - 24}" y="${rimY + 28}" font-size="14" font-family="ds-digitaldot" text-anchor="end" fill="${config.font_color}" style="letter-spacing:1px;">--%</text>

              <!-- Footer (Bottom of Ring area) -->
              ${config.show_footer ? `
                    <!-- Start Time (Bottom Left).-->
                    <text id="footer-start" x="${rimX + 24}" y="${rimY + rimHeight - 20}" text-anchor="start" font-size="12" fill="${config.font_color}" class="label-font">...</text>
                    
                    <!-- End Time (Bottom Right) -->
                    <text id="footer-end" x="${rimX + rimWidth - 24}" y="${rimY + rimHeight - 20}" text-anchor="end" font-size="12" fill="${config.font_color}" class="label-font">Now</text>
              ` : ""}

              <!-- Wear Marks -->
              ${this.renderWearMarks(config.wear_level, plateHeight)}

            </svg>
          </div>
        </div>
      </ha-card>
    `;
    const cardEl = this.shadowRoot.querySelector(".card");
    if (cardEl) {
      cardEl.style.cursor = "pointer";
      cardEl.onclick = () => {
        if (this.config.entity) {
          fireEvent(this, "hass-more-info", { entityId: this.config.entity });
        }
      };
    }
  }
  // Helpers copied/adapted to avoid complexity of shared utils refactor for now
  renderRivets(w, h, x, y) {
    const offset = 15;
    const rivets = [
      { cx: x + offset, cy: y + offset },
      { cx: x + w - offset, cy: y + offset },
      { cx: x + offset, cy: y + h - offset },
      { cx: x + w - offset, cy: y + h - offset }
    ];
    return rivets.map(
      (r) => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" class="screw-detail" transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `
    ).join("");
  }
  renderWearMarks(wearLevel, viewBoxHeight) {
    if (wearLevel === 0) return "";
    const baseOpacity = wearLevel / 100 * 0.25;
    return `
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="210" cy="${viewBoxHeight - 40}" r="1.5" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
        <path d="M 30 ${viewBoxHeight - 20} Q 40 ${viewBoxHeight - 25} 50 ${viewBoxHeight - 20}" stroke="#8B7355" stroke-width="0.5" fill="none" opacity="${baseOpacity}"/>
    `;
  }
  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith("#")) {
      let num = parseInt(color.replace("#", ""), 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 255) + amt, B = (num & 255) + amt;
      return "#" + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }
  // Helper to get rim data, shared between render and renderSquareRim
  getRimStyleData(s, uid) {
    const switchS = {
      brass: { grad: `brassRim-${uid}`, stroke: "#8B7355" },
      silver: { grad: `silverRim-${uid}`, stroke: "#999999" },
      chrome: { grad: `silverRim-${uid}`, stroke: "#999999" },
      white: { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" },
      black: { grad: `blackRim-${uid}`, stroke: "#2b2b2b" },
      copper: { grad: `copperRim-${uid}`, stroke: "#8B4513" },
      blue: { grad: `blueRim-${uid}`, stroke: "#104E8B" },
      green: { grad: `greenRim-${uid}`, stroke: "#006400" },
      red: { grad: `redRim-${uid}`, stroke: "#8B0000" }
    };
    return switchS[s] || switchS["brass"];
  }
  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    return `
       <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
       <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="10" ry="10" fill="${bgColor}" stroke="none" />
       <!-- Inner Shadow on Screen -->
        <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="10" ry="10" fill="url(#screenGrad-${uid})" stroke="none" opacity="0.3" pointer-events="none"/>

       ${glassEffectEnabled ? `<path d="M ${x + 12} ${y + 12} L ${x + w - 12} ${y + 12} L ${x + w - 12} ${y + 12 + (h - 24) * 0.2} Q ${x + w / 2} ${y + 12 + (h - 24) * 0.25} ${x + 12} ${y + 12 + (h - 24) * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ""}
       <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
       <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
     `;
  }
  renderGradients(uid) {
    const stops = (c1, c2, c3, c4, c5) => `
        <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
        <stop offset="25%" style="stop-color:${c2};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${c3};stop-opacity:1" />
        <stop offset="75%" style="stop-color:${c4};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${c5};stop-opacity:1" />
     `;
    return `
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops("#c9a961", "#ddc68f", "#b8944d", "#d4b877", "#a68038")}</linearGradient>
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops("#e8e8e8", "#ffffff", "#c0c0c0", "#e0e0e0", "#b0b0b0")}</linearGradient>
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f6f6f6"/><stop offset="100%" style="stop-color:#cfcfcf"/></linearGradient>
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3a3a3a"/><stop offset="100%" style="stop-color:#141414"/></linearGradient>
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops("#c77c43", "#e1a06a", "#9a5c2a", "#d7925a", "#7b461f")}</linearGradient>
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops("#2a6fdb", "#5ea2ff", "#1f4f9e", "#4f8fe6", "#163b76")}</linearGradient>
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops("#2fbf71", "#6fe0a6", "#1f7a49", "#53cf8e", "#165a36")}</linearGradient>
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops("#e53935", "#ff6f6c", "#9e1f1c", "#e85a57", "#6f1513")}</linearGradient>
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" /><stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" /></linearGradient>
     `;
  }
  static getConfigElement() {
    return document.createElement("foundry-uptime-editor");
  }
};
if (!customElements.get("foundry-uptime-card")) {
  customElements.define("foundry-uptime-card", FoundryUptimeCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-uptime-card",
  name: "Foundry Uptime",
  preview: true,
  description: "A steampunk-styled uptime monitor."
});

// src/cards/foundry-uptime-editor.js
var fireEvent5 = (node, type2, detail, options) => {
  options = options || {};
  detail = detail === null || detail === void 0 ? {} : detail;
  const event = new Event(type2, {
    bubbles: options.bubbles === void 0 ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === void 0 ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};
var FoundryUptimeEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._themes = {};
    this._themesLoaded = false;
  }
  setConfig(config) {
    this._config = { ...config };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }
  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._form1 = null;
      this._form2 = null;
      this._thresholdsPanel = null;
      this._thresholdsContainer = null;
      if (!this._advancedMode) {
        this.render();
      }
    } catch (e) {
      console.error("Error loading themes:", e);
    }
  }
  set hass(hass) {
    this._hass = hass;
    this.render();
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      this._root.className = "card-config";
      const style = document.createElement("style");
      style.textContent = `
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                .thresholds-section {
                  margin: 8px 0;
                  padding: 16px;
                  background: var(--card-background-color, #fff);
                  border: 1px solid var(--divider-color, #e0e0e0);
                  border-radius: 4px;
                }
                .section-header {
                  font-weight: 500;
                  margin-bottom: 12px;
                  color: var(--primary-text-color);
                  font-size: 16px;
                }
                .threshold-row {
                  display: flex;
                  gap: 8px;
                  align-items: flex-end;
                  margin-bottom: 12px;
                  background: var(--secondary-background-color, #f9f9f9);
                  padding: 10px;
                  border-radius: 4px;
                }
                .input-group {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .input-group label {
                  font-size: 11px;
                  color: var(--secondary-text-color);
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .input-group input {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                 .input-group input[type="color"] {
                  height: 36px;
                  padding: 2px;
                  cursor: pointer;
                }
                .remove-btn {
                  background: none;
                  border: none;
                  color: var(--error-color, #db4437);
                  cursor: pointer;
                  padding: 8px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                }
                .add-btn {
                  background-color: var(--primary-color, #03a9f4);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  margin-top: 4px;
                }
            `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
      this._form1 = document.createElement("ha-form");
      this._form1.computeLabel = this._computeLabel;
      this._form1.addEventListener(
        "value-changed",
        (ev) => this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form1);
      this._thresholdsPanel = document.createElement("ha-expansion-panel");
      this._thresholdsPanel.header = "Color Thresholds";
      this._thresholdsPanel.outlined = true;
      this._thresholdsPanel.expanded = false;
      this._thresholdsPanel.style.marginTop = "8px";
      this._thresholdsPanel.style.marginBottom = "8px";
      this._thresholdsContainer = document.createElement("div");
      this._thresholdsContainer.className = "thresholds-section";
      this._thresholdsContainer.style.border = "none";
      this._thresholdsContainer.style.padding = "16px";
      this._thresholdsPanel.appendChild(this._thresholdsContainer);
      this._root.appendChild(this._thresholdsPanel);
      this._form2 = document.createElement("ha-form");
      this._form2.computeLabel = this._computeLabel;
      this._form2.addEventListener(
        "value-changed",
        (ev) => this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form2);
    }
    const data = this._configToForm(this._config);
    if (this._form1) {
      this._form1.hass = this._hass;
      this._form1.data = data;
      this._form1.schema = this._getSchemaTop();
    }
    this._renderThresholds();
    if (this._form2) {
      this._form2.hass = this._hass;
      this._form2.data = data;
      this._form2.schema = this._getSchemaBottom();
    }
  }
  _renderThresholds() {
    if (!this._thresholdsContainer) return;
    const thresholds = this._config.color_thresholds || [];
    const currentRows = this._thresholdsContainer.querySelectorAll(".threshold-row");
    const needsFullRender = currentRows.length !== thresholds.length;
    if (needsFullRender) {
      let html = ``;
      if (thresholds.length === 0) {
        html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No thresholds defined.</div>`;
      }
      thresholds.forEach((th, index) => {
        const val = th.value !== void 0 ? th.value : 0;
        const col = th.color || "#000000";
        html += `
                     <div class="threshold-row">
                         <div class="input-group">
                             <label>Threshold %</label>
                             <input type="number" step="0.1" class="th-input" data-idx="${index}" data-key="value" value="${val}">
                         </div>
                         <div class="input-group">
                             <label>Color</label>
                              <input type="color" class="th-input" data-idx="${index}" data-key="color" value="${col}">
                         </div>
                         <button class="remove-btn" data-idx="${index}" title="Remove">\u274C</button>
                     </div>
                  `;
      });
      html += `<button id="add-btn" class="add-btn">+ Add Threshold</button>`;
      this._thresholdsContainer.innerHTML = html;
      this._thresholdsContainer.querySelectorAll(".th-input").forEach((input) => {
        input.addEventListener("change", (e) => {
          const idx = parseInt(e.target.dataset.idx);
          const key = e.target.dataset.key;
          let val = e.target.value;
          if (key === "value") val = Number(val);
          this._updateThreshold(idx, key, val);
        });
      });
      this._thresholdsContainer.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener(
          "click",
          (e) => this._removeThreshold(parseInt(e.target.dataset.idx))
        );
      });
      const addBtn = this._thresholdsContainer.querySelector("#add-btn");
      if (addBtn) addBtn.addEventListener("click", () => this._addThreshold());
    } else {
      thresholds.forEach((th, index) => {
        const row = currentRows[index];
        if (row) {
          const valInput = row.querySelector(`input[data-key="value"]`);
          const colInput = row.querySelector(`input[data-key="color"]`);
          const val = th.value !== void 0 ? th.value : 0;
          const col = th.color || "#000000";
          if (valInput && valInput !== this.shadowRoot.activeElement && Number(valInput.value) !== val) {
            valInput.value = val;
          }
          if (colInput && colInput !== this.shadowRoot.activeElement && colInput.value !== col) {
            colInput.value = col;
          }
        }
      });
    }
  }
  _updateThreshold(index, key, value) {
    const thresholds = [...this._config.color_thresholds || []];
    if (thresholds[index]) {
      thresholds[index] = { ...thresholds[index], [key]: value };
      this._updateConfig({ color_thresholds: thresholds });
    }
  }
  _addThreshold() {
    const thresholds = [...this._config.color_thresholds || []];
    thresholds.push({ value: 90, color: "#4CAF50" });
    this._updateConfig({
      color_thresholds: thresholds.sort((a, b) => a.value - b.value)
    });
  }
  _removeThreshold(index) {
    const thresholds = [...this._config.color_thresholds || []];
    thresholds.splice(index, 1);
    this._updateConfig({ color_thresholds: thresholds });
  }
  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    fireEvent5(this, "config-changed", { config: this._config });
  }
  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);
    if (newConfig.theme && newConfig.theme !== this._config.theme && this._themes && this._themes[newConfig.theme]) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (this._config.theme && this._config.theme !== "none" && newConfig.theme === this._config.theme) {
      const themeProperties = [
        "plate_color",
        "rivet_color",
        "title_color",
        "font_color",
        "font_bg_color",
        "ring_style",
        "plate_transparent",
        "glass_effect_enabled",
        "wear_level",
        "aged_texture",
        "aged_texture_intensity"
      ];
      const hasOverride = themeProperties.some(
        (prop) => JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );
      if (hasOverride) {
        newConfig.theme = "none";
      }
    }
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }
  _computeLabel(schema2) {
    if (schema2.label) return schema2.label;
    return schema2.name;
  }
  _configToForm(config) {
    const data = { ...config };
    data.theme = config.theme ?? "none";
    if (config.font_bg_color)
      data.font_bg_color = this._hexToRgb(config.font_bg_color);
    if (config.font_color) data.font_color = this._hexToRgb(config.font_color);
    if (config.title_color)
      data.title_color = this._hexToRgb(config.title_color);
    else if (config.title_font_color)
      data.title_color = this._hexToRgb(config.title_font_color);
    else data.title_color = [62, 39, 35];
    if (config.plate_color)
      data.plate_color = this._hexToRgb(config.plate_color);
    if (config.rivet_color)
      data.rivet_color = this._hexToRgb(config.rivet_color);
    if (config.alias) {
      data.alias_ok = config.alias.ok;
      data.alias_ko = config.alias.ko;
    }
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config, ...formData };
    const ensureHex = (val) => Array.isArray(val) ? this._rgbToHex(val) : val;
    if (formData.font_bg_color)
      config.font_bg_color = ensureHex(formData.font_bg_color);
    if (formData.font_color) config.font_color = ensureHex(formData.font_color);
    if (formData.title_color)
      config.title_color = ensureHex(formData.title_color);
    if (formData.plate_color)
      config.plate_color = ensureHex(formData.plate_color);
    if (formData.rivet_color)
      config.rivet_color = ensureHex(formData.rivet_color);
    if (formData.alias_ok !== void 0 || formData.alias_ko !== void 0) {
      config.alias = { ...config.alias };
      if (formData.alias_ok !== void 0) config.alias.ok = formData.alias_ok;
      if (formData.alias_ko !== void 0) config.alias.ko = formData.alias_ko;
      delete config.alias_ok;
      delete config.alias_ko;
    }
    return config;
  }
  _hexToRgb(hex) {
    if (!hex || typeof hex !== "string") return void 0;
    if (!hex.startsWith("#")) return void 0;
    let c = hex.substring(1);
    if (c.length === 3)
      c = c.split("").map((s) => s + s).join("");
    if (c.length !== 6) return void 0;
    const num = parseInt(c, 16);
    return [num >> 16, num >> 8 & 255, num & 255];
  }
  _rgbToHex(rgb) {
    if (!Array.isArray(rgb)) return rgb;
    return "#" + rgb.map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  _getSchemaTop() {
    return [
      { name: "entity", selector: { entity: {} } },
      {
        name: "",
        type: "expandable",
        title: "Uptime Settings",
        schema: [
          {
            name: "hours_to_show",
            label: "Hours to Show",
            selector: { number: { min: 1, max: 168 } }
          },
          {
            name: "update_interval",
            label: "Update Interval (s)",
            selector: { number: { min: 10, max: 3600 } }
          },
          {
            name: "ok",
            label: "OK State (CSV or single)",
            selector: { text: {} }
          },
          {
            name: "ko",
            label: "KO State (CSV or single)",
            selector: { text: {} }
          },
          { name: "alias_ok", label: "Alias for OK", selector: { text: {} } },
          { name: "alias_ko", label: "Alias for KO", selector: { text: {} } }
        ]
      }
    ];
  }
  _getSchemaBottom() {
    return [
      {
        name: "",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "theme",
            label: "Theme",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None/Custom" },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1)
                  }))
                ]
              }
            }
          },
          { name: "title", label: "Title", selector: { text: {} } },
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "font_bg_color",
                label: "Screen Background",
                selector: { color_rgb: {} }
              },
              {
                name: "font_color",
                label: "Font Color",
                selector: { color_rgb: {} }
              },
              {
                name: "title_color",
                label: "Title Color",
                selector: { color_rgb: {} }
              },
              {
                name: "plate_color",
                label: "Plate Color",
                selector: { color_rgb: {} }
              },
              {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { color_rgb: {} }
              }
            ]
          },
          {
            name: "plate_transparent",
            label: "Transparent Plate",
            selector: { boolean: {} }
          },
          {
            name: "glass_effect_enabled",
            label: "Glass Effect",
            selector: { boolean: {} }
          },
          {
            name: "wear_level",
            label: "Wear Level (%)",
            selector: { number: { min: 0, max: 100, mode: "slider" } }
          }
        ]
      }
    ];
  }
};
if (!customElements.get("foundry-uptime-editor")) {
  customElements.define("foundry-uptime-editor", FoundryUptimeEditor);
}

// src/foundry-card.js
var FOUNDRY_CARDS_VERSION = "26.2.2";
console.info(
  `%cFoundry Cards%c v${FOUNDRY_CARDS_VERSION}`,
  "color: #03a9f4; font-weight: bold;",
  "color: inherit;"
);
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
