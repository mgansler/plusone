'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
exports.__esModule = true
var child_process_1 = require('child_process')
var path_1 = require('path')
function default_1(options, context) {
  return __awaiter(this, void 0, void 0, function () {
    var projectRoot, projectSourceRoot, args, generate
    return __generator(this, function (_a) {
      projectRoot = context.workspace.projects[context.projectName].root
      projectSourceRoot = context.workspace.projects[context.projectName].sourceRoot
      args = [
        '-P',
        // TODO: check if we are a library or an application
        path_1.join(projectRoot, 'tsconfig.lib.json'),
        '-r',
        'tsconfig-paths/register',
        'node_modules/typeorm/cli.js',
        '--config',
        path_1.join(projectSourceRoot, options.ormConfig),
        'migration:generate',
        '--outputJs',
        '-n',
        options.name,
      ]
      if (options.check) {
        args.push('--check')
      } else if (options.dryrun) {
        args.push('--dryrun')
      }
      generate = child_process_1.spawn('ts-node', args)
      return [
        2 /*return*/,
        new Promise(function (resolve) {
          generate.stdout.on('data', function (data) {
            return console.log(data.toString())
          })
          generate.stderr.on('data', function (data) {
            return console.error(data.toString())
          })
          generate.on('close', function (code) {
            if (code !== 0) {
              resolve({ success: false })
            }
            var format = child_process_1.spawn('yarn', [
              'prettier',
              '--write',
              (options.app ? context.workspace.projects[options.app].sourceRoot : projectSourceRoot) +
                '/_migrations_/*.js',
            ])
            format.on('close', function (code) {
              resolve({ success: code === 0 })
            })
          })
        }),
      ]
    })
  })
}
exports['default'] = default_1
