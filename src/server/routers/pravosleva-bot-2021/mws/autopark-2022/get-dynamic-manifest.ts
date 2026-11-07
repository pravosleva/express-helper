/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
import { THelp } from '~/utils/express-validation/interfaces'

enum EProjectType {
  AutoParkReport = 'autopark_report',
  AutoPark = 'autopark'
}

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
            case !Object.values(EProjectType).includes(val as EProjectType):
              result.ok = false
              result.reason = `req.query.project_type could have this values only: ${Object.values(EProjectType).join(', ')}`
              break
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
            default:
              break
          }
          return result
        }
      },
    }
  }
}

// 1. Описываем интерфейс элемента маппинга
interface IProjectConfig {
  start_url: ((props: { query: Record<string, string | number | undefined> }) => string) | string
  name: ((props: { query: Record<string, string | number | undefined> }) => string) | string
  short_name: ((props: { query: Record<string, string | number | undefined> }) => string) | string
  theme_color: string
  background_color: string
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser'
  orientation: 'any' | 'natural' | 'landscape' | 'landscape-primary' | 'landscape-secondary' | 'portrait' | 'portrait-primary' | 'portrait-secondary'
}

const projectTypeMapping: Record<string, IProjectConfig> = {
  [EProjectType.AutoParkReport]: {
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
  [EProjectType.AutoPark]: {
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

// 2. Описываем строгий интерфейс манифеста
interface IManifest {
  name: string
  short_name: string
  theme_color: string
  background_color: string
  display: string
  orientation: string
  scope: string
  start_url: string
  icons: Array<{ src: string; sizes: string; type: string }>
  splash_pages: null
}

export const getDynamicManifest = async (req: IRequest, res: IResponse) => {
  const { project_id, chat_id, project_name, project_type } = req.query
  
  try {
    // 1. Создаем базовый манифест со значениями по умолчанию
    let manifest: IManifest = {
      "name": "Pravosleva",
      "short_name": "Pravosleva",
      "theme_color": "#ffffff",
      "background_color": "#2D3748",
      "display": "fullscreen",
      "orientation": "portrait",
      "scope": "/",
      "start_url": '/',
      "icons": [
        { "src": "icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
        { "src": "icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
        { "src": "icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
        { "src": "icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
        { "src": "icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
        { "src": "icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
        { "src": "icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
      ],
      "splash_pages": null
    }

    // 2. Если передан корректный тип проекта, точечно вычисляем и подмешиваем значения
    if (typeof project_type === 'string' && projectTypeMapping[project_type]) {
      const config = projectTypeMapping[project_type];
      
      const queryParams = req.query as Record<string, string | number | undefined>;
      const hasChatOrProject = !!chat_id || !!project_id;

      manifest = {
        ...manifest,
        theme_color: config.theme_color,
        background_color: config.background_color,
        display: config.display,
        orientation: config.orientation,
        // Вычисляем функции, только если есть chat_id или project_id, иначе берем дефолты
        start_url: hasChatOrProject && typeof config.start_url === 'function' 
          ? config.start_url({ query: queryParams }) 
          : (typeof config.start_url === 'string' ? config.start_url : manifest.start_url),
        name: hasChatOrProject && typeof config.name === 'function' 
          ? config.name({ query: queryParams }) 
          : (typeof config.name === 'string' ? config.name : manifest.name),
        short_name: hasChatOrProject && typeof config.short_name === 'function' 
          ? config.short_name({ query: queryParams }) 
          : (typeof config.short_name === 'string' ? config.short_name : manifest.short_name),
      };
    }

    // 3. Переопределяем имя, если оно пришло явно в query
    if (typeof project_name === 'string' && project_name) {
      manifest.name = project_name
      manifest.short_name = project_name
    }

    return res.status(200).send(JSON.stringify(manifest))
  } catch (err) {
    return res.status(500).json({ success: false, message: (err as Error)?.message || 'No err message' })
  }
}
