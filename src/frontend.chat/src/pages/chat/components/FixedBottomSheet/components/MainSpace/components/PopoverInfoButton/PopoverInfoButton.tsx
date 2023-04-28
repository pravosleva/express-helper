import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useColorMode,
} from "@chakra-ui/react"

type TProps = {
  headerRenderer: React.FC<any>
  triggerRenderer: React.FC<any>
  bodyRenderer: React.FC<any>
  popoverPlacement?: 'bottom-start'
}

export const PopoverInfoButton = ({
  triggerRenderer,
  bodyRenderer,
  headerRenderer,
  popoverPlacement,
}: TProps) => {
  const mode = useColorMode()
  
  return (
    <Popover
      placement={popoverPlacement}
    >
      <PopoverTrigger>
        {triggerRenderer({})}
      </PopoverTrigger>
      <PopoverContent style={{ color: mode.colorMode === 'dark' ? '#FFF' : 'inherit' }}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>{headerRenderer({})}</PopoverHeader>
        <PopoverBody>
          {bodyRenderer({})}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
