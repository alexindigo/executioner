# Executioner
Executes provided shell command with supplied arguments

[![Build Status](https://img.shields.io/travis/alexindigo/executioner/master.svg?style=flat-square)](https://travis-ci.org/alexindigo/executioner)
[![Coverage Status](https://img.shields.io/coveralls/alexindigo/executioner/master.svg?style=flat-square)](https://coveralls.io/github/alexindigo/executioner?branch=master)

*Notice of change of ownership: Starting version 1.0.0 this package has changed it's owner and goals. Old version (0.0.1) is still available on npm via `npm install executioner@0.0.1`. Thank you.*

## Install

```
npm install executioner --save
```

## Examples

```javascript
var executioner = require('executioner');
```

Simple command:

```javascript
executioner('echo A', {}, function(err, result)
{
  assert.equal(result, 'A');
});
```

Combined command:

```javascript
executioner(['echo A', 'echo B', 'echo C'], {}, function(err, result)
{
  assert.deepEqual(result, ['A', 'B', 'C']);
});
```

Parameterized command:

```javascript
executioner(['echo A-${abc}', 'echo B-${abc}', 'echo C-${xyz}', 'echo D-${xyz}'], {abc: '123', xyz: '789'}, function(err, result)
{
  assert.deepEqual(result, ['A-123', 'B-123', 'C-789', 'D-789']);
});
```

Named list of commands:

```javascript
executioner({'Letter A': 'echo A', 'Letter B': 'echo B', 'Letter C': 'echo C'}, {}, function(err, result)
{
  assert.deepEqual(result, ['Letter A: A', 'Letter B: B', 'Letter C: C']);
});
```

Prefixed commands:

```javascript
executioner(['A', 'B', 'C'], {}, {cmdPrefix: 'echo prefixed'}, function(err, result)
{
  assert.deepEqual(result, ['prefixed A', 'prefixed B', 'prefixed C']);
});
```

Non-string parameters:

```javascript
executioner(['echo A:${ok}:', 'echo B:${no}:', 'echo C:${nay}:', 'echo D:${never}:'], {ok: true, no: false, nay: null, never: undefined}, function(err, result)
{
  assert.deepEqual(result, ['A:1:', 'B::', 'C::', 'D::']);
});
```

Error messaging:

```javascript
executioner('echo ABC && echo XYZ 1>&2 && false', {}, function(err, result)
{
  assert.equal(err.message, 'Command failed: /bin/sh -c echo ABC && echo XYZ 1>&2 && false\nXYZ');
  assert.equal(err.stdout, 'ABC');
  assert.equal(err.stderr, 'XYZ');
  assert.equal(result, undefined);
});
```

Job termination:

```javascript
var job = executioner('echo ABC; sleep 5; echo XYZ', {}, function(err, result)
{
  assert.ok(err.terminated);
  // Partial output
  assert.equal(result, 'ABC');
});

setTimeout(function()
{
  executioner.terminate(job);
}, 100);
```

For more examples check out [`test.js`](test.js).

## License

[MIT](LICENSE)
