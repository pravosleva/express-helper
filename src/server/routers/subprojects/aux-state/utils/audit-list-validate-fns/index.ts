import { NAuditList } from '~/routers/subprojects/aux-state/types'
// import { ENamespace } from '~/routers/subprojects/aux-state/types'

type TAnalysis = { isOk: boolean; message?: string }

const isSubjobListCorrect = ({ subjobs }: { subjobs: any[] }): TAnalysis => {
  const result: TAnalysis = {
    isOk: true,
  }
  const requiredFields: (keyof NAuditList.TSubJob)[] = ['name']
  
  for (const subjob of subjobs) {
    for (const requiredKey of requiredFields) {
      if (!subjob[requiredKey]) {
        result.isOk = false
        result.message = `Each subjob should have a key \`${requiredKey}\``
        break
      }
    }
    if (!result.isOk) return result
  }

  return result
}
const isJobListCorrect = ({ jobs }: { jobs: any[] }): TAnalysis => {
  const result: TAnalysis = {
    isOk: true,
  }
  const requiredFields: (keyof NAuditList.IJob)[] = ['id', 'name', 'subjobs', 'tsCreate', 'tsUpdate']

  for (const job of jobs) {
    for (const requiredKey of requiredFields) {
      if (!job[requiredKey]) {
        result.isOk = false
        result.message = `Каждая работа должна содержать ключ \'${requiredKey}\'`
        break
      }
    }
    if (!result.isOk) return result

    const subjobsAnalysis = isSubjobListCorrect({ subjobs: job.subjobs })

    switch (true) {
      case !Array.isArray(job.subjobs):
        result.isOk = false
        result.message = `job.subjobs shound be an Array, received ${typeof job.subjobs} (!isArray)`
        break
      case !subjobsAnalysis.isOk:
        result.isOk = false
        result.message = `Subjobs analysis failed - ${subjobsAnalysis.message || 'No message'}`
        break
      default:
        break
    }
  }
  return result
}
export const isAuditListCorrect = ({ audits }: { audits: any[] }): TAnalysis => {
  const result: TAnalysis = {
    isOk: true,
  }
  if (!audits) {
    result.isOk = false
    result.message = `Incorrect audits, received ${typeof audits}`
  }
  if (!result.isOk) return result

  const requiredFields: (keyof NAuditList.TAudit)[] = ['id', 'name', 'jobs', 'tsCreate', 'tsUpdate']

  for (const audit of audits) {
    for (const requiredKey of requiredFields) {
      if (!audit[requiredKey]) {
        result.isOk = false
        result.message = `Каждый аудит должен содержать ключ \`${requiredKey}\``
        break
      }
    }
    if (!result.isOk) return result

    const jobsAnalysis = isJobListCorrect({ jobs: audit.jobs })

    switch (true) {
      case !Array.isArray(audit.jobs):
        result.isOk = false
        result.message = `audit.jobs should be an Array, received ${typeof audit.jobs} (!isArray)`
        break
      case !jobsAnalysis.isOk:
        result.isOk = false
        result.message = `Jobs analysis failed - ${jobsAnalysis.message || 'No message'}`
        break
      default:
        break
    }
  }

  return result
}
