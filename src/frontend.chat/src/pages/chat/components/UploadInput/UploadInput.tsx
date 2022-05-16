import { useEffect, useMemo } from 'react'
import { useSocketContext } from "~/context/socketContext";
// @ts-ignore
import SocketIOFileUpload from 'socketio-file-upload'
import { MdAddAPhoto } from 'react-icons/md'
import styles from '~/App.module.scss'
import clsx from 'clsx'

type TProps = {
  id: string
  label?: string
  isDisabled: boolean
}

const UPLOAD_FILE_SIZE_LIMIT_MB = 5

export const UploadInput = ({
  id,
  label,
  isDisabled,
}: TProps) => {
  const { socket } = useSocketContext()
  const uploader = useMemo(() => new SocketIOFileUpload(socket, {
    chunkSize: 50 * 1024,
    maxFileSize: UPLOAD_FILE_SIZE_LIMIT_MB * 1024 * 1024,
  }), [socket]);

  // -- Uploader init effect
  useEffect(() => {
    try {
      uploader.listenOnInput(document.getElementById('siofu_input'))
      uploader.addEventListener("error", function(data: any){
        if (data.code === 1) alert("Don't upload such a big file")
      });

      return () => {
        uploader.destroy()
      }
    } catch (err) {
      console.log(err)
    }
  }, [uploader])
  // ---

  return (
    <>
      <label htmlFor={id} className={clsx(styles["special-btn"], styles['special-btn-md'], styles['dark-btn'])} style={{ display: 'flex' }}>
        {!!label && <span style={{ marginRight: '7px' }}>{label}</span>}<span><MdAddAPhoto size={19} /></span>
      </label>
      <input id={id} type="file" accept=".gif,.png,.jpg,.jpeg" disabled={isDisabled} />
    </>
  )
}
