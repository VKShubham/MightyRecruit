import { cn } from "@/lib/utils";
import { GroupBase, Props as SelectProps } from "react-select";

type ClassNameFunction = (state: any) => string;

type CustomClassNames = {
    clearIndicator?: ClassNameFunction;
    container?: ClassNameFunction;
    control?: ClassNameFunction;
    dropdownIndicator?: ClassNameFunction;
    group?: ClassNameFunction;
    groupHeading?: ClassNameFunction;
    indicatorsContainer?: ClassNameFunction;
    indicatorSeparator?: ClassNameFunction;
    input?: ClassNameFunction;
    loadingIndicator?: ClassNameFunction;
    loadingMessage?: ClassNameFunction;
    menu?: ClassNameFunction;
    menuList?: ClassNameFunction;
    menuPortal?: ClassNameFunction;
    multiValue?: ClassNameFunction;
    multiValueLabel?: ClassNameFunction;
    multiValueRemove?: ClassNameFunction;
    noOptionsMessage?: ClassNameFunction;
    option?: ClassNameFunction;
    placeholder?: ClassNameFunction;
    singleValue?: ClassNameFunction;
    valueContainer?: ClassNameFunction;
};

const controlStyles = {
    base: "flex !min-h-9 w-full rounded-md border border-input bg-transparent pl-3 py-1 pr-1 gap-1 text-sm transition-colors hover:cursor-pointer hover:border-primary/70",
    focus: "outline-none border-ring",
    disabled: "cursor-not-allowed opacity-60"
};

const placeholderStyles = "text-sm text-muted-foreground";
const valueContainerStyles = "gap-1";
const multiValueStyles =
    "inline-flex items-center gap-2 rounded-md border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-1.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
const multiValueRemoveStyles = "hover:bg-destructive hover:text-destructive-foreground";
const indicatorsContainerStyles = "gap-1";
const clearIndicatorStyles = "p-1 rounded-md hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-500";
const indicatorSeparatorStyles = "bg-border";
const dropdownIndicatorStyles = "p-1 rounded-md";
const menuStyles = "p-1 mt-1 border bg-popover shadow-md rounded-md text-popover-foreground";
const groupHeadingStyles = "py-2 px-1 text-secondary-foreground text-sm font-semibold";
const optionStyles = {
    base: "hover:cursor-pointer px-2 py-1.5 rounded-xs !text-sm cursor-default !select-none !outline-none",
    focus: "active:bg-accent/90 bg-accent text-accent-foreground",
    disabled: "pointer-events-none opacity-60",
    selected: "bg-primary/10 hover:bg-primary/10 font-semibold"
};
const noOptionsMessageStyles = "text-accent-foreground p-2 bg-accent border border-dashed border-border rounded-xs";
const loadingIndicatorStyles = "flex items-center justify-center h-4 w-4 opacity-50";
const loadingMessageStyles = "text-accent-foreground p-2 bg-accent";

export const createClassNames = (classNames: Partial<CustomClassNames>): CustomClassNames => {
    return {
        clearIndicator: (state) => cn(clearIndicatorStyles, classNames?.clearIndicator?.(state)),
        container: (state) => cn(classNames?.container?.(state) || ""),
        control: (state) => cn(
            controlStyles.base,
            state.isDisabled && controlStyles.disabled,
            state.isFocused && controlStyles.focus,
            classNames?.control?.(state) || ""
        ),
        dropdownIndicator: (state) => cn(dropdownIndicatorStyles, classNames?.dropdownIndicator?.(state)),
        group: (state) => cn(classNames?.group?.(state) || ""),
        groupHeading: (state) => cn(groupHeadingStyles, classNames?.groupHeading?.(state)),
        indicatorsContainer: (state) => cn(indicatorsContainerStyles, classNames?.indicatorsContainer?.(state)),
        indicatorSeparator: (state) => cn(indicatorSeparatorStyles, classNames?.indicatorSeparator?.(state)),
        input: (state) => cn(classNames?.input?.(state) || ""),
        loadingIndicator: (state) => cn(loadingIndicatorStyles, classNames?.loadingIndicator?.(state)),
        loadingMessage: (state) => cn(loadingMessageStyles, classNames?.loadingMessage?.(state)),
        menu: (state) => cn(menuStyles, classNames?.menu?.(state)),
        menuList: (state) => cn(classNames?.menuList?.(state) || ""),
        menuPortal: (state) => cn(classNames?.menuPortal?.(state) || ""),
        multiValue: (state) => cn(multiValueStyles, classNames?.multiValue?.(state)),
        multiValueLabel: (state) => cn(classNames?.multiValueLabel?.(state) || ""),
        multiValueRemove: (state) => cn(multiValueRemoveStyles, classNames?.multiValueRemove?.(state)),
        noOptionsMessage: (state) => cn(noOptionsMessageStyles, classNames?.noOptionsMessage?.(state)),
        option: (state) => cn(
            optionStyles.base,
            state.isFocused && optionStyles.focus,
            state.isDisabled && optionStyles.disabled,
            state.isSelected && optionStyles.selected,
            classNames?.option?.(state) || ""
        ),
        placeholder: (state) => cn(placeholderStyles, classNames?.placeholder?.(state)),
        singleValue: (state) => cn(classNames?.singleValue?.(state) || ""),
        valueContainer: (state) => cn(valueContainerStyles, classNames?.valueContainer?.(state))
    };
};

export const defaultClassNames = createClassNames({});

export const defaultStyles: SelectProps<any, boolean, GroupBase<any>>["styles"] = {
    input: (base) => ({
        ...base,
        "input:focus": {
            boxShadow: "none"
        }
    }),
    multiValueLabel: (base) => ({
        ...base,
        whiteSpace: "normal",
        overflow: "visible"
    }),
    control: (base) => ({
        ...base,
        transition: "none"
    }),
    menuList: (base) => ({
        ...base,
        "::-webkit-scrollbar": {
            background: "transparent"
        },
        "::-webkit-scrollbar-track": {
            background: "transparent"
        },
        "::-webkit-scrollbar-thumb": {
            background: "hsl(var(--border))"
        },
        "::-webkit-scrollbar-thumb:hover": {
            background: "transparent"
        }
    })
};
