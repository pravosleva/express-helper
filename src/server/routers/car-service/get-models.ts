import { Request as IRequest, Response as IResponse } from 'express'
import { getStaticJSONSync } from '~/utils/fs-tools/getStaticJSONSync'
import path from 'path'

const uremontSamplesDir = path.join(__dirname, './')
const storageUremontSamplesFilePath = path.join(uremontSamplesDir, '/uremont-data')

const modelsMap = new Map()
const getModifiedModelList = (vendorData) => vendorData.models.reduce((acc, cur) => {
  if (!acc.includes(cur.name)) acc.push(cur.name)
  return acc
}, [])

export const getModels = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse) => {
  const requiredFields = ['vendor']
  const errs = []
  for (const key of requiredFields) if (!req.query[key]) errs.push(`${key} is required!`)

  if (errs.length > 0) {
    return res.status(200).send({
      ok: false,
      message: errs.join('; '),
      _originalQuery: req.query,
    })
  }

  const { vendor } = req.query

  try {

    if (typeof vendor !== 'string') return res.status(200).send({
      ok: false,
      message: 'Неверный параметр запроса',
      _originalQuery: req.query,
    })

    // -- NOTE: Check...
    const response: any = {
      ok: false,
      _originalQuery: req.query,
    }
    if (!modelsMap.has(vendor)) {
      // - NOTE: Try to read
      const vendorData = getStaticJSONSync(path.join(storageUremontSamplesFilePath, `/${vendor.toLowerCase()}.json`))

      if (!!vendorData) modelsMap.set(vendor, vendorData)
      // -
    }

    const vendorData = modelsMap.get(vendor)
    if (!!vendorData) {
      response.ok = true
      response.models = getModifiedModelList(vendorData)
      response.byUremont = vendorData
    } else {
      response.message = `Данные для производителя ${vendor} пока отсутствуют`
      response.models = []
    }
    response._service = {
      totalInCash: modelsMap.size,
      storageUremontSamplesFilePath: path.join(storageUremontSamplesFilePath, `/${vendor.toLowerCase()}.json`),
    }

    return res.status(200).json(response)
    // --
  } catch (err) {
    return res.status(200).json({ success: false, message: [err.message || 'No err message', `Скорее всего, данные для производителя ${vendor} отсутствуют, но они скоро появятся`].join('; ') })
  }
}
