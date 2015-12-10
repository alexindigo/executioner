var assert = require('assert');
var executioner = require('./');
var originalOptions;
var job;

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
executioner(['echo A:${arr}'], {pre: 'pre', arr: [1, 2, 3], brr: 'legit'}, function(err, result)
{
  assert.equal(err.message, 'Parameters should be a primitive value.');
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
executioner.options = {shell: '/bin/sh'};
executioner('false', {}, function(err, result)
{
  assert.equal(err.message, 'Command failed: /bin/sh -c false');
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

// terminates ongoing process
job = executioner('echo Z; sleep 1; echo A', {}, function(err, result)
{
  assert.ok(err.terminated);
  assert.equal(result, 'Z');
});
setTimeout(function(child)
{
  executioner.terminate(child);
}, 50, job);

// does nothing if called with some bogus thing
executioner.terminate({});

// preserves prefix upon termination
// terminates ongoing process
job = executioner({died: 'echo X; sleep 1; echo B'}, {}, function(err, result)
{
  assert.ok(err.terminated);
  assert.equal(result, 'died: X');
});
setTimeout(function(child)
{
  executioner.terminate(child);
}, 50, job);

// terminates set of commands mid flight
job = executioner(['echo 123', 'echo A; sleep 1; echo Z', 'echo 789', 'never gets a chance'], {}, function(err, result)
{
  assert.ok(err.terminated);
  assert.deepEqual(result, ['123', 'A']);
});
setTimeout(function(child)
{
  executioner.terminate(child);
}, 100, job);
