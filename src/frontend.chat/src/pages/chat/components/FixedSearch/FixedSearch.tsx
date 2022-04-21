import { useEffect, useRef } from 'react'
import styles from './FixedSearch.module.scss'
import clsx from 'clsx'
import { Grid, IconButton, Input, InputGroup, InputLeftElement, InputRightElement, useColorMode } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { HiChevronUp } from 'react-icons/hi'

type TProps = {
  searchText: string;
  onChange: (e: any) => void;
  onClear: () => void;
  name: string;
  isOpened: boolean;
  onClose: () => void;
}

export const FixedSearch = ({
  searchText,
  onChange,
  onClear,
  name,
  isOpened,
  onClose,
}: TProps) => {
  const mode = useColorMode()
  // const handkeKeyUp = (ev: any) => {
  //   if (ev.keyCode === 13) {
  //     if (!!searchText) onClose()
  //   }
  // }
  const inputRef = useRef<any>(null)
  useEffect(() => {
    if (isOpened && !!inputRef.current) inputRef.current.focus()
  }, [isOpened])

  return (
    <div
      className={clsx(
        styles['fixed-search'],
        {
          [styles['fixed-search--opened']]: isOpened,
        },
        styles[`themed-bg_${mode.colorMode}`],
        styles[`themed-bg_${mode.colorMode}_backdrop-blur`]
      )}>
      <div className={styles['search-input-wrapper']}>
        {/* <input
          value={searchText}
          name={name}
          onChange={onChange}
        /> */}
        <Grid
          templateColumns='1fr auto'
          gap={2}
          alignItems='center'
        >
          <InputGroup justifySelf='stretch'>
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.0em"
              children={<FiSearch color={mode.colorMode === 'light' ? '#FFF' : 'inherit'} />}
            />
            <Input
              ref={inputRef}
              name='searchText'
              type='text'
              placeholder="Search"
              value={searchText}
              onChange={onChange}
              rounded='3xl'
              size='md'
              variant='outline'
            />
            {
              !!searchText && (
                <InputRightElement>
                  <IconButton
                    size='xs'
                    aria-label="DEL"
                    colorScheme='red'
                    variant='outline'
                    isRound
                    icon={<IoMdClose size={15} />}
                    onClick={onClear}
                    isDisabled={!searchText}
                  >
                    DEL
                  </IconButton>
                </InputRightElement>
              )
            }
          </InputGroup>
          <IconButton
            size='xs'
            aria-label="DEL"
            colorScheme='gray'
            variant='outline'
            isRound
            icon={<HiChevronUp size={15} />}
            onClick={onClose}
          >
            DEL
          </IconButton>
        </Grid>
      </div>
    </div>
  )
}
