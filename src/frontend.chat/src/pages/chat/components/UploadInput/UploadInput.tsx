import { useEffect } from 'react'
import { useSocketContext } from "~/socketContext";
// @ts-ignore
import SocketIOFileUpload from 'socketio-file-upload'
import { MdAddAPhoto } from 'react-icons/md'

type TProps = {
  id: string
  label: string
}

const LIMIT_UPLOAD_FILE_SIZE_MB = 10

export const UploadInput = ({
  id,
  label,
}: TProps) => {
  const { socket, roomData, isConnected } = useSocketContext()

  // -- Uploader init effect
  useEffect(() => {
    try {
      const uploader = new SocketIOFileUpload(socket, {
        chunkSize: 50 * 1024,
        maxFileSize: LIMIT_UPLOAD_FILE_SIZE_MB * 1024 * 1024,
      });

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
  }, [socket])
  // ---

  return (
    <>
      <label htmlFor={id} className="special-btn special-btn-md dark-btn" style={{ display: 'flex' }}>
        <span>{label}</span><span style={{ marginLeft: '7px' }}><MdAddAPhoto size={19} /></span>
      </label>
      <input id={id} type="file" accept=".gif,.png,.jpg,.jpeg" />
    </>
  )
}
