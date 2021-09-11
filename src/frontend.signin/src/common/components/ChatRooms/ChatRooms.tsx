import { useState } from 'react'
import {
  Button,
  Checkbox,
  Container,
  CircularProgress,
  Grid,
  FormControlLabel,
  TextField,
} from '@material-ui/core';
import { useMainContext, EE } from '~/common/hooks'

export const ChatRooms = () => {
  const { socket, chatRooms } = useMainContext()
  const [roomName, setRoomName] = useState<string>('')
  const [myName, setMyName] = useState<string>('')

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          name="roomName"
          type="text"
          label="New room"
          fullWidth
          size="small"
          variant="outlined"
          value={roomName}
          onChange={(e: any) => {
            setRoomName(e.target.value);
          }}
          // disabled={isSubmitting || !!successMsg}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          name="myName"
          type="text"
          label="Name"
          fullWidth
          size="small"
          variant="outlined"
          value={myName}
          onChange={(e: any) => {
            setMyName(e.target.value);
          }}
          // disabled={isSubmitting || !!successMsg}
        />
      </Grid>
      <Grid item xs={6}>
        <Button
          style={{ marginBottom: '5px' }}
          // className={classes.standardPrimaryBlueBtn}
          variant="contained"
          type="submit"
          color="primary"
          onClick={() => {
            socket.emit(EE.ADD_USER_TO_ROOM, { roomName, userName: myName })
          }}
          fullWidth
        >
          Create Room
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          style={{ marginBottom: '5px' }}
          // className={classes.standardPrimaryBlueBtn}
          variant="contained"
          type="submit"
          color="primary"
          onClick={() => {
            socket.emit(EE.GET_CHAT_ROOMS_STATE, { x: 1, roomName })
          }}
          fullWidth
        >
          Get chat rooms state
        </Button>
      </Grid>
      <Grid item xs={12}>
        <pre>{JSON.stringify(chatRooms, null, 2)}</pre>
      </Grid>
    </Grid>
  )
}