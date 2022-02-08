import React from 'react';

import logo from '../../images/logo.png';
import { BsHeartFill, BsInfoCircle } from 'react-icons/bs';

const Footer = () => (
  <div className="w-full flex md:justify-center justify-between items-center flex-col p-4 gradient-bg-footer">
    <div className="flex flex-[0.5] justify-center items-center">
      <img src={ logo } alt="logo" className="w-32"/>
    </div>


    <div className="sm:w-[90%] w-full flex justify-end items-center mt-3">
      <p className="text-white text-left text-xs flex">
        Made with &nbsp; <BsHeartFill fontSize={ 18 } color="red"/> &nbsp;
        by &nbsp;<a className="underline" href="https://github.com/matias-kupfer" target="_blank">Matias Kupfer</a>
      </p>
    </div>
  </div>
);

export default Footer;
