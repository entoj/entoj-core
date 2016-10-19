[![Build Status](https://travis-ci.org/entoj/entoj-core.svg?branch=develop)](https://travis-ci.org/entoj/entoj-core)
[![Coverage Status](https://coveralls.io/repos/github/entoj/entoj-core/badge.svg?branch=develop)](https://coveralls.io/github/entoj/entoj-core?branch=develop)


# Running tests

Runs all test specs at once
```
npm test
```

Runs all test matching the given regex
```
npm test -- --grep model/
```

Enables logging while running tests
```
npm test -- --vvvv
```

Runs all test specs and shows test coverage
```
npm run coverage
```

Lints all source files
```
npm run lint
```
