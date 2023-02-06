import styles from './FixedBottomSheet.module.scss'
import clsx from 'clsx'
import { Button, Grid, useColorMode, Text, Flex, IconButton, Tooltip, useToast } from '@chakra-ui/react'
import { useState, useCallback, memo } from 'react'
import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi'
import { IoMdClose } from 'react-icons/io'
import { BsInfo } from 'react-icons/bs'

type TProps = {
  isOpened: boolean
  onClose: () => void
  children: React.ReactChild
  mainSpaceRenderer: React.FC
}

export const FixedBottomSheet = memo(({ isOpened, onClose, children, mainSpaceRenderer }: TProps) => {
  const [fullHeight, setFullHeight] = useState<boolean>(true)
  const toggleFullHeight = useCallback(() => {
    setFullHeight((s) => !s)
  }, [setFullHeight])
  const mode = useColorMode()
  const toast = useToast()

  return (
    <div
      className={clsx(
        styles['fixed-wrapper'],
        `bg--${mode.colorMode}`,
        styles[`bg--${mode.colorMode}`],
        {
          [styles['fixed-wrapper--opened']]: isOpened,
          [styles['fixed-wrapper--fullHeight']]: fullHeight,
          [styles['fixed-wrapper--maxHeightLimited']]: !fullHeight,
        }
      )}
    >
      <div
        // templateColumns='1fr 1fr 1fr'
        // gap={2} pr={4} pl={4} pt={2} pb={2}
        // alignItems='center'
        className={clsx(styles['tab-header'], styles[`bg--${mode.colorMode}`])}
      >
        <div className={styles['controls']}>
          <IconButton
            size='xs'
            aria-label="INFO"
            colorScheme='blue'
            variant='outline'
            isRound
            icon={<BsInfo size={15} />}
            onClick={() => {
              toast({
                position: 'top-left',
                title: 'In progress...',
                // description,
                status: 'info',
                duration: 5000,
              })
            }}
          >
            INFO
          </IconButton>
        </div>
        {mainSpaceRenderer({})}
        <div className={styles['controls']}>
          <Tooltip label='Close' aria-label='CLOSE'>
            <IconButton
              size='xs'
              aria-label="CLOSE"
              colorScheme='red'
              variant='outline'
              isRound
              icon={<IoMdClose size={15} />}
              onClick={onClose}
            >
              CLOSE
            </IconButton>
          </Tooltip>
          <Tooltip label={fullHeight ? 'Half height' : 'Full height'} aria-label='HALF_HEIGHT'>
            <IconButton
              size='xs'
              aria-label="-HALF_HEIGHT"
              colorScheme='gray'
              variant='outline'
              isRound
              icon={!fullHeight ? <BiUpArrowAlt size={15} /> : <BiDownArrowAlt size={15} />}
              onClick={toggleFullHeight}
            >
              HALF_HEIGHT
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className={clsx(styles['container'])}>
        {children}
      </div>
    </div>
  )
})

// , { [styles['container--fullHeight']]: fullHeight, [styles['container--maxHeightLimited']]: !fullHeight }
