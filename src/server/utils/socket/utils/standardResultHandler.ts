import { TOperstionResult } from '../state'

export const standardResultHandler = ({
  result,
  cbSuccess,
  cbError,
}: {
  result: TOperstionResult,
  cbSuccess: ({ result }: { result: TOperstionResult }) => void
  cbError: ({ result }: { result: TOperstionResult }) => void
}): void => {
  switch (true) {
    case result.isOk:
      if (!!cbSuccess) cbSuccess({ result })
      break;
    default:
      if (!!cbError) cbError({ result })
      break;
  }
}
