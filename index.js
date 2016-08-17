#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

program.arguments('<projectName>')
.action(function(projectName) {
  console.log('Creating new project called %s', projectName);

  createChildSpawn('meteor', ['create', projectName], '.', function() {
    restructureProject(projectName);
  });
})
.parse(process.argv);

function createChildSpawn(command, argList, cwd, closeCallback) {

  var cp = spawn(command, argList, {cwd: cwd});

  console.log('Running:', command, argList[0]);

  cp.stdout.on('data', function(data) {
    console.log(data.toString());
  });

  cp.stderr.on('data', function(data) {
    console.log(data.toString());
  });

  cp.on('message', function(message) {
    console.log(message.toString());
  });

  cp.on('close', function(code) {
    console.log(command, 'closed on code', code.toString());
    closeCallback(argList);
  });
}

// Need exec for wildcards in file manipulation
function createChildExec(command, closeCallback) {
  exec(command, function(err, stdout, stderr) {
    console.log('Executed shell command:', command);
  });
}

// Editing files and adding deps
function restructureProject(projectName) {
  console.log('Amending project files...');
  var folderPath = './' + projectName;
  var clientPath = folderPath + '/client';
  var serverPath = folderPath + '/server';
  var importsPath = folderPath + '/imports';
  var importsUIPath = importsPath + '/ui';
  var importsUIComponentsPath = importsUIPath + '/components';
  var importsAPIPath = importsPath + '/api';

  createChildExec('rm -rf ' + clientPath + '/*');
  createChildExec('rm -rf ' + serverPath + '/*');
  createChildExec('mkdir ' + importsPath);
  createChildExec('mkdir ' + importsUIPath);
  createChildExec('mkdir ' + importsUIComponentsPath);
  createChildExec('mkdir ' + importsAPIPath);
  createChildExec('touch ' + clientPath + '/main.html ' + clientPath + '/main.js ' + clientPath + '/main.css');

  removeMeteorPackages(folderPath);
}

function removeMeteorPackages(projectPath) {
  // Meteor packages remove
  createChildSpawn('meteor', ['remove',
      'blaze-html-templates',
      'ecmascript',
      'insecure',
      'autopublish'
    ], projectPath, function() {
    console.log('removed blaze templates, ecmascript, insecure, and autopublish');
    npmInstalls(projectPath);
  });
}

function npmInstalls(projectPath) {
  // NPM installs 
  createChildSpawn('meteor', ['npm', 'install', '--save',
      'angular',
      'angular-meteor',
      'angular-ui-router',
      'bootstrap@4.0.0-alpha.2'
    ], projectPath, function() {
    console.log('added npm modules: angular, angular-meteor');
    meteorInstalls(projectPath);
  });
}

function meteorInstalls(projectPath) {
  // Meteor package installs
  createChildSpawn('meteor', ['add',
      'pbastowski:angular-babel',
      'urigo:static-templates',
      'accounts-password',
      'dotansimha:accounts-ui-angular'
    ], projectPath, function() {
    console.log('added meteor package: angular-babel');
  });
}