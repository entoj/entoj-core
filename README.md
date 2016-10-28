
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]

#Entoj

## Running tests

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

[travis-image]: https://img.shields.io/travis/entoj/entoj-core/master.svg?label=linux
[travis-url]: https://travis-ci.org/entoj/entoj-core
[appveyor-image]: https://img.shields.io/appveyor/ci/ChristianAuth/entoj-core/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/ChristianAuth/entoj-core
[coveralls-image]: https://img.shields.io/coveralls/entoj/entoj-core/master.svg
[coveralls-url]: https://coveralls.io/r/entoj/entoj-core?branch=master
