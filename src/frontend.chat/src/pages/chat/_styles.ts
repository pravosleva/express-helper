import React from 'react'
import { useTheme } from "@chakra-ui/react"

export const useStyles: () => {[key: string]: React.CSSProperties} = () => {
  const theme = useTheme()
  console.log(theme.config)

  return {
    roomContent: {
      
    }
  }
}

/* theme obj keys:
[
  "direction",
  "breakpoints",
  "zIndices",
  "radii",
  "blur",
  "colors",
  "letterSpacings",
  "lineHeights",
  "fontWeights",
  "fonts",
  "fontSizes",
  "sizes",
  "shadows",
  "space",
  "borders",
  "transition",
  "components",
  "styles",
  "config",
  "container",
  "Button",
  "MenuList",
  "MenuItem",
  "__cssVars",
  "__cssMap",
  "__breakpoints"
]
*/