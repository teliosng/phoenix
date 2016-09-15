'use strict';

const YAML = require('json2yaml');
const FS = require('fs');
const Path = require('path');
const Inflector = require('inflection');

const Tool = require('../lib/tool');
require('../../apps/api'); // Need to require the app to have the resources declared
const Restypie = require('restypie');


function template(api, data) {
  return {
    swagger: '2.0',
    info: {
      title: 'MediaBucket API',
      description: 'Easily store and manage your medias with MediaBucket',
      version: api.path.replace(/\//g, '')
    },
    host: 'api.mediabucket.io',
    schemes: [
      'http'
    ],
    basePath: api.path,
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization'
      }
    },
    paths: data.paths,
    definitions: data.definitions
  };
}

class SwaggerDocTool extends Tool {

  run() {

    const api = this.api = require(Path.join(process.cwd(), 'apis', this.args.api));

    const data = {
      paths: {},
      definitions: {}
    };

    Object.keys(api.resources).forEach(resourceName => {
      const resource = api.resources[resourceName];
      const resourcePath = Restypie.Url.join('/' + resourceName);
      const singularResourceName = Inflector.singularize(resourceName);

      data.definitions[singularResourceName] = SwaggerDocTool.generateDefinition(resource);

      resource.routes.forEach(route => {
        switch (true) {

          case route instanceof Restypie.BasicRoutes.GetSingleRoute:
            const pkPath = Restypie.Url.join(resourcePath, route.path.replace(':pk', '/{pk}'));

            SwaggerDocTool.ensurePath(data.paths, pkPath).get = {
              summary: `Get a ${singularResourceName} by id`,
              security: SwaggerDocTool.createSecurity(),
              parameters: [
                SwaggerDocTool.createPathParameter('pk'),
                SwaggerDocTool.createPopulateParameter(),
                SwaggerDocTool.createSelectParameter(resource)
              ],
              responses: {
                200: {
                  description: `A single ${singularResourceName}`,
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        $ref: `#/definitions/${singularResourceName}`
                      }
                    }
                  }
                }
              }
            };
            break;

          case route instanceof Restypie.BasicRoutes.GetManyRoute:
            SwaggerDocTool.ensurePath(data.paths, resourcePath).get = {
              summary: `List ${resourceName}`,
              security: SwaggerDocTool.createSecurity(),
              parameters: [
                SwaggerDocTool.createLimitParameter(resource),
                SwaggerDocTool.createOffsetParameter(resource),
                SwaggerDocTool.createPopulateParameter(),
                SwaggerDocTool.createSelectParameter(resource),
                ...SwaggerDocTool.createFilters(resource)
              ],
              responses: {
                200: {
                  description: `An array of ${resourceName}`,
                  schema: {
                    type: 'object',
                    properties: {
                      meta: SwaggerDocTool.createSearchMeta(resourceName),
                      data: {
                        type: 'array',
                        items: {
                          $ref: `#/definitions/${singularResourceName}`
                        }
                      }
                    }
                  }
                }
              }
            };
            break;

          case route instanceof Restypie.BasicRoutes.PostRoute:
            SwaggerDocTool.ensurePath(data.paths, resourcePath).post = {
              summary: `Create a ${singularResourceName}`,
              security: SwaggerDocTool.createSecurity(),
              parameters: [
                SwaggerDocTool.createBody(resource)
              ],
              responses: {
                201: {
                  description: `Newly created ${singularResourceName}`,
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        $ref: `#/definitions/${singularResourceName}`
                      }
                    }
                  }
                }
              }
            };

        }
      });
    });


    return new Promise((resolve, reject) => {
      FS.writeFile(Path.join(process.cwd(), 'api-docs', 'v1.yml'), YAML.stringify(template(api, data)), err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  static ensurePath(paths, newPath) {
    paths[newPath] = paths[newPath] || {};
    return paths[newPath];
  }

  static createSelectParameter(resource) {
    return {
      name: 'select',
      type: 'string',
      in: 'query',
      default: Restypie.arrayToList(resource.defaultSelect)
    };
  }

  static createLimitParameter(resource) {
    return {
      name: 'limit',
      type: 'integer',
      default: resource.defaultLimit,
      in: 'query'
    };
  }

  static createPathParameter(name) {
    return {
      name,
      type: 'string',
      in: 'path',
      required: true
    };
  }

  static generateDefinition(resource) {
    return {
      type: 'object',
      properties: resource.readableFields.reduce((acc, field) => {
        // TODO quid des relations ??
        acc[field.key] = {
          type: field.displayType || 'array'
        };
        return acc;
      }, {})
    };
  }

  static createBody(resource) {
    return {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        properties: resource.writableFields.reduce((acc, field) => {
          acc[field.key] = {
            type: field.displayType
          };
          return acc;
        }, {})
      }
    };
  }

  static createOffsetParameter() {
    return {
      name: 'offset',
      type: 'integer',
      default: 0,
      in: 'query'
    };
  }

  static createPopulateParameter() {
    return {
      name: 'populate',
      type: 'string',
      in: 'query'
    };
  }

  static createFilters(resource) {
    return resource.fields.reduce((acc, field) => {
      if (field.isFilterable) {
        acc.push({
          name: field.key,
          type: field.displayType,
          in: 'query'
        });
        field.supportedOperators.forEach(operator => {
          acc.push({
            name: field.key + Restypie.OPERATOR_SEPARATOR + operator.stringName,
            type: field.displayType,
            in: 'query'
          });
        });
      }
      return acc;
    }, []);
  }

  static createSearchMeta(name) {
    return {
      type: 'object',
      properties: {
        total: {
          type: 'integer',
          description: `Total amount of ${name} corresponding to this research.`
        },
        limit: {
          type: 'integer',
          description: `Maximum amount of ${name} that could have been returned.`
        },
        offset: {
          type: 'integer',
          description: `Amount of ${name} skipped in this research.`
        },
        next: {
          type: 'string',
          description: 'Relative url to the next page.'
        },
        prev: {
          type: 'string',
          description: 'Relative url to the previous page.'
        }
      }
    };
  }

  static createSecurity() {
    return [
      { Bearer: [] }
    ];
  }

  static describe(yargs) {
    return yargs
      .demand('api');
  }

}

module.exports = SwaggerDocTool;