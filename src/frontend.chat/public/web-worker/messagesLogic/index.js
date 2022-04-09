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

  // 3
  const getTags = () => {
    return (messages) => {
      const logic = new Logic(messages)
  
      return logic.getTags()
    }
  }

  switch ($event.data.type) {
    case 'getFilteredMessages':
      result = getFilteredMessages($event.data)($event.data.messages);
      break;
    case 'getAllImagesLightboxFormat':
      result = getAllImagesLightboxFormat($event.data)($event.data.messages);
      break;
    case 'getTags':
      result = getTags($event.data)($event.data.messages);
      break;
    // NOTE: Others...
    default:
      result = null;
      break;
  }

  const t02 = performance.now();

  self.postMessage({ result, perf: t02 - t0, type: $event.data.type });
}

// USAGE: getFilteredMessages({ filters, searchText: debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters, messages })
// USAGE: getAllImagesLightboxFormat({ messages })
