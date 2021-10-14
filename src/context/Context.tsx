import React, { createContext, useState } from 'react'

type ProviderTypes = {
    children: React.ReactNode
}

const state = {
    count: 0,
    decrement: function(){},
    increment: function(){}
}

export const Context = createContext(state)

export const Provider = ({ children }: ProviderTypes) => {
    const [count, setCount] = useState(0)
    const value = {
        count,
        decrement: () => {
            setCount(count - 1)
        },
        increment: () => {
            setCount(count + 1)
        }
    }
    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    )
}

// import React, { createContext, useState } from 'react'

// type ProviderTypes = {
//     children: React.ReactNode
// }

// const state = {
//     count: 0,
//     decrement: function(){},
//     increment: function(){}
// }

// export const Context = createContext(state)

// export const Provider = ({ children }: ProviderTypes) => {
//     const [count, setCount] = useState(0)
//     const value = {
//         count,
//         decrement: () => {
//             setCount(count - 1)
//         },
//         increment: () => {
//             setCount(count + 1)
//         }
//     }
//     return (
//         <Context.Provider value={value}>
//             {children}
//         </Context.Provider>
//     )
// }
