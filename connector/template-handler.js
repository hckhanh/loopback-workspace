'use strict';

const fs = require('fs-extra');
const ncp = require('ncp');
const path = require('path');

class TemplateHandler {
  static createFromTemplate(workspace, template, callback) {
    const taskList = [];

    if (template.package) {
      taskList.push(function(next) {
        workspace.addPackageDefinition(template.package, next);
      });
    }

    ['server', 'client'].forEach(function(facetName) {
      const facet = template[facetName];
      if (!facet) return;
      const config = {
        name: facetName,
        modelsMetadata: facet.modelsMetadata,
      };
      taskList.push(function(next) {
        workspace.addFacet(facetName, config, next);
      });
      if (template.files) {
        TemplateHandler.copyTemplateFiles(workspace, template, taskList);
      }
      if (facet.datasources) {
        facet.datasources.forEach(function(datasource) {
          taskList.push(function(next) {
            workspace.addDataSource(datasource.id, datasource, next);
          });
        });
      }
      if (facet.modelConfigs) {
        facet.modelConfigs.forEach(function(modelConfig) {
          taskList.push(function(next) {
            workspace.addModelConfig(modelConfig.id, modelConfig, next);
          });
        });
      }
      if (facet.middleware) {
        facet.middleware.forEach(function(configData) {
          taskList.push(function(next) {
            let phase = configData.phase;
            let subPhase = configData.subPhase;
            phase = (subPhase) ? phase + ':' + subPhase : phase;
            let path = configData.function;
            delete configData.phase;
            delete configData.subPhase;
            workspace.addMiddleware(phase, path, configData, next);
          });
        });
      }
    });
    workspace.execute(taskList, callback);
  }
  static copyTemplateDir(dir, destinationPath, cb) {
    ncp(dir, destinationPath, cb);
  }
  static copyTemplateFiles(workspace, template, taskList) {
    const templateFiles = [];
    if (template.files.parent) {
      let filePath = path.join(__dirname,
        '../templates/files',
        template.files.parent.path);
      templateFiles.push(filePath);
    }
    let filePath = path.join(__dirname,
      '../templates/files',
      template.files.path);
    templateFiles.push(filePath);

    templateFiles.forEach(function(dir) {
      taskList.push(function(next) {
        TemplateHandler.copyTemplateDir(
          dir,
          workspace.getDirectory(),
          next);
      });
    });
  }
}

module.exports = TemplateHandler;
