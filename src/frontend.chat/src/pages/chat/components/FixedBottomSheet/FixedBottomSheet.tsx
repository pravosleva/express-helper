import styles from './FixedBottomSheet.module.scss'
import clsx from 'clsx'
import { Button, Grid } from '@chakra-ui/react'
import { useState, useCallback } from 'react'

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

  return (
    <div
      className={clsx(styles['fixed-wrapper'], {
        [styles['fixed-wrapper--opened']]: isOpened,
        [styles['fixed-wrapper--fullHeight']]: fullHeight,
        [styles['fixed-wrapper--maxHeightLimited']]: !fullHeight
      })}>

      <Grid templateColumns='1fr 1fr' gap={2} pr={4} pl={4} pt={2} pb={2} className={styles['controls']}>
        <Button size='sm' onClick={toggleFullHeight}>Full height</Button>
        <Button size='sm' onClick={onClose}>Close</Button>
      </Grid>
      <div className={clsx(styles['container'])}>
        {children}
      </div>
    </div>
  )
}

// , { [styles['container--fullHeight']]: fullHeight, [styles['container--maxHeightLimited']]: !fullHeight }
