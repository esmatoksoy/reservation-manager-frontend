import React from "react";
import { Button as AntdButton, ButtonProps as AntdButtonProps } from "antd";

type ButtonProps = AntdButtonProps & {};

export const Button = (props: ButtonProps) => {
  return (
    <AntdButton {...props} />
  );
};