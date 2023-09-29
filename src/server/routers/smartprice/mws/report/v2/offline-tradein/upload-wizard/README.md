## Usage example

```ts
await httpClient.report({
  code: EEventCode.TRADEIN_ID_ENTERED,
  uiErrText: '',
  filesCounter: counter,
  tradeinId: (window as any).TRADEIN_ID,
  partnerName: (window as any).PARTNER,
  initPageTotalRequiredLeft: getTemplateSettings(window).totalRequiredLeft,
  initMutatedWindowInfo: getTemplateSettings(window).str,
  errMessage: '',
  additionalInfo: `Entered: ${value}`,
  csrfToken: (window as any).CSRF_TOKEN,
  originalResponseFromBackend: '',
})
```

```ts
export class Api {
  private static instance: Api
  uploadAbortController: AbortController
  reportAbortController: AbortController
  uniqueSessionKey: string;

  constructor() {
    this.api = this.api.bind(this)

    // -- NOTE: Controllers
    this.reportAbortController = new AbortController()
    this.uniqueSessionKey = this._getRandomString(5)
    // --
  }

  async report(values: {
    code: EEventCode;
    uiErrText: string;
    filesCounter: number;
    tradeinId: string | boolean;
    additionalInfo: string;
    partnerName: string;
    initPageTotalRequiredLeft: number;
    initMutatedWindowInfo: string,
    errMessage: string;
    csrfToken: string;
    originalResponseFromBackend: string;
  }) {
    const {
      code,
      uiErrText,
      filesCounter,
      tradeinId,
      additionalInfo,
      partnerName,
      initPageTotalRequiredLeft,
      initMutatedWindowInfo,
      errMessage,
      csrfToken,
      originalResponseFromBackend,
    } = values
    const rowValues: any[] = [this.uniqueSessionKey, code, uiErrText, filesCounter, tradeinId, additionalInfo, partnerName, initPageTotalRequiredLeft, initMutatedWindowInfo, errMessage, csrfToken, originalResponseFromBackend]
    const protocol = isDev ? 'http:' : 'https:'
    this.reportAbortController.abort()
    this.reportAbortController = new AbortController()
    
    // NOTE: v1
    const data: TResponseSpecial = await this.api<{
      ok: boolean;
      message?: string;
      id?: number;
    }>({
      noUrlPrefix: true,
      url: `${protocol}//pravosleva.pro/express-helper/sp/report/v2/offline-tradein/upload-wizard/send`,
      method: 'POST',
      data: JSON.stringify({ rowValues }),
      signal: this.reportAbortController.signal, // 'X-CSRFToken': (window as any).CSRF_TOKEN
    })
    return data?.ok ? Promise.resolve(data) : Promise.reject(data)

    // NOTE: v2
    // return fetch(`${protocol}://pravosleva.pro/express-helper/sp/report/v2/offline-tradein/upload-wizard/send`, {
    //   method: 'POST',
    //   body: JSON.stringify({ rowValues }),
    //   signal: this.reportAbortController.signal,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-CSRFToken': (window as any).CSRF_TOKEN,
    //   }
    // })
    //   .then((res) => res.json())
    //   .catch((err) => err)
  }
}
```
