const fs = require("fs");

module.exports = {
  recursiveRendering: function (string, context, stack) {
    for (let key in context) {
      if (context.hasOwnProperty(key)) {
        if (typeof context[key] === "object") {
          string = module.exports.recursiveRendering(
            string,
            context[key],
            (stack ? stack + "." : "") + key
          );
        } else {
          let find =
            "\\$\\{\\s*" + (stack ? stack + "." : "") + key + "\\s*\\}";
          let re = new RegExp(find, "g");
          string = string.replace(re, context[key]);
        }
      }
    }
    return string;
  },
  getFolderPrefix: function (defaultFolderPrefix) {
    return defaultFolderPrefix === "currentdate"
      ? module.exports.getCurrentDate()
      : defaultFolderPrefix;
  },
  pad2: function (value) {
    return String(value).padStart(2, "0");
  },
  getCurrentDate: function () {
    const now = new Date();
    return [
      now.getFullYear(),
      module.exports.pad2(now.getMonth() + 1),
      module.exports.pad2(now.getDate()),
      module.exports.pad2(now.getHours()),
      module.exports.pad2(now.getMinutes()),
      module.exports.pad2(now.getSeconds()),
    ].join("");
  },
  capitalize: function (name) {
    const [first, ...other] = name;
    const capitalizedName = [first.toUpperCase()].concat(other).join("");
    return capitalizedName;
  },
  pascalCase: function (name) {
    if (name.indexOf("_") !== -1) {
      return name
        .split("_")
        .map((token) => {
          return module.exports.capitalize(token);
        })
        .join("");
    } else return module.exports.capitalize(name);
  },
  createDir: function (dirName) {
    fs.mkdirSync(dirName, { recursive: true });
  },
  isImageProp: function (name) {
    const key = name.toLowerCase();
    if (key === "url" || key === "href" || key === "link") {
      return false;
    }
    const imageToken =
      /(^|_)(image|images|img|photo|photos|picture|pictures|thumbnail|thumbnails|avatar|avatars|icon|icons|logo|logos|poster|posters|cover|covers|hero|sprite|sprites)(_|$|[a-z])/;
    if (imageToken.test(key)) {
      return true;
    }
    return /(image|img|photo|picture|thumbnail|avatar|icon|logo|poster|cover|hero|sprite)(url|src|uri)$/.test(
      key
    );
  },
  isLinkProp: function (name) {
    if (module.exports.isImageProp(name)) {
      return false;
    }
    const key = name.toLowerCase();
    if (key === "url" || key === "href" || key === "link") {
      return true;
    }
    return /(?:url|href|link)$/.test(key);
  },
  getPropLabel: function (name) {
    return name
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (char) => char.toUpperCase());
  },
};
