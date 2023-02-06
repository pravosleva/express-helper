import { useState, useCallback, useMemo, memo } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
} from '@chakra-ui/react'

export const MyRoomlist = memo(({ children }: any) => {
  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              My rooms
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={3} pl={0}>
          {children}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
})
