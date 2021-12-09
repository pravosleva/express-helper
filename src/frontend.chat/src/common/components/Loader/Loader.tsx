import React from 'react'
import { PulseLoader } from 'react-spinners'

interface IProps {
  isForImage?: boolean
}

export const Loader = ({ isForImage }: IProps) => {
  return (
    <div className={`fade-in-effect ${isForImage ? 'loader-wrapper loader-wrapper-for-image' : 'loader-wrapper'}`}>
      <PulseLoader size={15} margin={5} color='lightgray' loading={true} />
    </div>
  )
}