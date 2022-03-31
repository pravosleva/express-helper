/* eslint-disable import/extensions */
import Imei from 'node-imei'
// import { getRandomInteger } from '../../../utils/getRandomInteger'
// import { getRandomInteger } from '@getRandomInteger'
import { getRandomInteger } from '~/utils/getRandomInteger'

const IMEI = new Imei()

module.exports = async (_req, res) => {
  res.append('Content-Type', 'application/json')

  const response = {
    success: true,
    result: IMEI.random(),
    _rand: getRandomInteger(1, 100),
  }

  res.status(200).send(response)
}
