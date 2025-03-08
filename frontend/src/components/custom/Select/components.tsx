import { components } from 'react-select';
import { Check, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils';

export const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <ChevronDown className={'h-4 w-4 opacity-50'} />
        </components.DropdownIndicator>
    );
};

export const ClearIndicator = (props: any) => {
    return (
        <components.ClearIndicator {...props}>
            <X className={'h-3.5 w-3.5 opacity-50'} />
        </components.ClearIndicator>
    );
};

export const MultiValueRemove = (props: any) => {
    const { data } = props;
    return data.isFixed ? null : (
        <components.MultiValueRemove className='bg-red-100' {...props}>
            <X className={'h-3 w-3'} />
        </components.MultiValueRemove>
    );
};

export const ValueContainer = (props: any) => {
    const { children, getValue } = props;
    const selected = getValue(); // Get selected values

    if (selected.length > 2) {
        return (
            <components.ValueContainer {...props}>
                <div className="text-gray-600" title={`${selected.map((s: any) => s.label).join(', ')}`}>{selected.length} Selected</div>
            </components.ValueContainer>
        );
    }

    return <components.ValueContainer {...props}>{children}</components.ValueContainer>;
};


export const Option = (props: any) => {
    return (
        <components.Option {...props}>
            <div className={cn("flex items-center justify-between", props.isSelected && '')}>
                <div>{props.data.label}</div>
                {props.isSelected && <Check size={16} />}
            </div>
        </components.Option>
    );
};

export const CustomOption = (props: any) => {
    const { formatOptionLabel } = props.selectProps;

    return (
        <components.Option {...props}>
            {formatOptionLabel
                ? formatOptionLabel(props.data, { context: 'menu' })
                : props.data.label}
        </components.Option>
    );
}