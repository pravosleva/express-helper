import styles from './FixedBottomSheet.module.scss'
import clsx from 'clsx'
import { Button, Grid, useColorMode } from '@chakra-ui/react'
import { useState, useCallback } from 'react'
import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi'
import { IoMdClose } from 'react-icons/io'

type TProps = {
  isOpened: boolean
  onClose: () => void
  children: React.ReactChild
}

export const FixedBottomSheet = ({ isOpened, onClose, children }: TProps) => {
  const [fullHeight, setFullHeight] = useState<boolean>(false)
  const toggleFullHeight = useCallback(() => {
    setFullHeight((s) => !s)
  }, [setFullHeight])
  const mode = useColorMode()

  return (
    <div
      className={clsx(
        styles['fixed-wrapper'],
        styles[`bg--${mode.colorMode}`],
        {
          [styles['fixed-wrapper--opened']]: isOpened,
          [styles['fixed-wrapper--fullHeight']]: fullHeight,
          [styles['fixed-wrapper--maxHeightLimited']]: !fullHeight
        }
      )}
    >
      <Grid templateColumns='1fr 1fr' gap={2} pr={4} pl={4} pt={2} pb={2} className={clsx(styles['controls'], styles[`bg--${mode.colorMode}`])}>
        <Button
          colorScheme='gray'
          variant='ghost'
          size='sm'
          onClick={toggleFullHeight}
          rightIcon={!fullHeight ? <BiUpArrowAlt size={15} /> : <BiDownArrowAlt size={15} />}
        >{fullHeight ? 'Half height' : 'Full height'}</Button>
        <Button
          colorScheme='gray'
          variant='ghost'
          size='sm'
          onClick={onClose}
          rightIcon={<IoMdClose size={15} />}
        >Close</Button>
      </Grid>
      <div className={clsx(styles['container'])}>
        {children}
      </div>
    </div>
  )
}

// , { [styles['container--fullHeight']]: fullHeight, [styles['container--maxHeightLimited']]: !fullHeight }
