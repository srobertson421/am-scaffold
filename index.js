var prompt = require('prompt');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

prompt.start();

initProject()

function initProject() {
  projectPrompts = {
    properties: {
      projectName: {
        description: 'Enter the Project Name',
        required: true
      }
    }
  }

  prompt.get(projectPrompts, function (err, result) {
    if (err) { return onErr(err); }

    var meteorCommand = spawn('meteor', ['create', result.projectName], {stdio: 'inherit'});
    //meteorCommand.stdout.setEncoding('utf8')

    console.log('Building Meteor app ' + result.projectName + '...');

    meteorCommand.on( 'close', function(code) {
      console.log('Finished creating app structure');
      removeMeteorDeps(result.projectName);
    });
  });
}

function removeMeteorDeps(projectName) {
  var removeCommand = spawn('meteor', ['remove', 'blaze-html-templates', 'ecmascript', 'insecure', 'autopublish'], {cwd: './' + projectName, stdio: 'inherit'})

  console.log('Removing Meteor Deps...');

  removeCommand.on('close', function(code) {
    console.log('Removed meteor deps...');
    addMeteorDeps(projectName);
  });
}

function addMeteorDeps(projectName) {
  var addCommand = spawn('meteor', ['add', 'pbastowski:angular-babel', 'urigo:static-templates', 'accounts-password'], {cwd: './' + projectName, stdio: 'inherit'});

  console.log('Adding Meteor Deps...');

  addCommand.on('close', function(code) {
    console.log('Added meteor deps...');
    addNPMDeps(projectName);
  });
}

function addNPMDeps(projectName) {
  var npmCommand = spawn('meteor', ['npm', 'install', '--save', 'angular', 'angular-meteor', 'angular-ui-router', 'bootstrap@4.0.0-alpha.2'], {cwd: './' + projectName, stdio: 'inherit'});

  console.log('Adding NPM Deps...');

  npmCommand.on('close', function(code) {
    console.log('Added npm deps...');
    removeClientFiles(projectName);
  });
}

function removeClientFiles(projectName) {
  exec('rm -rf ./' + projectName + '/client/*', function() {
    console.log('Removed Files');
  });
}

function onErr(err) {
  console.log(err);
  return 1;
}