import React, { useCallback, useState } from 'react'
import { Formik, Form as FormikForm, Field } from 'formik';
import {
  Button,
  Checkbox,
  Container,
  CircularProgress,
  Grid,
  FormControlLabel,
  TextField,
} from '@material-ui/core';
import axios from 'axios'
import { Alert } from '@material-ui/lab'
import { TValues } from './interfaces'
import { getErrors } from './getErrors'
// import { useRouter } from '~/common/hooks'
import queryString from 'query-string'
import { useMainContext, useUrgentMsgFromCookies } from '~/common/hooks'

const { REACT_APP_API_URL } = process.env

const apiResponseValidator = (axiosRes: any): boolean => !!axiosRes?.data?.qr
// const apiResponseAccessCodeValidator = (axiosRes: any): boolean => axiosRes?.data?.ok && !!axiosRes?.data?.accessCode

interface IRes {
  ok: boolean
}
interface IResSuccess extends IRes {
  isOk: boolean
  data: any
  message: string
  redirect: string
  uiName: string
  qr: string
}
// interface IResFail extends IRes {
//   isOk: boolean
//   message: string
// }

export const MainPage = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const [targetUiName, setTargetUiName] = useState<string | null>(null)
  const resetTargetUiName = () => {
    setTargetUiName(null)
  }
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const resetErrorMsg = useCallback(() => {
    setErrorMsg(null)
  }, [setErrorMsg]);
  // const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const { isCookieAccepted: isAccepted, toggler: setIsAccepted } = useMainContext()
  const handleCheckAccept = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setIsAccepted(checked);
    },
    [setIsAccepted]
  );
  // const router = useRouter()
  // const { query } = router
  const query: any = queryString.parse(window.location.search)
  const handleSubmit = useCallback(async (data: Partial<TValues>): Promise<any> => {
    resetErrorMsg()
    if (!query?.hash) return Promise.reject('No hash in query!')

    const res: any = await axios({
      method: 'POST',
      url: `${REACT_APP_API_URL}/auth/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { ...data, hash: query?.hash },
    })
    .then((axiosRes) => {
      if (!apiResponseValidator(axiosRes)) {
        throw new Error('Data is incorrect');
      }
      return { isOk: true, data: axiosRes.data }
    })
    .catch((err) => {
      return { isOk: false, message: err.message || 'No err.message' }
    });

    if (res.isOk) return Promise.resolve(res.data)

    return Promise.reject(res.message)
  }, [query?.hash, resetErrorMsg])
  const isCorrect = useCallback(
    (values: TValues): boolean => {
      return Object.keys(getErrors(values)).length === 0 && isAccepted
    },
    [isAccepted]
  );
  const [QR, setQR] = useState<string | null>(null)
  useUrgentMsgFromCookies({ cookieName: 'urgent_auth_service_msg' })

  return (
    <Container
      style={{
        // marginTop: '20px',
        width: '100%',
        height: '100vh',
        paddingTop: '15%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
      maxWidth="sm"
      // className={clsx(classes.minimalHeightSetting, {
      //   [baseClasses.noPaddingMobile]: isTheNotePage,
      // })}
    >
      <Formik
        initialValues={{
          // email: 'admin@sp.ru',
          password: '',
        }}
        validate={getErrors}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          if (!isCorrect(values)) {
            console.log('Check something')
            return
          }

          resetErrorMsg();
          resetTargetUiName();
          setSubmitting(true);
          
          // TODO: GET /get-access-code-by-hash
          // RES: { accessCode: string } -> code -> handleSubmit(values, code)

          handleSubmit(values)
            .then((data: IResSuccess) => {
              // addSuccessNotif({ message: 'Ваша заявка отправлена' });
              setSubmitting(false);
              setSuccessMsg(data.message)
              // @ts-ignore
              setTargetUiName(data.uiName)
              setQR(data.qr)

              // @ts-ignore
              if (!!data.redirect) {
                // @ts-ignore
                setRedirectTo(data.redirect)
                // @ts-ignore
                // window.location.replace(data.redirect)
              }
              resetForm()
            })
            .catch((err) => {
              // addDangerNotif({ message: err?.message || 'Извините, что-то пошло не так' });
              setSubmitting(false)
              setErrorMsg(err)
            });
        }}
      >
        {({ isSubmitting, errors, setFieldValue, values }) => (
          <FormikForm style={{ width: '100%' }}>
            <Grid container spacing={3}>
              {/* <Grid item xs={12} sm={6}>
                <Field
                  // autoFocus
                  // className={classes.standardFilledTextField}
                  component={TextField}
                  defaultValue={values.email}
                  name="email"
                  type="text"
                  label="Email"
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                  size="small"
                  variant="outlined"
                  onChange={(e: any) => {
                    setFieldValue('email', e.target.value);
                  }}
                />
              </Grid> */}
              <Grid item xs={12} sm={6}>
                <Field
                  autoFocus
                  // className={classes.standardFilledTextField}
                  component={TextField}
                  name="password"
                  type="password"
                  label="Password"
                  error={!!errors.password}
                  helperText={errors.password}
                  fullWidth
                  size="small"
                  variant="outlined"
                  onChange={(e: any) => {
                    setFieldValue('password', e.target.value);
                  }}
                  disabled={isSubmitting || !!successMsg}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  <Button
                    style={{ marginBottom: '5px' }}
                    // className={classes.standardPrimaryBlueBtn}
                    variant="contained"
                    type="submit"
                    color="primary"
                    // onClick={submitForm}
                    fullWidth
                    endIcon={
                      isSubmitting && (
                        <CircularProgress
                          size={20}
                        />
                      )
                    }
                    disabled={isSubmitting || !isCorrect(values) || !!successMsg}
                  >
                    Submit
                  </Button>
                  <FormControlLabel
                    disabled={isSubmitting || !!successMsg}
                    // className={classes.smallPolicyWrapper}
                    control={
                      <Checkbox
                        color="primary"
                        onChange={handleCheckAccept}
                        checked={isAccepted}
                      />
                    }
                    // onChange={(e: any) => { console.log(e); }}
                    label={
                      <span>
                        <b>cookies</b> is good
                      </span>
                    }
                  />
                </div>
              </Grid>
              {!!errorMsg &&
                (
                  <Grid item xs={12}>
                      <Alert
                        severity="error"
                        variant="outlined"
                        // action={
                        //   <IconButton
                        //     aria-label="close"
                        //     color="inherit"
                        //     size="small"
                        //     onClick={() => {
                        //       setIsIMEIAlertOpen(false);
                        //     }}
                        //   >
                        //     <CloseIcon fontSize="inherit" />
                        //   </IconButton>
                        // }
                      >
                        {errorMsg}
                      </Alert>
                    </Grid>
                )
              }
              {!!successMsg &&
                (
                  <Grid item xs={12}>
                    <Alert
                      severity="success"
                      variant="outlined"
                      // action={
                      //   <IconButton
                      //     aria-label="close"
                      //     color="inherit"
                      //     size="small"
                      //     onClick={() => {
                      //       setIsIMEIAlertOpen(false);
                      //     }}
                      //   >
                      //     <CloseIcon fontSize="inherit" />
                      //   </IconButton>
                      // }
                    >
                      {successMsg}. {!!redirectTo && <a href={redirectTo}>{targetUiName}</a>}
                    </Alert>
                  </Grid>
                )
              }
              {!!QR && (
                <Grid
                  item
                  xs={12}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    style={{
                      width: '200px',
                      height: '200px',
                    }}
                    src={QR}
                    alt='QR'
                  />
                </Grid>
              )}
            </Grid>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}