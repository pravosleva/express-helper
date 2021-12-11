import React from "react"
import {
  Td, Tr,
  Text,
  Flex,
  Button,
} from "@chakra-ui/react"
import { UserAva } from '~/pages/chat/components/UserAva'

type TProps = {
  userName: string
  selectButtonText: string
  onSelectButtonClick: (name: string) => void
}

export const TableItem = ({
  userName,
  selectButtonText,
  onSelectButtonClick,
}: TProps) => {
  return (
    <Tr>
      <Td pr={0}>
        <Flex display="flex" alignItems="center">
          <UserAva name={userName} size={33} mr='.7rem' /><Text fontWeight='bold' fontSize="md">{userName}</Text>
        </Flex>
      </Td>
      <Td isNumeric>
        <Button rounded='3xl' onClick={() => onSelectButtonClick(userName)}>{selectButtonText}</Button>
      </Td>
    </Tr>
  )
}