/**
 * Executes provided command with supplied arguments
 */
var exec  = require('child_process').exec
  , util  = require('util')
  ;

// Public API
module.exports  = execute;
// default options
execute.options = {};

/**
 * Executes provided command with supplied arguments
 *
 * @param   {string|array|object} commands - command to execute, optionally with parameter placeholders
 * @param   {object} params - parameters to pass to the command
 * @param   {object} [options] - command execution options like `cwd`
 * @param   {function} callback - `callback(err, output)`, will be invoked after all commands is finished
 * @returns {void}
 */
function execute(commands, params, options, callback)
{
  var keys, execOptions;

  // optional options :)
  if (typeof options == 'function')
  {
    callback = options;
    options  = {};
  }

  // clone params, to mess with them without side effects
  params = util._extend({}, params);
  // copy options and with specified shell
  execOptions = util._extend(util._extend({}, execute.options || {}), options);

  // use it as array
  if (typeof commands == 'string')
  {
    commands = [ commands ];
  }

  // assume commands that aren't array are objects
  if (!Array.isArray(commands))
  {
    keys = Object.keys(commands);
  }

  run(commands, keys, params, execOptions, function(err, results)
  {
    if (err) return callback(err);
    // output single command result as a string
    callback(null, results.length == 1 ? results[0] : results);
  });
}

/**
 * Runs specified command, replaces parameter placeholders.
 *
 * @param   {object|array} commands - list of commands to execute
 * @param   {array} keys - list of commands keys
 * @param   {object} params - parameters for each command
 * @param   {object} options - options for child_process.exec
 * @param   {function} callback - invoked when all commands have been processed
 * @param   {array} collector - list of results
 * @returns {void}
 */
function run(commands, keys, params, options, callback, collector)
{
  // either keys is array or commands
  var earlyReturn, key, cmd = (keys || commands).shift();

  collector = collector || [];

  // done here
  if (!cmd)
  {
    return callback(null, collector);
  }

  // transform object into a command
  if (keys)
  {
    key = cmd;
    cmd = commands[key];
  }

  // update placeholders
  earlyReturn = Object.keys(params).some(function(p)
  {
    // fold booleans into strings accepted by shell
    if (typeof params[p] == 'boolean')
    {
      params[p] = params[p] ? '1' : '';
    }

    if (params[p] !== undefined && params[p] !== null && typeof params[p] != 'string' && typeof params[p] != 'number')
    {
      callback(new Error('Parameters should be primitive values [' + p + '] typeof [' + typeof params[p] + ']'));
      // terminate the whole circus
      return true;
    }

    // use empty string for `undefined`
    cmd = cmd.replace(new RegExp('\\$\\{' + p + '\\}', 'g'), (params[p] !== undefined && params[p] !== null) ? params[p] : '');
  });

  // if loop over parameters terminated early
  // do not proceed further
  if (earlyReturn)
  {
    return;
  }

  exec(cmd, options, function(err, stdout, stderr)
  {
    if (err)
    {
      // clean up shell errors
      err.message = trim(err.message);
      err.stdout  = trim(stdout);
      err.stderr  = trim(stderr);
      return callback(err);
    }

    // store the output
    collector.push((key ? key + ': ' : '') + trim(stdout));

    // rinse, repeat
    run(commands, keys, params, options, callback, collector);
  });
}

/**
 * Trims white space
 *
 * @param   {string} str - string to trim
 * @returns {string} - trimmed string
 */
function trim(str)
{
  return (str || '').replace(/^\s*|\s*$/g, '');
}
