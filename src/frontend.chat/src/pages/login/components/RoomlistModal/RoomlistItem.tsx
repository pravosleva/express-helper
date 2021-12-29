import React from 'react'
import { Td, Tr, IconButton, Tag } from "@chakra-ui/react"
// import { useRef, useState } from "react"
// import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
// import { FaRegTrashAlt } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'

type TProps = {
  roomName: string
  onDelete: (roomName: string) => void
  onClick: () => void
}

export const RoomlistItem = ({ roomName, onDelete, onClick }: TProps) => {
  return (
    <Tr>
      <Td pl={0}>
        <Tag
          rounded='2xl'
          onClick={onClick}
          style={{
            cursor: 'pointer'
          }}
          size='lg'
        >{roomName}</Tag>
      </Td>
      <Td isNumeric pr={0}>
        <IconButton
          size='sm'
          aria-label="DEL"
          colorScheme='red'
          variant='outline'
          isRound
          icon={<IoMdClose size={15} />}
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
