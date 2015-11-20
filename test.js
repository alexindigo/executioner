var assert = require('assert');
var executioner = require('./');
var originalOptions;

// simple command
executioner('echo A', {}, function(err, result)
{
  assert.ifError(err);
  assert.equal(result, 'A');
});

// simple command with parameter
executioner('echo "${zzz}"', {zzz: 'Boom'}, function(err, result)
{
  assert.ifError(err);
  assert.equal(result, 'Boom');
});

// list of commands
executioner(['echo A', 'echo B', 'echo C'], {}, function(err, result)
{
  assert.ifError(err);
  assert.deepEqual(result, ['A', 'B', 'C']);
});

// list of commands with parameters
executioner(['echo A-${abc}', 'echo B-${abc}', 'echo C-${xyz}', 'echo D-${xyz}'], {abc: '123', xyz: '789'}, function(err, result)
{
  assert.ifError(err);
  assert.deepEqual(result, ['A-123', 'B-123', 'C-789', 'D-789']);
});

// named list of commands
executioner({'Letter A': 'echo A', 'Letter B': 'echo B', 'Letter C': 'echo C'}, {}, function(err, result)
{
  assert.ifError(err);
  assert.deepEqual(result, ['Letter A: A', 'Letter B: B', 'Letter C: C']);
});

// named list with single member
executioner({'Letter A': 'echo A'}, {}, function(err, result)
{
  assert.ifError(err);
  assert.equal(result, 'Letter A: A');
});

// list of commands with boolean parameters
executioner(['echo A:${ok}', 'echo B:${not}:${ok}', 'echo C:${not}'], {ok: true, not: false}, function(err, result)
{
  assert.ifError(err);
  assert.deepEqual(result, ['A:1', 'B::1', 'C:']);
});

// list of commands with `undefined` and `null` parameters
executioner(['echo A:${no}:', 'echo B:${nay}:', 'echo C:${never}:'], {no: undefined, nay: null, never: ''}, function(err, result)
{
  assert.ifError(err);
  assert.deepEqual(result, ['A::', 'B::', 'C::']);
});

// list of commands with non-primitive parameter value
executioner(['echo A:${arr}'], {arr: [1, 2, 3]}, function(err, result)
{
  assert.equal(err.message, 'Parameters should be primitive values [arr] typeof [object]');
  assert.equal(result, undefined);
});

// one-liner with erroneous result
executioner('echo ABC && echo XYZ 1>&2 && false', {}, function(err, result)
{
  assert.equal(err.message, 'Command failed: /bin/sh -c echo ABC && echo XYZ 1>&2 && false\nXYZ');
  assert.equal(err.stdout, 'ABC');
  assert.equal(err.stderr, 'XYZ');
  assert.equal(result, undefined);
});

// set of commands with erroneous member
executioner(['echo ABC', 'echo XYZ 1>&2', 'false', 'not executed'], {}, function(err, result)
{
  assert.equal(err.message, 'Command failed: /bin/sh -c false');
  assert.equal(err.stdout, '');
  assert.equal(err.stderr, '');
  assert.equal(result, undefined);
});

// simple command with erroneous result
// exposes executing shell
executioner('false', {}, {shell: '/bin/bash'}, function(err, result)
{
  assert.equal(err.message, 'Command failed: /bin/bash -c false');
  assert.equal(result, undefined);
});

// simple command with erroneous result
// exposes executing shell
// read custom shell from global options
originalOptions = executioner.options;
executioner.options = {shell: '/bin/bash'};
executioner('false', {}, function(err, result)
{
  assert.equal(err.message, 'Command failed: /bin/bash -c false');
  assert.equal(result, undefined);
});
executioner.options = originalOptions;

// simple command with erroneous result
// exposes executing shell
// handles no global options
originalOptions = executioner.options;
executioner.options = undefined;
executioner('false', {}, function(err, result)
{
  assert.equal(err.message, 'Command failed: /bin/sh -c false');
  assert.equal(result, undefined);
});
executioner.options = originalOptions;
