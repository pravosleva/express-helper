## Usage samples

### `public/web-workers/messagesLogic/index.js`

```js
importScripts('./MessagesLogic.js');

var window = self;

self.onmessage = ($event) => {
  if (!$event) return;

  const t0 = performance.now()

  // console.log($event.data)

  // 1
  const getFilteredMessages = ({
    filters,
    searchText,
    additionalTsToShow,
    assignmentExecutorsFilters,
  }) => {
    return (messages) => {
      const logic = new Logic(messages)
  
      return logic.getFiltered({ filters, searchText, additionalTsToShow, assignmentExecutorsFilters })
    }
  }

  // 2
  const getAllImagesLightboxFormat = () => {
    return (messages) => {
      const logic = new Logic(messages, 'http://pravosleva.ru/express-helper/chat/storage/uploads')
  
      return logic.getAllImagesLightboxFormat()
    }
  }

  switch ($event.data.type) {
    case 'getFilteredMessages':
      result = getFilteredMessages($event.data)($event.data.messages);
      break;
    case 'getAllImagesLightboxFormat':
      result = getAllImagesLightboxFormat($event.data)($event.data.messages);
      break;
    // NOTE: Others...
    default:
      result = null;
      break;
  }

  const t02 = performance.now();

  self.postMessage({ result, perf: t02 - t0, type: $event.data.type });
}
```

### `webWorkersInstance`

```js
const PUBLIC_URL = process.env.PUBLIC_URL || ''

class Singleton {
  private static instance: Singleton
  filtersWorker: any;

  private constructor() {
    this.filtersWorker = new Worker(`${PUBLIC_URL}/web-worker/messagesLogic/index.js`)
  }
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()

    return Singleton.instance
  }
}

export const webWorkersInstance = Singleton.getInstance()
```

### Hooks in code

```js
  // -- FILTERS EXP
  // V1
  // const filteredMessages = useMemo(() => logic.getFiltered({ filters, searchText: debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters }), [logic, filters, debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters])
  // const allImagesMessagesLightboxFormat = useMemo(() => logic.getAllImagesLightboxFormat(), [logic])

  // V2: Web Worker
  const [filteredMessages, setFilteredMessages] = useState<TMessage[]>([])
  const [allImagesMessagesLightboxFormat, setAllImagesMessagesLightboxFormat] = useState<any[]>([])

  useEffect(() => {
    webWorkersInstance.filtersWorker.onmessage = ($event: { [key: string]: any, data: { type: string, result: TMessage[], perf: number } }) => {
      try {
        console.log(`Web Worker: ${$event.data.result.length} in ${$event.data.perf} ms`)
        switch ($event.data.type) {
          case 'getFilteredMessages':
            setFilteredMessages($event.data.result)
            break;
          case 'getAllImagesLightboxFormat':
            setAllImagesMessagesLightboxFormat($event.data.result)
            break;
          default: break;
        }
      } catch (err) {
        console.log(err)
      }
    }
  }, [])

  useEffect(() => {
    webWorkersInstance.filtersWorker.postMessage({ type: 'getFilteredMessages', filters, searchText: debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters, messages })
  }, [messages, filters, debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters])
  useEffect(() => {
    webWorkersInstance.filtersWorker.postMessage({ type: 'getAllImagesLightboxFormat', messages })
  }, [messages])
  // --
```