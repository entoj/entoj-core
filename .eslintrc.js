module.exports = {
    "rules": {
        "indent": [2, 4, {"VariableDeclarator": 0, "SwitchCase": 1 }],
        "quotes": [2, "single"],
        "linebreak-style": [2, "unix"],
        "semi": [2, "always"],
        "no-var": 2,
        "brace-style": [2, "allman"],
        "no-unused-vars": [2, { "args": "none" }],
        "constructor-super": 0,
        "no-this-before-super": 0,
        "valid-jsdoc": [0, { "requireReturnDescription": false}],
        "prefer-const": 2,
        "no-var": 2,
        "no-useless-constructor": 2,
        "no-case-declarations": 0
    },
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended"
};
