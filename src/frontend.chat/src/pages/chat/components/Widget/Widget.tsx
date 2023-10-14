import { useEffect, useState, memo } from 'react'
import clsx from 'clsx'
import styles from './Widget.module.scss'
import { useColorMode } from '@chakra-ui/react'
// const mode = useColorMode()

type TProps = {
  children: React.ReactElement;
  position: 'top-left' | 'top' | 'top-right' | 'bottom-left';
  isHalfHeight?: boolean
}

export const Widget = memo(({ children, position, isHalfHeight }: TProps) => {
  const [isOpened, setIsOpened] = useState<boolean>(false)
  const openToggler = () => {
    setIsOpened((s) => !s)
  }
  const mode = useColorMode()

  return (
    <div className={
      clsx(
        styles['widget-fixed'],
        styles[`widget-fixed_${mode.colorMode}`],
        styles[`widget-fixed--${position}`],
        {
          [styles[`widget-fixed--${position}_opened`]]: isOpened,
          [styles[`widget-fixed--${position}_closed`]]: !isOpened,
        }
      )
    }>
      <div
        className={styles['paper']}
      >
        <div className={clsx(styles.content, { [styles['half-height']]: !!isHalfHeight })}>
          <div className={clsx(styles['abs-box'], styles['abs-box_top'])} />
          {children}
          <div className={clsx(styles['abs-box'], styles['abs-box_bottom'])} />
        </div>
        <button
          onClick={openToggler}
          className={styles.toggler}
        >⚙️</button>
      </div>
    </div>
  )
})
