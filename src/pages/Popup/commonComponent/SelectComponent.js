import { Select } from 'antd';
import React from 'react';

const SelectComponent = (props) => {
  const { children, className = '', ...rest } = props;

  return (
    <Select
      showAction={['focus']}
      className={`select-width ${className}`}
      placeholder="Select or Search"
      optionFilterProp="children"
      getPopupContainer={(trigger) => trigger.parentNode}
      showSearch
      allowClear
      {...rest}
    >
      {children}
    </Select>
  );
};

export default SelectComponent;

SelectComponent.Option = Select.Option;
SelectComponent.OptGroup = Select.OptGroup;
