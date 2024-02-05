/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
// import { THelp } from '~/utils/interfaces'
import { THelp } from '~/utils/express-validation/interfaces'

enum EProjectType {
  AutoParkReport = 'autopark_report',
  AutoPark = 'autopark'
}

// const _help: THelp = {
//   params: {
//     query: {
//       project_type: {
//         type: 'string',
//         descr: 'Project type',
//         required: false,
//       },
//       chat_id: {
//         type: 'string',
//         descr: 'TG chat_id',
//         required: false,
//       },
//       project_id: {
//         type: 'string',
//         descr: 'Project ID',
//         required: false,
//       },
//       project_name: {
//         type: 'string',
//         descr: 'Project name',
//         required: false,
//       },
//     },
//   },
// }

export const rules: THelp = {
  params: {
    query: {
      project_type: {
        type: 'string',
        descr: 'Project type',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query.project_type shoud be not empty string'
              break
            case !Object.values(EProjectType).includes(val):
              result.ok = false
              result.reason = `req.query.project_type could have this values only: ${Object.values(EProjectType).join(', ')}`
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      chat_id: {
        type: 'string',
        descr: 'TG chat_id',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query.chat_id shoud be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      project_id: {
        type: 'string',
        descr: 'Project id',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query.project_id shoud be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      project_name: {
        type: 'string',
        descr: 'Project name',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query.project_name shoud be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
    }
  }
}

const projectTypeMapping: {
  [key: string]: {
    start_url: ((props: {
      query: {
        [key: string]: string | number;
      };
    }) => string) | string;
    name: ((props: {
      query: {
        [key: string]: string | number;
      };
    }) => string) | string;
    short_name: ((props: {
      query: {
        [key: string]: string | number;
      };
    }) => string) | string;
    theme_color: string;
    background_color: string;
    // NOTE: https://developer.mozilla.org/ru/docs/Web/Manifest/display
    display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
    // NOTE: https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation
    orientation: 'any' | 'natural' | 'landscape' | 'landscape-primary' | 'landscape-secondary' | 'portrait' | 'portrait-primary' | 'portrait-secondary';
  };
} = {
  autopark_report: {
    start_url: ({ query }) => {
      try {
        const { chat_id, project_id } = query
        switch (true) {
          case !!chat_id && !!project_id: return `/autopark-2022/${chat_id}/${project_id}/report`
          case !!chat_id: return `/autopark-2022/${chat_id}`
          default: return '/'
        }
      } catch (err) {
        return '/'
      }
    },
    name: ({ query }) => !!query.project_name ? String(query.project_name) : 'AutoPark 2022',
    short_name: ({ query }) => !!query.project_name ? String(query.project_name) : 'AutoPark 2022',
    theme_color: '#ffffff',
    background_color: '#2D3748',
    display: 'fullscreen',
    orientation: 'portrait',
  },
  autopark: {
    start_url: ({ query }) => {
      try {
        const { chat_id, project_id } = query
        switch (true) {
          case !!chat_id && !!project_id: return `/autopark-2022/${chat_id}/${project_id}`
          case !!chat_id: return `/autopark-2022/${chat_id}`
          default: return '/'
        }
      } catch (err) {
        return '/'
      }
    },
    name: ({ query }) => !!query.project_name ? String(query.project_name) : 'AutoPark 2022',
    short_name: ({ query }) => !!query.project_name ? String(query.project_name) : 'AutoPark 2022',
    theme_color: '#ffffff',
    background_color: '#2D3748',
    display: 'fullscreen',
    orientation: 'portrait',
  },
}

// const baseUrl = 'https://pravosleva.pro'

export const getDynamicManifest = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse) => {
  // const errs: string[] = []
  // for (const key in _help.params.query) {
  //   if (_help.params.query[key]?.required && !req.query[key])
  //     errs.push(`Missing required param: \`${key}\` (${_help.params.query[key].descr})`)
  // }
  // if (errs.length > 0)
  //   return res.status(200).send({
  //     ok: false,
  //     message: `ERR! ${errs.join('; ')}`,
  //     _originalBody: req.body,
  //     _help,
  //   })

  const { project_id, chat_id, project_name, project_type } = req.query
  try {
    const manifest = {
      "name": "Pravosleva",
      "short_name": "Pravosleva",
      "theme_color": "#ffffff",
      "background_color": "#2D3748",
      
      "display": "fullscreen",
      "orientation": "portrait",
      "scope": "/",
      "start_url": '/', // `${baseUrl}/`,
      "icons": [
        {
          "src": "icons/icon-72x72.png",
          "sizes": "72x72",
          "type": "image/png"
        },
        {
          "src": "icons/icon-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        },
        {
          "src": "icons/icon-128x128.png",
          "sizes": "128x128",
          "type": "image/png"
        },
        {
          "src": "icons/icon-144x144.png",
          "sizes": "144x144",
          "type": "image/png"
        },
        {
          "src": "icons/icon-152x152.png",
          "sizes": "152x152",
          "type": "image/png"
        },
        {
          "src": "icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "icons/icon-384x384.png",
          "sizes": "384x384",
          "type": "image/png"
        },
        {
          "src": "icons/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "splash_pages": null
    }
    // if (!!chat_id) manifest.start_url = `/autopark-2022/${chat_id}`
    // if (!!project_id) `/autopark-2022/${chat_id}/${project_id}/report`
    if (!!project_type && typeof project_type === 'string' && !!projectTypeMapping[project_type]) {
      for (const key in projectTypeMapping[project_type]) {
        switch (true) {
          case typeof projectTypeMapping[project_type][key] === 'function':
            if (!!chat_id || !!project_id)
              manifest[key] = projectTypeMapping[project_type][key]({ query: req.query })
            break
          default:
            manifest[key] = projectTypeMapping[project_type][key]
            break
        }
        
      }
    }
    if (!!project_name && typeof project_name === 'string') {
      manifest.name = project_name
      manifest.short_name = project_name
    }

    return res.status(200).send(JSON.stringify(manifest))
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
