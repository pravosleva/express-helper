import React, { memo } from 'react'
import { Flex, IconButton, StackDivider, ThemeTypings, VStack } from '@chakra-ui/react'
import { TMessage } from '~/utils/interfaces'
import { PopoverInfoButton } from '../PopoverInfoButton'
import { UserAva } from '~/pages/chat/components/UserAva'
import { getNormalizedDate } from '~/utils/timeConverter'

type TProps = {
  label: string | React.ReactElement;
  triggerColorScheme: ThemeTypings["colorSchemes"];
  popupHeader: React.ReactElement;
  items: TMessage[];
  counter: number;
  onClickToCheckItOut: (ts: number) => () => void;
  onMouseLeave: (ts: number) => () => void;
  noMultiline?: boolean;
}

export const InfoBox = memo(({
  popupHeader,
  label,
  counter,
  items,
  onClickToCheckItOut,
  onMouseLeave,
  noMultiline,
  triggerColorScheme,
}: TProps) => {
  return (
    <Flex
      justifyContent='space-between'
      style={{
        width: '100%',
      }}
    >
      <span>{label}</span>
      <PopoverInfoButton
        popoverPlacement='bottom-start'
        headerRenderer={() => <>{popupHeader}</>}
        triggerRenderer={() => (
          <IconButton
            size='xs'
            ml={1}
            aria-label="DONE-LAST-MONTH-DETAILS"
            colorScheme={triggerColorScheme}
            variant='outline'
            isRound
            icon={<span>{counter}</span>}
            // onClick={handleClickDoneLastWeek}
            isDisabled={counter === 0}
          >
            DONE-LAST-MONTH-DETAILS
          </IconButton>
        )}
        bodyRenderer={() => (
          <>
            <VStack
              divider={<StackDivider />}
              alignItems='flex-start'
              style={{
                maxHeight: '450px',
                overflowY: 'auto',
              }}
            >
              {
                items.map((e, i, a) => {
                  const multiline = e.text.split('\n')
                  // const isMultiline = noMultiline ? false : multiline.length > 1

                  return (
                    <Flex
                      direction='column'
                      // justifyContent='space-between'
                      key={e.ts}
                      spacing={0}
                      style={{ width: '100%', cursor: 'crosshair' }}
                      onMouseEnter={onClickToCheckItOut(e.ts)}
                      onMouseLeave={onMouseLeave(e.ts)}
                    >
                      <Flex
                        direction='row'
                        justifyContent='space-between'
                        spacing={2}
                      >
                        <UserAva tooltipText={`Created by ${e.user}`} size={19} name={e.user} mr='.5rem' fontSize={11} tooltipPlacement='auto-end' />
                        <div
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            width: '100%',
                          }}
                        >{noMultiline ? `${multiline[0]}...` : e.text}</div>
                      </Flex>
                      <Flex
                        justifyContent='space-between'
                        style={{ opacity: 0.5 }}
                        fontSize='xs'
                      >
                        <em>Created at {getNormalizedDate(e.ts)}</em>
                        {!!e.statusChangeTs && <em>Status updated at {getNormalizedDate(e.statusChangeTs)}</em>}
                      </Flex>
                    </Flex>
                  )
                })
              }
            </VStack>
          </>
        )}
      />
    </Flex>
  )
})
