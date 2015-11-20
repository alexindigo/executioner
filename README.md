# Executioner
Executes provided shell command with supplied arguments

## Install

```
npm install executioner --save
```

## Examples

```
var executioner = require('executioner');
```

Simple command:

```
executioner('echo A', {}, function(err, result)
{
  assert.equal(result, 'A');
});
```

Combined command:

```
executioner(['echo A', 'echo B', 'echo C'], {}, function(err, result)
{
  assert.deepEqual(result, ['A', 'B', 'C']);
});
```

Parameterized command:

```
executioner(['echo A-${abc}', 'echo B-${abc}', 'echo C-${xyz}', 'echo D-${xyz}'], {abc: '123', xyz: '789'}, function(err, result)
{
  assert.deepEqual(result, ['A-123', 'B-123', 'C-789', 'D-789']);
});
```

Named list of commands:

```
executioner({'Letter A': 'echo A', 'Letter B': 'echo B', 'Letter C': 'echo C'}, {}, function(err, result)
{
  assert.deepEqual(result, ['Letter A: A', 'Letter B: B', 'Letter C: C']);
});
```

Non-string parameters:

```
executioner(['echo A:${ok}:', 'echo B:${no}:', 'echo C:${nay}:', 'echo D:${never}:'], {ok: true, no: false, nay: null, never: undefined}, function(err, result)
{
  assert.deepEqual(result, ['A:1:', 'B::', 'C::', 'D::']);
});
```

Error messaging:

```
executioner('echo ABC && echo XYZ 1>&2 && false', {}, function(err, result)
{
  assert.equal(err.message, 'Command failed: /bin/sh -c echo ABC && echo XYZ 1>&2 && false\nXYZ');
  assert.equal(err.stdout, 'ABC');
  assert.equal(err.stderr, 'XYZ');
  assert.equal(result, undefined);
});
```

For more examples check out [`test.js`](test.js).

## License

[MIT](LICENSE)
