import useThreads from '@/hooks/use-threads'
import { api } from '@/trpc/react'
import React from 'react'
import Avatar from 'react-avatar'
import Select from "react-select"

type Props = {
    placeholder: string,
    label: string,
    onChange: (value: { label: string, value: string }[]) => void,
    value: { label: string, value: string }[]
}

const TagInput = ({ label, onChange, placeholder, value }: Props) => {

    const { accountId } = useThreads();
    const { data: suggestions } = api.account.getSuggestions.useQuery({
        accountId
    })
    const [inputValue, setInputValue] = React.useState('');

    const options = suggestions?.map(suggestion => ({
        label: (
            <span className='flex items-center gap-2'>
                <Avatar
                    name={suggestion.address} size='25' textSizeRatio={2} round={true}
                />
                {suggestion.address}
            </span>
        ),
        value: suggestion.address
    }))

    // Styles for react-select for light/dark mode
    const customStyles = {
        control: (base: any) => ({
            ...base,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: '#2d3748', // Dark mode background (adjust based on your dark mode palette)
            color: '#fff', // Text color for dark mode
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: '#4a5568', // Background for selected values in dark mode
            color: '#fff',
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: '#fff', // Text color for selected values
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#4a5568' : '#2d3748', // Focused option background
            color: '#fff', // Text color for options
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#a0aec0', // Placeholder text color in dark mode
        }),
        input: (base: any) => ({
            ...base,
            color: '#fff', // Input text color in dark mode
        })
    };

    return (
        <div className='border rounded-md flex items-center'>
            <span className='ml-3 text-sm text-gray-500'>
                {label}
            </span>
            <Select
                onInputChange={setInputValue}
                value={value}
                onChange={(newValue) => onChange(newValue as { label: string, value: string }[])}
                placeholder={placeholder}
                //@ts-ignore
                options={inputValue ? options?.concat({
                    // @ts-ignore
                    label: inputValue,
                    value: inputValue
                }) : options}
                className='w-full flex-1'
                isMulti
                styles={customStyles} // Apply custom styles
            />
        </div>
    )
}

export default TagInput
