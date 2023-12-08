/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
import { THelp } from '~/utils/interfaces'

const _help: THelp = {
  params: {
    query: {
      chat_id: {
        type: 'string',
        descr: 'TG chat_id',
        required: true,
      },
      project_id: {
        type: 'string',
        descr: 'Project ID',
        required: false,
      },
    },
  },
}

const baseUrl = 'https://pravosleva.pro'

export const getDynamicManifest = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse) => {
  const errs: string[] = []

  for (const key in _help.params.body) {
    if (_help.params.query[key]?.required && !req.query[key]) {
      errs.push(`Missing required param: \`${key}\` (${_help.params.query[key].descr})`)
    }
  }
  if (errs.length > 0)
    return res.status(200).send({
      ok: false,
      message: `ERR! ${errs.join('; ')}`,
      _originalBody: req.body,
      _help,
    })

  const { project_id, chat_id } = req.query
  try {
    const manifest = {
      "name": "Pravosleva",
      "short_name": "Pravosleva",
      "theme_color": "#ffffff",
      "background_color": "#2D3748",
      
      "display": "fullscreen",
      "orientation": "portrait",
      "scope": "/",
      "start_url": `${baseUrl}/`,
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
    manifest.start_url = `${baseUrl}/autopark-2022/${chat_id}`
    if (!!project_id) manifest.start_url += `/${project_id}`
    return res.status(200).send(JSON.stringify(manifest))
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
