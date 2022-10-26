import { Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger } from "@chakra-ui/react"

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
  return (
    <Popover
      placement={popoverPlacement}
    >
      <PopoverTrigger>
        {triggerRenderer({})}
      </PopoverTrigger>
      <PopoverContent>
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
