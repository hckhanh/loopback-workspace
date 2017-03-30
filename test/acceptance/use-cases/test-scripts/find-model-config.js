'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const clone = require('lodash').clone;
const loopback = require('loopback');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../lib/workspace-manager');

const ModelConfig = app.models.ModelConfig;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;

  this.When(/^I query for the model config '(.+)' in workspace '(.+)'$/,
  function(modelName, workspaceName, next) {
    testsuite.modelName = modelName;
    const filter = {
      where: {id: testsuite.modelName},
    };
    const options =
      {workspaceId: testsuite.workspace.getId(), facetName: 'server'};
    ModelConfig.find(filter, options, function(err, data) {
      if (err) return next(err);
      testsuite.modelConfig = data;
      next();
    });
  });

  this.Then(/^the model config is returned$/, function(next) {
    expect(Object.keys(testsuite.modelConfig)).to.include.members([
      'dataSource',
    ]);
    next();
  });
};
