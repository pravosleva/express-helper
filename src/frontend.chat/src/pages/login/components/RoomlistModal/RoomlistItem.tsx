import { Td, Tr, Button, Input, Editable, EditablePreview, EditableInput, IconButton, Tag } from "@chakra-ui/react"
import { useRef, useState } from "react"
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { FaRegTrashAlt } from 'react-icons/fa'

type TProps = {
  roomName: string
  onDelete: (roomName: string) => void
  onClick: () => void
}

export const RoomlistItem = ({ roomName, onDelete, onClick }: TProps) => {
  return (
    <Tr>
      <Td>
        <Tag
          onClick={onClick}
          style={{
            cursor: 'pointer'
          }}
        >{roomName}</Tag>
      </Td>
      <Td isNumeric>
        <IconButton
          aria-label="DEL"
          isRound
          icon={<FaRegTrashAlt size={15} />}
          onClick={() => {
            onDelete(roomName)
          }}
          // disabled={!message}
          // isLoading={isSending}
        >
          DEL
        </IconButton>
        {/* <Button onClick={handleEditOpen}>EDIT</Button> */}
      </Td>
    </Tr>
  )
}
