export class WebWorker {
  constructor(worker: any) {
    const code = worker.toString()
    const blob = new Blob([`(${code})()`], { type: 'text/javascript' })

    return new Worker(URL.createObjectURL(blob))
  }
}
