import { getRandomString } from '~/utils/getRandomString'
import slugify from 'slugify'
import { usersMapInstance as usersMap } from '../state'

export const getToken = (userName: string): string => {
  let token = getRandomString(7)

  // -- NOTE: Более информативный токен
  const connectionData = usersMap.get(userName)

  let uaInfo = []
  if (!!connectionData?.userAgent?.client?.name) uaInfo.push(slugify(connectionData.userAgent.client.name))
  if (!!connectionData?.userAgent?.device?.type) uaInfo.push(slugify(connectionData.userAgent.device.type))
  if (!!connectionData?.userAgent?.os?.name) uaInfo.push(slugify(connectionData.userAgent.os.name))

  if (!!uaInfo) token = `${uaInfo.join('-')}.${token}`
  // --

  return token
}