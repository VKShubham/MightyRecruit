import * as React from 'react';
import Select, { Props as SelectProps, GroupBase } from 'react-select';
import { defaultClassNames, defaultStyles } from './helper';
import {
    ClearIndicator,
    DropdownIndicator,
    MultiValueRemove,
    Option, 
    ValueContainer
} from './components';

type ReactSelectProps<OptionType> = SelectProps<OptionType, boolean, GroupBase<OptionType>>;

const ReactSelect = React.forwardRef<HTMLDivElement, ReactSelectProps<any>>((props) => {
    const {
        value,
        onChange,
        options = [],
        styles = defaultStyles,
        classNames = defaultClassNames,
        components = {},
        ...rest
    } = props;

    return (
        <Select
            // ref={ref}
            value={value}
            onChange={onChange}
            options={options}
            unstyled
            components={{
                DropdownIndicator,
                ClearIndicator,
                MultiValueRemove,
                Option,
                ValueContainer ,
                ...components
            }}
            styles={styles}
            classNames={{ ...defaultClassNames, ...classNames }}
            {...rest}
            menuPlacement="auto"
        />
    );
});

ReactSelect.displayName = 'ReactSelect';

export default ReactSelect;
