import { useEffect, useState } from 'react'
import clsx from 'clsx'
import styles from './Widget.module.scss'
import { useColorMode } from '@chakra-ui/react'

type TProps = {
  children: React.ReactElement;
  position: 'top-left' | 'top-right';
}

export const Widget = ({ children, position }: TProps) => {
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
        <div className={styles.content}>
          {children}
        </div>
        <button
          onClick={openToggler}
          className={styles.toggler}
        >⚙️</button>
      </div>
    </div>
  )
}
